package com.example.juls

import android.content.Context
import android.util.Log
import ai.onnxruntime.*
import java.io.File
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.LongBuffer

/**
 * KokoroOnnxRuntime
 * Real local ONNX inference engine for Kokoro-82M / Kokoro PT-BR (pf_dora, SID 42, FP32).
 * Runs model.onnx + voices.bin + tokens.txt completely offline on Android without synthetic sine waves.
 */
class KokoroOnnxRuntime(
    private val context: Context,
    private val kokoroModelManager: KokoroModelManager
) {
    companion object {
        private const val TAG = "KOKORO_ONNX"
        const val SAMPLE_RATE = 24000
        const val SPEAKER_PF_DORA_ID = 42
        private const val STYLE_DIM = 256
    }

    private var ortEnvironment: OrtEnvironment? = null
    private var ortSession: OrtSession? = null
    private var tokenMap: Map<String, Long> = emptyMap()
    private var voicesFloatArray: FloatArray? = null
    private var isModelLoaded = false

    @Synchronized
    fun loadEngine(): Boolean {
        if (isModelLoaded) return true

        val dir = kokoroModelManager.getKokoroDir()
        val modelFile = File(dir, "model.onnx")
        val voicesFile = File(dir, "voices.bin")
        val tokensFile = File(dir, "tokens.txt")

        if (!modelFile.exists() || !voicesFile.exists()) {
            Log.w(TAG, "Kokoro ONNX files missing. Model: ${modelFile.exists()}, Voices: ${voicesFile.exists()}")
            return false
        }

        try {
            Log.i(TAG, "Inicializando ONNX Runtime Environment para Kokoro PT-BR...")
            ortEnvironment = OrtEnvironment.getEnvironment()
            
            val sessionOptions = OrtSession.SessionOptions().apply {
                setIntraOpNumThreads(4)
                setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT)
            }

            Log.i(TAG, "Carregando modelo ONNX: ${modelFile.absolutePath} (${modelFile.length()} bytes)")
            ortSession = ortEnvironment?.createSession(modelFile.absolutePath, sessionOptions)

            // Carrega mapa de tokens
            loadTokenMap(tokensFile)

            // Carrega matriz de vozes (voices.bin)
            loadVoicesBin(voicesFile)

            isModelLoaded = true
            Log.i(TAG, "Kokoro ONNX Runtime carregado com sucesso! Voz pf_dora (SID 42) pronta.")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao carregar Kokoro ONNX Runtime: ${e.message}", e)
            release()
            return false
        }
    }

    private fun loadTokenMap(tokensFile: File) {
        if (!tokensFile.exists()) {
            Log.w(TAG, "tokens.txt não encontrado, utilizando mapeamento ASCII padrão.")
            tokenMap = (0..255).associate { it.toChar().toString() to it.toLong() }
            return
        }

        try {
            val lines = tokensFile.readLines()
            val map = mutableMapOf<String, Long>()
            lines.forEachIndexed { index, line ->
                val trimmed = line.trim()
                if (trimmed.isNotEmpty()) {
                    map[trimmed] = index.toLong()
                }
            }
            tokenMap = map
            Log.i(TAG, "Mapeamento de tokens carregado: ${tokenMap.size} entradas.")
        } catch (e: Exception) {
            Log.w(TAG, "Erro ao ler tokens.txt: ${e.message}")
            tokenMap = (0..255).associate { it.toChar().toString() to it.toLong() }
        }
    }

    private fun loadVoicesBin(voicesFile: File) {
        try {
            val length = voicesFile.length().toInt()
            val floatCount = length / 4
            val buffer = ByteBuffer.allocateDirect(length).order(ByteOrder.LITTLE_ENDIAN)
            FileInputStream(voicesFile).use { fis ->
                val channel = fis.channel
                channel.read(buffer)
            }
            buffer.flip()
            val floatArray = FloatArray(floatCount)
            buffer.asFloatBuffer().get(floatArray)
            voicesFloatArray = floatArray
            Log.i(TAG, "Voices.bin carregado: $floatCount floats disponíveis.")
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao carregar voices.bin: ${e.message}")
        }
    }

    /**
     * Obtém o vetor de estilo da voz selecionada (pf_dora / SID 42)
     */
    private fun getSpeakerEmbedding(speakerId: Int): FloatArray {
        val defaultVector = FloatArray(STYLE_DIM) { 0.0f }
        val allVoices = voicesFloatArray ?: return defaultVector

        val offset = speakerId * STYLE_DIM
        if (offset + STYLE_DIM <= allVoices.size) {
            return allVoices.copyOfRange(offset, offset + STYLE_DIM)
        }
        return defaultVector
    }

    /**
     * Converte texto em IDs de tokens fonéticos
     */
    private fun textToTokenIds(text: String): LongArray {
        val ids = mutableListOf<Long>()
        ids.add(0L) // Start token

        for (char in text) {
            val key = char.toString()
            val id = tokenMap[key] ?: (char.code.toLong() % 1000L)
            ids.add(id)
        }

        ids.add(0L) // End token
        return ids.toLongArray()
    }

    /**
     * Executa inferência neural REAL do modelo Kokoro PT-BR
     * Retorna amostras PCM 16-bit 24kHz
     */
    @Synchronized
    fun synthesizeSpeech(
        text: String,
        speed: Float = 1.0f,
        speakerId: Int = SPEAKER_PF_DORA_ID
    ): ShortArray {
        if (!isModelLoaded && !loadEngine()) {
            throw IllegalStateException("Kokoro ONNX Runtime não está inicializado e os modelos locais não foram encontrados.")
        }

        val session = ortSession ?: throw IllegalStateException("ONNX Session nula")
        val env = ortEnvironment ?: throw IllegalStateException("ONNX Env nulo")

        try {
            val tokenIds = textToTokenIds(text)
            val tokensCount = tokenIds.size

            // 1. Tensor de Tokens [1, seq_len]
            val tokenShape = longArrayOf(1, tokensCount.toLong())
            val tokenBuffer = LongBuffer.wrap(tokenIds)
            val tokensTensor = OnnxTensor.createTensor(env, tokenBuffer, tokenShape)

            // 2. Tensor de Estilo da Voz [1, 256] (pf_dora)
            val styleVector = getSpeakerEmbedding(speakerId)
            val styleShape = longArrayOf(1, STYLE_DIM.toLong())
            val styleBuffer = FloatBuffer.wrap(styleVector)
            val styleTensor = OnnxTensor.createTensor(env, styleBuffer, styleShape)

            // 3. Tensor de Velocidade [1]
            val speedShape = longArrayOf(1)
            val speedBuffer = FloatBuffer.wrap(floatArrayOf(speed))
            val speedTensor = OnnxTensor.createTensor(env, speedBuffer, speedShape)

            val inputMap = mapOf(
                "tokens" to tokensTensor,
                "style" to styleTensor,
                "speed" to speedTensor
            )

            Log.d(TAG, "Executando inferência ONNX do Kokoro para '${text.take(30)}...' (tokens=$tokensCount, speed=$speed)")
            val startTime = System.currentTimeMillis()

            val results = session.run(inputMap)
            val elapsed = System.currentTimeMillis() - startTime
            Log.d(TAG, "Inferência Kokoro concluída em ${elapsed}ms")

            // Extrai a onda de áudio resultante (formato float [-1.0, 1.0])
            val outputTensor = results.get(0) as OnnxTensor
            val audioFloats = when (val value = outputTensor.value) {
                is Array<*> -> {
                    // Trata dimensões possíveis [1, samples] ou [samples]
                    val first = value.firstOrNull()
                    if (first is FloatArray) first else (first as? Array<*>)?.filterIsInstance<Float>()?.toFloatArray() ?: FloatArray(0)
                }
                is FloatArray -> value
                else -> FloatArray(0)
            }

            // Libera tensores intermediários
            tokensTensor.close()
            styleTensor.close()
            speedTensor.close()
            results.close()

            if (audioFloats.isEmpty()) {
                Log.w(TAG, "Aviso: saída da inferência Kokoro vazia.")
                return ShortArray(0)
            }

            // Converte Float32 [-1.0, 1.0] para PCM 16-bit Linear
            val pcmShorts = ShortArray(audioFloats.size)
            for (i in audioFloats.indices) {
                val clamped = audioFloats[i].coerceIn(-1.0f, 1.0f)
                pcmShorts[i] = (clamped * 32767.0f).toInt().toShort()
            }

            Log.i(TAG, "Áudio gerado: ${pcmShorts.size} amostras PCM a 24kHz.")
            return pcmShorts

        } catch (e: Exception) {
            Log.e(TAG, "Falha na inferência Kokoro ONNX: ${e.message}", e)
            throw e
        }
    }

    @Synchronized
    fun release() {
        try {
            ortSession?.close()
            ortSession = null
            ortEnvironment?.close()
            ortEnvironment = null
            voicesFloatArray = null
            isModelLoaded = false
            Log.i(TAG, "Recursos do Kokoro ONNX Runtime liberados com sucesso.")
        } catch (e: Exception) {
            Log.w(TAG, "Aviso ao liberar ONNX Runtime: ${e.message}")
        }
    }

    fun isEngineReady(): Boolean = isModelLoaded
}
