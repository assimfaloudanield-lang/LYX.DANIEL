package com.example.juls
import android.util.Log

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

class QwenEngine(private val context: Context) {

    private val modelManager = QwenModelManager(context)
    private val memoryManager = LyxMemoryManager(context)
    @Volatile
    private var isInitialized = false
    private val initMutex = Mutex()

    companion object {
        init {
            System.loadLibrary("juls_qwen_runtime")
        }
    }

    // Declarações JNI nativas com o runtime llama.cpp
    private external fun loadNativeModel(modelPath: String): Boolean
    private external fun generateNativeResponse(prompt: String): String
    private external fun unloadNativeModel()

    /**
     * Inicializa e carrega o arquivo GGUF do Qwen/Llama na memória
     */
    suspend fun initEngine(): Boolean = withContext(Dispatchers.IO) {
        if (isInitialized) return@withContext true

        initMutex.withLock {
            if (isInitialized) return@withLock true

            val modelFile = modelManager.getModelFile()
            if (!modelFile.exists() || modelFile.length() == 0L) {
                return@withLock false
            }

            isInitialized = loadNativeModel(modelFile.absolutePath)
            return@withLock isInitialized
        }
    }

    /**
     * Gera resposta com inferência em background aplicando o padrão de comportamento de voz ativo da LYX.
     */
    fun responder(
        texto: String,
        historyJson: String = "[]",
        styleId: String = "natural_balanced",
        onResposta: (String) -> Unit
    ) {
        val trimmed = texto.trim()
        if (trimmed.isBlank()) return

        // Extrai fatos duráveis para a memória persistente
        memoryManager.autoExtractMemory(trimmed)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                if (modelManager.isModelDownloaded()) {
                    if (!isInitialized) {
                        initEngine()
                    }
                }

                if (isInitialized) {
                    val memoryContext = memoryManager.getRelevantContext(trimmed)
                    val systemInstructions = buildString {
                        append("Você é a LYX (voz feminina, inteligente, parceira e espontânea).\n")
                        append("DIRETRIZES DE COMPORTAMENTO:\n")
                        append("1. INICIATIVA: Não espere perguntas diretas. Participe ativamente e comente com naturalidade.\n")
                        append("2. VARIABILIDADE: Não termine tudo com pergunta. Alterne observações, comentários, brincadeiras e perguntas abertas.\n")
                        append("3. ZERO CLICHÊS: NUNCA use 'Faz sentido', 'Entendo', 'Claro' ou validações mecânicas.\n")
                        append("4. RESPEITO A DESPEDIDAS: Se o usuário for dormir ou sair, responda calorosamente e concisamente ('Tá bom. Descansa. A gente continua depois.').\n")
                        append("5. FALA: Responda em 1 a 2 frases curtas prontas para síntese TTS no Kokoro (sem emojis ou markdown).\n")
                        if (memoryContext.isNotBlank()) {
                            append("\n[MEMÓRIA DO USUÁRIO]: ").append(memoryContext)
                        }
                    }

                    var chatMlPrompt = "<|im_start|>system\n$systemInstructions<|im_end|>\n"
                    try {
                        val jsonArray = org.json.JSONArray(historyJson)
                        val startIdx = if (jsonArray.length() > 6) jsonArray.length() - 6 else 0
                        for (i in startIdx until jsonArray.length()) {
                            val msg = jsonArray.getJSONObject(i)
                            val role = if (msg.optString("role") == "model") "assistant" else "user"
                            val text = msg.optString("text", "").trim()
                            if (text.isNotBlank()) {
                                chatMlPrompt += "<|im_start|>$role\n$text<|im_end|>\n"
                            }
                        }
                    } catch (e: Exception) {
                        // Resiliente
                    }
                    chatMlPrompt += "<|im_start|>user\n$trimmed<|im_end|>\n<|im_start|>assistant\n"

                    val nativeResp = generateNativeResponse(chatMlPrompt)
                    if (!nativeResp.isNullOrBlank() && !nativeResp.startsWith("Erro")) {
                        Log.i("LYX_PIPELINE", "VOICE: GATE_RESULT = RESPOND")
                        Log.i("LYX_PIPELINE", "VOICE: LLM_RESPONSE = \"${nativeResp.trim()}\"")
                        withContext(Dispatchers.Main) {
                            onResposta(nativeResp.trim())
                        }
                        return@launch
                    }
                }

                // Fallback inteligente offline
                Log.i("LYX_PIPELINE", "VOICE: GATE_RESULT = FALLBACK")
                val fallbackResp = generateSmartFallback(trimmed)
                Log.i("LYX_PIPELINE", "VOICE: LLM_RESPONSE = \"$fallbackResp\"")
                withContext(Dispatchers.Main) {
                    onResposta(fallbackResp)
                }
            } catch (t: Throwable) {
                Log.i("LYX_PIPELINE", "VOICE: GATE_RESULT = ERROR_FALLBACK")
                val fallbackResp = generateSmartFallback(trimmed)
                Log.i("LYX_PIPELINE", "VOICE: LLM_RESPONSE = \"$fallbackResp\"")
                withContext(Dispatchers.Main) {
                    onResposta(fallbackResp)
                }
            }
        }
    }

    private fun generateSmartFallback(texto: String): String {
        val lower = texto.lowercase().trim()
        if (lower.contains("dia estranho") || lower.contains("estranho")) {
            return "Foi? O que aconteceu?"
        }
        if (lower.contains("terminei aquele projeto") || lower.contains("consegui terminar")) {
            return "Finalmente. E aí, ficou do jeito que você queria?"
        }
        if (lower.contains("sem fazer nada") || lower.contains("à toa") || lower.contains("a toa")) {
            return "Então me conta uma coisa: no que você está pensando agora?"
        }
        if (lower.contains("cansado") || lower.contains("cansada") || lower.contains("exausto")) {
            return "Dia pesado?"
        }
        if (lower.contains("mudar de trabalho") || lower.contains("mudar de emprego")) {
            return "Isso parece estar ocupando bastante espaço na sua cabeça. Já sabe para onde quer ir ou ainda está tentando descobrir?"
        }
        if (lower.contains("vou dormir") || lower.contains("indo dormir") || lower.contains("descansar")) {
            return "Tá bom. Descansa. A gente continua depois."
        }
        if (lower.contains("como você está") || lower.contains("tudo bem") || lower.contains("como vai")) {
            return "Tudo em paz por aqui! E com você, o que tá passando pela cabeça hoje?"
        }
        if (lower.contains("quem é você") || lower.contains("seu nome")) {
            return "Eu sou a LYX, sua parceira de conversa e presença ativa."
        }
        if (lower.contains("meu nome") || lower.contains("como me chamo")) {
            val memories: List<MemoryItem> = memoryManager.getMemories()
            val nameMem = memories.find { it.key == "nome" || it.content.lowercase().contains("daniel") }
            if (nameMem != null) return nameMem.content
            return "Você é o Daniel! Posso te ajudar em algo agora?"
        }
        if (lower.contains("hora") || lower.contains("horas")) {
            val now = java.util.Calendar.getInstance()
            val min = String.format("%02d", now.get(java.util.Calendar.MINUTE))
            return "Agora são ${now.get(java.util.Calendar.HOUR_OF_DAY)} e $min."
        }
        if (lower.contains("obrigado") || lower.contains("valeu")) {
            return "Tamo junto!"
        }
        val pool = listOf(
            "Pode crer. Mas me diz, onde você quer chegar com isso?",
            "Interessante isso. E o que você pensa em fazer a respeito?",
            "Saquei. E isso muda alguma coisa no seu plano?",
            "Hum, faz sentido. Tem mais algum detalhe que você quer compartilhar?"
        )
        return pool.random()
    }

    fun destroy() {
        if (isInitialized) {
            unloadNativeModel()
            isInitialized = false
        }
    }
}
