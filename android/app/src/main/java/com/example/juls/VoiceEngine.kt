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
        // Latência ultra baixa: 200ms de silêncio para disparo instantâneo
        private const val SILENCE_TIMEOUT_MS = 200L
        private const val PROCESSING_TIMEOUT_MS = 5000L
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
    private var isUserSpeaking: Boolean = false
    private var hasDispatchedThisTurn: Boolean = false

    private val silenceWatchdogRunnable = Runnable {
        if (currentState == State.LISTENING && !hasDispatchedThisTurn && lastRecognizedText.isNotBlank()) {
            logTransition("SILENCE_WATCHDOG_TRIGGERED")
            dispatchResult(lastRecognizedText)
        }
    }

    private val processingTimeoutRunnable = Runnable {
        if (currentState == State.PROCESSING) {
            logTransition("PROCESSING_TIMEOUT_FORCE_LISTENING")
            transitionTo(State.LISTENING)
        }
    }

    private val listeningStallRunnable = Runnable {
        if (currentState == State.LISTENING && !isUserSpeaking) {
            logTransition("LISTENING_STALL_RESTART")
            safeRestartListening(100L)
        }
    }

    fun getCurrentState(): State = currentState

    fun transitionTo(newState: State) {
        if (currentState == newState) return
        val oldState = currentState
        currentState = newState
        logTransition("STATE_CHANGE: $oldState -> $newState")

        when (newState) {
            State.IDLE -> {
                cancelAllWatchdogs()
                muteSystemSounds(false)
                destroyRecognizer()
                hasDispatchedThisTurn = false
            }
            State.LISTENING -> {
                cancelAllWatchdogs()
                muteSystemSounds(true)
                ensureRecognizer()
                startListeningInternal()
                startListeningStallWatchdog()
            }
            State.PROCESSING -> {
                cancelSilenceTimer()
                muteSystemSounds(false)
                try {
                    recognizer?.stopListening()
                } catch (e: Exception) {}
                startProcessingWatchdog()
            }
            State.SPEAKING -> {
                cancelAllWatchdogs()
                muteSystemSounds(false)
            }
        }
    }

    private fun logTransition(msg: String) {
        Log.i(TAG, "STATE: $msg")
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
        cancelAllWatchdogs()

        transitionTo(State.PROCESSING)

        logTransition("VOICE_DISPATCH_TRIGGERED: $cleanText")
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
                                safeRestartListening(100)
                            }
                        }

                        override fun onError(error: Int) {
                            cancelSilenceTimer()
                            if (currentState != State.LISTENING || hasDispatchedThisTurn) return

                            if (lastRecognizedText.isNotBlank()) {
                                dispatchResult(lastRecognizedText)
                                return
                            }

                            if (error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || error == SpeechRecognizer.ERROR_CLIENT) {
                                try {
                                    recognizer?.cancel()
                                } catch (e: Exception) {}
                            }

                            val delayMs = when (error) {
                                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 150L
                                SpeechRecognizer.ERROR_NO_MATCH -> 150L
                                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 250L
                                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> {
                                    Log.e(TAG, "Insufficient audio permissions")
                                    transitionTo(State.IDLE)
                                    return
                                }
                                else -> 200L
                            }
                            safeRestartListening(delayMs)
                        }

                        override fun onReadyForSpeech(params: Bundle?) {}

                        override fun onBeginningOfSpeech() {
                            isUserSpeaking = true
                            if (currentState == State.SPEAKING) {
                                triggerBargeIn()
                            }
                            onInterruption?.invoke()
                        }

                        override fun onRmsChanged(rmsdB: Float) {}
                        override fun onBufferReceived(buffer: ByteArray?) {}

                        override fun onEndOfSpeech() {
                            // Ao terminar de falar, se já houver transcrição parcial, dispara imediatamente
                            if (lastRecognizedText.isNotBlank()) {
                                mainHandler.post {
                                    if (currentState == State.LISTENING && !hasDispatchedThisTurn && lastRecognizedText.isNotBlank()) {
                                        dispatchResult(lastRecognizedText)
                                    }
                                }
                            }
                        }

                        override fun onPartialResults(partialResults: Bundle?) {
                            val partial = partialResults
                                ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                                ?.firstOrNull()

                            if (!partial.isNullOrBlank()) {
                                isUserSpeaking = true
                                lastRecognizedText = partial
                                onInterruption?.invoke()
                                onPartialText?.invoke(partial)
                                resetSilenceTimer()
                            }
                        }

                        override fun onEvent(eventType: Int, params: Bundle?) {}
                    })
                }
            } catch (e: Exception) {
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
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 150L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 50L)
        }

        try {
            recognizer?.cancel()
            recognizer?.startListening(intent)
        } catch (e: Exception) {
            safeRestartListening(250L)
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
