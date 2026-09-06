package com.example.juls

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class JulsVoiceService : Service() {

    private lateinit var kokoroModelManager: KokoroModelManager
    private lateinit var kokoroVoiceService: KokoroVoiceService
    private lateinit var qwenEngine: QwenEngine
    private lateinit var voiceEngine: VoiceEngine
    private var isRunning = false
    private val mainHandler = Handler(Looper.getMainLooper())
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    companion object {
        private const val TAG = "KOKORO_TTS"
        const val CHANNEL_ID = "juls_voice"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "JULS_START"
        const val ACTION_STOP = "JULS_STOP"

        @Volatile
        var instance: JulsVoiceService? = null
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()

        kokoroModelManager = KokoroModelManager(this)
        kokoroVoiceService = KokoroVoiceService(this, kokoroModelManager)
        qwenEngine = QwenEngine(this)

        // Pré-carrega o modelo local Qwen3 antes da primeira inferência
        serviceScope.launch(Dispatchers.IO) {
            qwenEngine.initEngine()
        }

        // VoiceEngine envia o texto reconhecido em pt-BR para o QwenEngine
        voiceEngine = VoiceEngine(this) { textoReconhecido ->
            if (!isRunning) return@VoiceEngine

            // Pausa a escuta enquanto o Qwen processa e responde
            voiceEngine.stop()

            // QwenEngine executa localmente e entrega a resposta
            qwenEngine.responder(textoReconhecido) { respostaGerada ->
                if (!isRunning) return@responder

                // O serviço envia a resposta para o Kokoro TTS local (pf_dora) e retoma a escuta após a fala
                speak(respostaGerada) {
                    if (isRunning) {
                        voiceEngine.start()
                    }
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                isRunning = false
                voiceEngine.stop()
                kokoroVoiceService.stop()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
            ACTION_START, null -> {
                isRunning = true
                startForeground(NOTIFICATION_ID, createNotification())

                // Garante inicialização em background
                serviceScope.launch(Dispatchers.IO) {
                    qwenEngine.initEngine()
                }

                voiceEngine.start()
            }
        }
        return START_STICKY
    }

    fun speak(text: String, onComplete: (() -> Unit)? = null) {
        if (text.isBlank()) {
            onComplete?.invoke()
            return
        }

        Log.d(TAG, "KOKORO_SYNTHESIS_STARTED: JulsVoiceService executando fala com pf_dora...")
        kokoroVoiceService.speak(text) {
            mainHandler.post {
                Log.d(TAG, "KOKORO_SYNTHESIS_COMPLETED: JulsVoiceService finalizou a fala.")
                onComplete?.invoke()
            }
        }
    }

    private fun createNotification(): Notification {
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("LYX · Assistente de Voz Ativo")
            .setContentText("Processamento local ativo com voz neural Kokoro PT-BR")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "LYX Voice Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notificação de serviço em primeiro plano para voz LYX"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        isRunning = false
        voiceEngine.stop()
        voiceEngine.destroy()
        kokoroVoiceService.stop()
        serviceScope.cancel()
        instance = null
        super.onDestroy()
    }
}
