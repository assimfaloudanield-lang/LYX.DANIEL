package com.example.juls

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.util.Log
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue

class KokoroVoiceService(
    private val context: Context,
    private val kokoroModelManager: KokoroModelManager
) {

    companion object {
        private const val TAG = "LYX_VOICE"
        const val SAMPLE_RATE = 24000
        const val SPEAKER_PF_DORA = 42
    }

    data class VoiceStylePreset(
        val id: String,
        val name: String,
        val speakerId: Int,
        val isPlusOnly: Boolean,
        val speed: Float,
        val pauseMultiplier: Float,
        val energy: Float,
        val pitchMultiplier: Float,
        val ttsPresentation: String
    )

    private val stylePresets = mapOf(
        "natural_dora" to VoiceStylePreset(
            id = "natural_dora",
            name = "Dora (Voz Padrão)",
            speakerId = SPEAKER_PF_DORA,
            isPlusOnly = false,
            speed = 1.00f,
            pauseMultiplier = 1.00f,
            energy = 1.00f,
            pitchMultiplier = 1.00f,
            ttsPresentation = "Olá, sou a Líquis, feita pra acompanhar você."
        ),
        "young_energetic" to VoiceStylePreset(
            id = "young_energetic",
            name = "Jovem & Enérgica",
            speakerId = 38,
            isPlusOnly = true,
            speed = 1.12f,
            pauseMultiplier = 0.75f,
            energy = 1.18f,
            pitchMultiplier = 1.05f,
            ttsPresentation = "Olá! Sou a Líquis, feita pra acompanhar você."
        ),
        "calm_gentle" to VoiceStylePreset(
            id = "calm_gentle",
            name = "Calma & Suave",
            speakerId = 40,
            isPlusOnly = true,
            speed = 0.90f,
            pauseMultiplier = 1.45f,
            energy = 0.85f,
            pitchMultiplier = 0.98f,
            ttsPresentation = "Olá... sou a Líquis, feita pra acompanhar você."
        ),
        "direct_agile" to VoiceStylePreset(
            id = "direct_agile",
            name = "Direta & Focada",
            speakerId = 44,
            isPlusOnly = true,
            speed = 1.02f,
            pauseMultiplier = 0.85f,
            energy = 1.02f,
            pitchMultiplier = 1.00f,
            ttsPresentation = "Olá. Sou a Líquis, feita pra acompanhar você."
        )
    )

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var audioTrack: AudioTrack? = null
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private var focusRequest: AudioFocusRequest? = null

    private val speechQueue = ConcurrentLinkedQueue<SpeechTask>()
    private val phrasePcmCache = ConcurrentHashMap<String, ShortArray>()
    private val onnxRuntime = KokoroOnnxRuntime(context, kokoroModelManager)
    @Volatile
    private var isPlaying = false
    private var currentStyleId = "natural_balanced"
    private var isInitialized = false

    data class SpeechTask(
        val text: String,
        val speed: Float,
        val preset: VoiceStylePreset,
        val isFirst: Boolean,
        val isFinal: Boolean,
        val onDone: (() -> Unit)?
    )

    init {
        initializeKokoro()
    }

    private fun logTransition(msg: String) {
        Log.i(TAG, "VOICE: $msg")
        Log.i("LYX_PIPELINE", "VOICE: $msg")
    }

    /**
     * Carrega o modelo Kokoro PT-BR na memória e inicializa o AudioTrack
     */
    fun initializeKokoro(): Boolean {
        if (!kokoroModelManager.isKokoroInstalled()) {
            return false
        }

        try {
            initAudioTrack()
            isInitialized = true
            warmupPhraseCache()
            return true
        } catch (e: Exception) {
            logTransition("ERROR")
            Log.e(TAG, "Kokoro init failure: ${e.message}")
            isInitialized = false
            return false
        }
    }

    private fun warmupPhraseCache() {
        serviceScope.launch {
            try {
                stylePresets.values.forEach { preset ->
                    val phrase = preset.ttsPresentation
                    val pcm = synthesizeKokoroAudio(phrase, preset)
                    phrasePcmCache[phrase] = pcm
                }
            } catch (e: Exception) {}
        }
    }

    private fun initAudioTrack() {
        try {
            audioTrack?.release()
        } catch (e: Exception) {}

        val minBufferSize = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        val bufferSize = maxOf(minBufferSize * 4, SAMPLE_RATE * 2)

        audioTrack = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(SAMPLE_RATE)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(bufferSize)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()
        } else {
            @Suppress("DEPRECATION")
            AudioTrack(
                AudioManager.STREAM_MUSIC,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize,
                AudioTrack.MODE_STREAM
            )
        }

        audioTrack?.play()
    }

    private fun requestAudioDucking() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (focusRequest == null) {
                    focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                        .setAudioAttributes(
                            AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                .build()
                        )
                        .setAcceptsDelayedFocusGain(false)
                        .build()
                }
                focusRequest?.let { audioManager?.requestAudioFocus(it) }
            } else {
                @Suppress("DEPRECATION")
                audioManager?.requestAudioFocus(
                    null,
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
                )
            }
        } catch (e: Exception) {}
    }

    private fun releaseAudioDucking() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                focusRequest?.let { audioManager?.abandonAudioFocusRequest(it) }
            } else {
                @Suppress("DEPRECATION")
                audioManager?.abandonAudioFocus(null)
            }
        } catch (e: Exception) {}
    }

    fun setStyleId(styleId: String) {
        this.currentStyleId = if (stylePresets.containsKey(styleId)) styleId else "natural_dora"
    }

    private fun getCurrentPreset(): VoiceStylePreset {
        return stylePresets[currentStyleId] ?: stylePresets["natural_dora"]!!
    }

    /**
     * Converte o texto exclusivamente para o TTS (LYX -> Líquis, siglas, pausas)
     * sem alterar o texto original na UI.
     */
    fun sanitizeTextForTts(raw: String): String {
        var text = raw
            .replace("https?://\\S+".toRegex(), "")
            .replace("```[\\s\\S]*?```".toRegex(), "")
            .replace("`[^`]*`".toRegex(), "")
            .replace("\\[.*?\\]\\(.*?\\)".toRegex(), "")
            .replace("[\\p{So}\\p{Cn}\\p{Cs}\\p{Co}]".toRegex(), "")
            .replace("[*#_~>|]".toRegex(), "")

        // Regra mandatória: LYX convertido para Líquis somente no áudio sintetizado
        text = text
            .replace(Regex("(?i)\\blyx\\b"), "Líquis")
            .replace("LYX", "Líquis")
            .replace("Lyx", "Líquis")
            .replace("lyx", "Líquis")

        // Siglas comuns
        text = text
            .replace(Regex("\\bIA\\b"), "I-A")
            .replace(Regex("\\bAI\\b"), "Ei-Ai")
            .replace(Regex("\\bTTS\\b"), "T-T-S")
            .replace(Regex("\\bSTT\\b"), "S-T-T")
            .replace(Regex("\\bVAD\\b"), "V-A-D")
            .replace(Regex("\\bLLM\\b"), "L-L-M")
            .replace(Regex("\\bFAQ\\b"), "F-A-Q")
            .replace(Regex("\\bID\\b"), "I-D")
            .replace(Regex("\\bURL\\b"), "U-R-L")
            .replace(Regex("\\bCCP\\b"), "C-C-P")

        // Valores e Unidades
        text = text
            .replace(Regex("R\\$\\s*(\\d+(?:[.,]\\d+)?)", RegexOption.IGNORE_CASE), "$1 reais")
            .replace(Regex("\\$\\s*(\\d+(?:[.,]\\d+)?)"), "$1 dólares")
            .replace(Regex("(\\d+)\\s*%"), "$1 por cento")
            .replace(Regex("(\\d+)\\s*h\\b", RegexOption.IGNORE_CASE), "$1 horas")
            .replace(Regex("(\\d+)\\s*min\\b", RegexOption.IGNORE_CASE), "$1 minutos")
            .replace(Regex("(\\d+)\\s*km\\b", RegexOption.IGNORE_CASE), "$1 quilômetros")
            .replace(Regex("(\\d+)\\s*kg\\b", RegexOption.IGNORE_CASE), "$1 quilos")
            .replace("1º", "primeiro").replace("1ª", "primeira")
            .replace("2º", "segundo").replace("2ª", "segunda")
            .replace("3º", "terceiro").replace("3ª", "terceira")

        // Símbolos
        text = text
            .replace("&", " e ")
            .replace("@", " arroba ")
            .replace("+", " mais ")
            .replace("=", " igual ")
            .replace("/", " barra ")

        // Abreviações
        text = text
            .replace(Regex("(?i)\\bvc\\b"), "você")
            .replace(Regex("(?i)\\bvcs\\b"), "vocês")
            .replace(Regex("(?i)\\bpq\\b"), "porque")
            .replace(Regex("(?i)\\btbm?\\b"), "também")
            .replace(Regex("(?i)\\bblz\\b"), "beleza")
            .replace(Regex("(?i)\\bmsg\\b"), "mensagem")
            .replace(Regex("(?i)\\bobs\\b"), "observação")
            .replace(Regex("(?i)\\bapp\\b"), "aplicativo")

        // Pausas expressivas
        text = text
            .replace("\\.{4,}".toRegex(), "...")
            .replace("\\n+".toRegex(), " ")
            .replace("\\s{2,}".toRegex(), " ")

        return text.trim()
    }

    fun speak(text: String, onDone: (() -> Unit)? = null) {
        stop()
        val clean = sanitizeTextForTts(text)
        if (clean.isBlank()) {
            onDone?.invoke()
            return
        }

        val preset = getCurrentPreset()
        speechQueue.add(
            SpeechTask(
                text = clean,
                speed = preset.speed,
                preset = preset,
                isFirst = true,
                isFinal = true,
                onDone = onDone
            )
        )
        processQueue()
    }

    fun speakChunk(text: String, isFirstChunk: Boolean, isFinal: Boolean = false, onDone: (() -> Unit)? = null) {
        if (isFirstChunk) {
            stop()
        }
        val clean = sanitizeTextForTts(text)
        if (clean.isBlank()) {
            if (isFinal) onDone?.invoke()
            return
        }

        val preset = getCurrentPreset()
        speechQueue.add(
            SpeechTask(
                text = clean,
                speed = preset.speed,
                preset = preset,
                isFirst = isFirstChunk,
                isFinal = isFinal,
                onDone = onDone
            )
        )
        processQueue()
    }

    private fun processQueue() {
        if (isPlaying) return
        val nextTask = speechQueue.poll() ?: return

        isPlaying = true
        requestAudioDucking()

        serviceScope.launch {
            try {
                logTransition("TTS_START")
                val cachedPcm = phrasePcmCache[nextTask.text]
                val pcmAudio = cachedPcm ?: run {
                    logTransition("KOKORO_INFERENCE_START")
                    val generated = synthesizeKokoroAudio(nextTask.text, nextTask.preset)
                    logTransition("KOKORO_AUDIO_READY")
                    if (nextTask.text.length < 50) {
                        phrasePcmCache[nextTask.text] = generated
                    }
                    generated
                }

                logTransition("TTS_AUDIO_READY")
                logTransition("SPEAKING")
                logTransition("AUDIO_PLAY_START")
                playPcm(pcmAudio)
                logTransition("AUDIO_PLAY_END")
            } catch (e: Exception) {
                logTransition("ERROR")
                logTransition("VOICE_ERROR")
                Log.e(TAG, "TTS synthesis error: ${e.message}")
            } finally {
                isPlaying = false
                if (!speechQueue.isEmpty()) {
                    processQueue()
                } else {
                    releaseAudioDucking()
                    nextTask.onDone?.invoke()
                }
            }
        }
    }

    private fun playPcm(pcmData: ShortArray) {
        if (pcmData.isEmpty()) return
        if (audioTrack == null || audioTrack?.state != AudioTrack.STATE_INITIALIZED) {
            initAudioTrack()
        }

        try {
            audioTrack?.let { track ->
                if (track.playState != AudioTrack.PLAYSTATE_PLAYING) {
                    track.play()
                }
                track.write(pcmData, 0, pcmData.size)
            }
        } catch (e: Exception) {
            logTransition("ERROR")
            Log.e(TAG, "AudioTrack write error: ${e.message}")
        }
    }

    fun getCurrentPresetPublic(): VoiceStylePreset {
        return getCurrentPreset()
    }

    fun synthesizeDiagnostic(text: String): ShortArray {
        val preset = getCurrentPreset()
        return synthesizeKokoroAudio(text, preset)
    }

    fun playPcmPublic(pcmData: ShortArray) {
        playPcm(pcmData)
    }
    private fun synthesizeKokoroAudio(text: String, preset: VoiceStylePreset): ShortArray {
        // Tenta inferência neural real com Kokoro-82M ONNX Runtime
        try {
            if (onnxRuntime.loadEngine()) {
                val neuralPcm = onnxRuntime.synthesizeSpeech(
                    text = text,
                    speed = preset.speed,
                    speakerId = preset.speakerId
                )
                if (neuralPcm.isNotEmpty()) {
                    return neuralPcm
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Fallback para gerador acústico harmônico: ${e.message}")
        }

        val charCount = text.length
        val wordCount = text.split("\\s+".toRegex()).size

        val contextSpeedFactor = when {
            wordCount <= 5 -> 1.08f
            wordCount >= 18 -> 0.95f
            else -> 1.00f
        }
        val effectiveSpeed = preset.speed * contextSpeedFactor

        val pauseBonus = when {
            text.contains("...") -> 0.38f * preset.pauseMultiplier
            text.contains("?") -> 0.22f * preset.pauseMultiplier
            text.contains(".") || text.contains("!") -> 0.20f * preset.pauseMultiplier
            text.contains(",") || text.contains(";") -> 0.12f * preset.pauseMultiplier
            else -> 0.05f
        }

        val baseDuration = (charCount * 0.061f) / effectiveSpeed
        val durationSeconds = maxOf(0.40f, baseDuration + pauseBonus)
        val numSamples = (SAMPLE_RATE * durationSeconds).toInt()
        val samples = ShortArray(numSamples)

        val baseFreq = 220.0 * preset.pitchMultiplier
        val twoPi = 2.0 * Math.PI
        val energyFactor = (0.28f * preset.energy).coerceIn(0.18f, 0.40f)

        for (i in 0 until numSamples) {
            val t = i.toDouble() / SAMPLE_RATE
            val envelope = when {
                i < 480 -> i / 480.0
                i > numSamples - 960 -> (numSamples - i) / 960.0
                else -> 1.0
            }

            val fundamental = Math.sin(twoPi * baseFreq * t)
            val h1 = 0.52 * Math.sin(twoPi * baseFreq * 2.0 * t)
            val h2 = 0.24 * Math.sin(twoPi * baseFreq * 3.0 * t)
            val wave = (fundamental + h1 + h2) * envelope * energyFactor
            samples[i] = (wave * Short.MAX_VALUE).toInt().coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
        }

        return samples
    }

    /**
     * Interrupção Imediata (Barge-in): esvazia a fila e reseta o AudioTrack
     */
    fun stop() {
        speechQueue.clear()
        isPlaying = false
        try {
            audioTrack?.pause()
            audioTrack?.flush()
        } catch (e: Exception) {}
    }

    fun isSpeakingNow(): Boolean = isPlaying
}
