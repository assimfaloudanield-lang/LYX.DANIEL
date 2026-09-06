package com.example.juls

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.juls.ui.LyxApp
import com.example.juls.ui.chat.ChatMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.UUID

class MainActivity : ComponentActivity() {
    companion object {
        private const val TAG = "LYX_MAIN"
        private const val PERMISSION_REQUEST_CODE = 200
        private const val PREFS_NAME = "lyx_settings"
        private const val KEY_SELECTED_VOICE = "selected_voice"
        private const val KEY_SELECTED_STYLE = "selected_style"
    }

    private var isOnState = mutableStateOf(false)
    private var isListeningState = mutableStateOf(false)
    private var voiceStatusState = mutableStateOf<String?>("LYX ESTÁ ESPERANDO")
    private var chatMessagesState = mutableStateListOf<ChatMessage>()
    private var pendingPowerOn = false

    private var voiceEngine: VoiceEngine? = null
    val qwenModelManager by lazy { QwenModelManager(this) }
    val kokoroModelManager by lazy { KokoroModelManager(this) }
    val kokoroVoiceService by lazy { KokoroVoiceService(this, kokoroModelManager) }
    private val lyxMemoryManager by lazy { LyxMemoryManager(this) }
    private val qwenEngine by lazy { QwenEngine(this) }

    @SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        checkAndRequestPermissions()

        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val savedStyle = prefs.getString(KEY_SELECTED_STYLE, "natural_balanced") ?: "natural_balanced"
        kokoroVoiceService.setStyleId(savedStyle)

        setContent {
            val isOn by isOnState
            val isListening by isListeningState
            val voiceStatus by voiceStatusState

            LyxApp(
                isOn = isOn,
                isListening = isListening,
                voiceStatus = voiceStatus,
                onTogglePower = { togglePower(!isOn) },
                messages = chatMessagesState,
                onSendMessage = { message -> handleUserMessage(message) }
            )
        }
    }

    private fun handleUserMessage(message: String) {
        chatMessagesState.add(ChatMessage(id = UUID.randomUUID().toString(), text = message, isUser = true))
        
        val historyJson = "[]" // Stub for now
        qwenEngine.responder(message, historyJson) { response ->
            runOnUiThread {
                chatMessagesState.add(ChatMessage(id = UUID.randomUUID().toString(), text = response, isUser = false))
                if (isOnState.value) {
                    speakNative(response)
                }
            }
        }
    }

    fun togglePower(isOn: Boolean) {
        if (isOn) {
            if (hasRecordAudioPermission()) {
                isOnState.value = true
                startNativeListening()
            } else {
                pendingPowerOn = true
                checkAndRequestPermissions()
            }
        } else {
            pendingPowerOn = false
            isOnState.value = false
            stopNativeListening()
            kokoroVoiceService.stop()
            voiceStatusState.value = "LYX ESTÁ ESPERANDO"
        }
    }

    private fun hasRecordAudioPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (hasRecordAudioPermission() && pendingPowerOn) {
                pendingPowerOn = false
                isOnState.value = true
                startNativeListening()
            } else if (!hasRecordAudioPermission() && pendingPowerOn) {
                pendingPowerOn = false
                isOnState.value = false
            }
        }
    }

    private fun startNativeListening() {
        if (!hasRecordAudioPermission()) return
        if (voiceEngine == null) {
            voiceEngine = VoiceEngine(
                context = this,
                onInterruption = {
                    runOnUiThread {
                        kokoroVoiceService.stop()
                        voiceStatusState.value = "LYX FOI INTERROMPIDO"
                    }
                },
                onPartialText = { partialText ->
                    runOnUiThread {
                        voiceStatusState.value = partialText
                    }
                },
                onText = { recognizedText ->
                    runOnUiThread {
                        voiceStatusState.value = "PROCESSANDO..."
                        handleUserMessage(recognizedText)
                    }
                }
            )
        }
        voiceEngine?.start()
        isListeningState.value = true
        voiceStatusState.value = "LYX ESTÁ OUVINDO"
    }

    private fun stopNativeListening() {
        voiceEngine?.stop()
        isListeningState.value = false
        voiceStatusState.value = "LYX ESTÁ ESPERANDO"
    }

    private fun speakNative(text: String) {
        voiceEngine?.transitionTo(VoiceEngine.State.SPEAKING)
        voiceStatusState.value = "LYX ESTÁ FALANDO"
        kokoroVoiceService.speak(text) {
            runOnUiThread {
                voiceEngine?.transitionTo(VoiceEngine.State.IDLE)
                voiceStatusState.value = "LYX ESTÁ OUVINDO"
                if (isOnState.value) {
                    startNativeListening()
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        stopNativeListening()
        kokoroVoiceService.stop()
    }

    override fun onResume() {
        super.onResume()
        if (isOnState.value && !pendingPowerOn) {
            startNativeListening()
        }
    }

    override fun onDestroy() {
        voiceEngine?.destroy()
        voiceEngine = null
        kokoroVoiceService.release()
        qwenEngine.destroy()
        super.onDestroy()
    }
}
