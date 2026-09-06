package com.example.juls

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log

class VoiceEngine(
    private val context: Context,
    private val onInterruption: (() -> Unit)? = null,
    private val onPartialText: ((String) -> Unit)? = null,
    private val onText: (String) -> Unit
) {

    companion object {
        private const val TAG = "LYX_VOICE"
        private const val SILENCE_TIMEOUT_MS = 450L
        private const val PROCESSING_TIMEOUT_MS = 8000L
        private const val LISTENING_MAX_IDLE_MS = 25000L
    }

    enum class State {
        IDLE,
        LISTENING,
        PROCESSING,
        SPEAKING
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private var recognizer: SpeechRecognizer? = null

    @Volatile
    private var currentState: State = State.IDLE

    @Volatile
    private var isAudioMuted = false

    @Volatile
    private var isPowerActive = false

    private var lastRecognizedText: String = ""
    private var hasDispatchedThisTurn = false
    private var isUserSpeaking = false

    fun getCurrentState(): State = currentState

    fun logTransition(name: String) {
        Log.i(TAG, "VOICE: $name")
        Log.i("LYX_PIPELINE", "VOICE: $name")
    }

    fun transitionTo(newState: State, reason: String = "") {
        mainHandler.post {
            if (currentState == newState && newState != State.IDLE) return@post
            currentState = newState

            when (newState) {
                State.IDLE -> {
                    logTransition("IDLE")
                    logTransition("STATE_IDLE")
                    cancelAllWatchdogs()
                    isUserSpeaking = false
                    lastRecognizedText = ""
                    hasDispatchedThisTurn = false
                    try {
                        recognizer?.cancel()
                    } catch (e: Exception) {
                        logTransition("VOICE_ERROR")
                    }
                    muteSystemSounds(false)

                    // Se a assistente estiver ativa, reabre LISTENING após breve proteção de áudio
                    if (isPowerActive) {
                        mainHandler.postDelayed({
                            if (isPowerActive && currentState == State.IDLE) {
                                transitionTo(State.LISTENING)
                            }
                        }, 300L)
                    }
                }
                State.LISTENING -> {
                    logTransition("LISTENING")
                    cancelAllWatchdogs()
                    isUserSpeaking = false
                    lastRecognizedText = ""
                    hasDispatchedThisTurn = false
                    muteSystemSounds(true)
                    startListeningInternal()
                    startListeningStallWatchdog()
                }
                State.PROCESSING -> {
                    logTransition("PROCESSING")
                    logTransition("PROCESSING_START")
                    cancelAllWatchdogs()
                    try {
                        recognizer?.cancel()
                    } catch (e: Exception) {
                        logTransition("VOICE_ERROR")
                    }
                    startProcessingWatchdog()
                }
                State.SPEAKING -> {
                    logTransition("SPEAKING")
                    cancelAllWatchdogs()
                    try {
                        recognizer?.cancel()
                    } catch (e: Exception) {}
                }
            }
        }
    }

    // --- WATCHDOGS ANTI-FROZEN ---
    private val silenceWatchdogRunnable = Runnable {
        if (currentState == State.LISTENING && isUserSpeaking && lastRecognizedText.isNotBlank() && !hasDispatchedThisTurn) {
            logTransition("SPEECH_END")
            try {
                recognizer?.stopListening()
            } catch (e: Exception) {}

            mainHandler.postDelayed({
                if (currentState == State.LISTENING && !hasDispatchedThisTurn && lastRecognizedText.isNotBlank()) {
                    dispatchResult(lastRecognizedText)
                }
            }, 80L)
        }
    }

    private val processingTimeoutRunnable = Runnable {
        if (currentState == State.PROCESSING) {
            logTransition("ERROR")
            Log.e(TAG, "Processing timeout: returning to IDLE")
            transitionTo(State.IDLE)
        }
    }

    private val listeningStallRunnable = Runnable {
        if (currentState == State.LISTENING && !isUserSpeaking) {
            try {
                recognizer?.cancel()
                startListeningInternal()
            } catch (e: Exception) {
                logTransition("ERROR")
                Log.e(TAG, "Listening stall recovery error: ${e.message}")
                transitionTo(State.IDLE)
            }
        }
    }

    private fun resetSilenceTimer() {
        mainHandler.removeCallbacks(silenceWatchdogRunnable)
        mainHandler.postDelayed(silenceWatchdogRunnable, SILENCE_TIMEOUT_MS)
    }

    private fun cancelSilenceTimer() {
        mainHandler.removeCallbacks(silenceWatchdogRunnable)
    }

    private fun startProcessingWatchdog() {
        mainHandler.removeCallbacks(processingTimeoutRunnable)
        mainHandler.postDelayed(processingTimeoutRunnable, PROCESSING_TIMEOUT_MS)
    }

    private fun startListeningStallWatchdog() {
        mainHandler.removeCallbacks(listeningStallRunnable)
        mainHandler.postDelayed(listeningStallRunnable, LISTENING_MAX_IDLE_MS)
    }

    private fun cancelAllWatchdogs() {
        mainHandler.removeCallbacks(silenceWatchdogRunnable)
        mainHandler.removeCallbacks(processingTimeoutRunnable)
        mainHandler.removeCallbacks(listeningStallRunnable)
    }

    private fun dispatchResult(text: String) {
        val cleanText = text.trim()
        if (cleanText.isBlank() || hasDispatchedThisTurn) return

        hasDispatchedThisTurn = true
        isUserSpeaking = false
        cancelSilenceTimer()

        logTransition("STT_FINAL")
        Log.i(TAG, "VOICE: STT_FINAL = \"$cleanText\"")
        Log.i("LYX_PIPELINE", "VOICE: STT_FINAL = \"$cleanText\"")
        
        transitionTo(State.PROCESSING)
        onText(cleanText)
    }

    private fun muteSystemSounds(mute: Boolean) {
        try {
            if (mute && !isAudioMuted) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    audioManager?.adjustStreamVolume(AudioManager.STREAM_SYSTEM, AudioManager.ADJUST_MUTE, 0)
                    audioManager?.adjustStreamVolume(AudioManager.STREAM_NOTIFICATION, AudioManager.ADJUST_MUTE, 0)
                } else {
                    @Suppress("DEPRECATION")
                    audioManager?.setStreamMute(AudioManager.STREAM_SYSTEM, true)
                    @Suppress("DEPRECATION")
                    audioManager?.setStreamMute(AudioManager.STREAM_NOTIFICATION, true)
                }
                isAudioMuted = true
            } else if (!mute && isAudioMuted) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    audioManager?.adjustStreamVolume(AudioManager.STREAM_SYSTEM, AudioManager.ADJUST_UNMUTE, 0)
                    audioManager?.adjustStreamVolume(AudioManager.STREAM_NOTIFICATION, AudioManager.ADJUST_UNMUTE, 0)
                } else {
                    @Suppress("DEPRECATION")
                    audioManager?.setStreamMute(AudioManager.STREAM_SYSTEM, false)
                    @Suppress("DEPRECATION")
                    audioManager?.setStreamMute(AudioManager.STREAM_NOTIFICATION, false)
                }
                isAudioMuted = false
            }
        } catch (e: Exception) {}
    }

    fun start() {
        mainHandler.post {
            if (!SpeechRecognizer.isRecognitionAvailable(context)) {
                logTransition("ERROR")
                Log.e(TAG, "Speech recognition not available on device")
                transitionTo(State.IDLE)
                return@post
            }

            isPowerActive = true
            ensureRecognizer()
            transitionTo(State.LISTENING)
        }
    }

    private fun ensureRecognizer() {
        if (recognizer == null) {
            try {
                recognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                    setRecognitionListener(object : RecognitionListener {
                        override fun onResults(results: Bundle?) {
                            cancelSilenceTimer()
                            val texto = results
                                ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                                ?.firstOrNull() ?: lastRecognizedText

                            if (!texto.isNullOrBlank()) {
                                dispatchResult(texto)
                            } else if (currentState == State.LISTENING && !hasDispatchedThisTurn) {
                                safeRestartListening(250)
                            }
                        }

                        override fun onError(error: Int) {
                            cancelSilenceTimer()
                            logTransition("VOICE_ERROR")
                            if (currentState != State.LISTENING || hasDispatchedThisTurn) return

                            if (lastRecognizedText.isNotBlank()) {
                                dispatchResult(lastRecognizedText)
                                return
                            }

                            if (error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || error == SpeechRecognizer.ERROR_CLIENT) {
                                try {
                                    recognizer?.cancel()
                                } catch (e: Exception) {
                                    logTransition("VOICE_ERROR")
                                }
                            }

                            val delayMs = when (error) {
                                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 300L
                                SpeechRecognizer.ERROR_NO_MATCH -> 300L
                                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 400L
                                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> {
                                    logTransition("ERROR")
                                    logTransition("VOICE_ERROR")
                                    Log.e(TAG, "Insufficient audio permissions")
                                    transitionTo(State.IDLE)
                                    return
                                }
                                else -> 350L
                            }

                            safeRestartListening(delayMs)
                        }

                        override fun onReadyForSpeech(params: Bundle?) {
                            logTransition("STT_START")
                        }

                        override fun onBeginningOfSpeech() {
                            isUserSpeaking = true
                            logTransition("SPEECH_START")
                            logTransition("VAD_SPEECH_START")

                            if (currentState == State.SPEAKING) {
                                triggerBargeIn()
                            }
                            onInterruption?.invoke()
                        }

                        override fun onRmsChanged(rmsdB: Float) {}
                        override fun onBufferReceived(buffer: ByteArray?) {}

                        override fun onEndOfSpeech() {
                            logTransition("SPEECH_END")
                            logTransition("VAD_SPEECH_END")
                            if (lastRecognizedText.isNotBlank()) {
                                mainHandler.postDelayed({
                                    if (currentState == State.LISTENING && !hasDispatchedThisTurn && lastRecognizedText.isNotBlank()) {
                                        dispatchResult(lastRecognizedText)
                                    }
                                }, 80L)
                            }
                        }

                        override fun onPartialResults(partialResults: Bundle?) {
                            val partial = partialResults
                                ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                                ?.firstOrNull()

                            if (!partial.isNullOrBlank()) {
                                isUserSpeaking = true
                                lastRecognizedText = partial
                                logTransition("STT_PARTIAL")
                                onInterruption?.invoke()
                                onPartialText?.invoke(partial)
                                resetSilenceTimer()
                            }
                        }

                        override fun onEvent(eventType: Int, params: Bundle?) {}
                    })
                }
            } catch (e: Exception) {
                logTransition("ERROR")
                Log.e(TAG, "Fail to instantiate SpeechRecognizer: ${e.message}")
                transitionTo(State.IDLE)
            }
        }
    }

    private fun startListeningInternal() {
        if (currentState != State.LISTENING) return
        hasDispatchedThisTurn = false
        isUserSpeaking = false
        lastRecognizedText = ""

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "pt-BR")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "pt-BR")
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "pt-BR")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, SILENCE_TIMEOUT_MS)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 300L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 100L)
        }

        try {
            logTransition("MIC_START")
            recognizer?.cancel()
            recognizer?.startListening(intent)
        } catch (e: Exception) {
            logTransition("ERROR")
            logTransition("VOICE_ERROR")
            Log.e(TAG, "startListening exception: ${e.message}")
            safeRestartListening(400L)
        }
    }

    private fun safeRestartListening(delayMs: Long) {
        if (currentState != State.LISTENING || hasDispatchedThisTurn) return
        cancelSilenceTimer()
        mainHandler.postDelayed({
            if (currentState == State.LISTENING && !hasDispatchedThisTurn) {
                startListeningInternal()
            }
        }, delayMs)
    }

    fun triggerBargeIn() {
        onInterruption?.invoke()
        transitionTo(State.LISTENING)
    }

    fun stop() {
        isPowerActive = false
        mainHandler.post {
            transitionTo(State.IDLE)
        }
    }

    fun destroy() {
        isPowerActive = false
        cancelAllWatchdogs()
        mainHandler.post {
            muteSystemSounds(false)
            destroyRecognizer()
            currentState = State.IDLE
        }
    }

    private fun destroyRecognizer() {
        try {
            recognizer?.destroy()
        } catch (e: Exception) {}
        recognizer = null
    }
}
