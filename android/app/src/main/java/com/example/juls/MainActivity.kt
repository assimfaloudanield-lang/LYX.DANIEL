package com.example.juls

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.example.juls.ui.LyxApp
import com.example.juls.ui.LyxTheme
import com.example.juls.ui.chat.ChatMessage
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

class MainActivity : ComponentActivity() {

    private var isOn by mutableStateOf(false)
    private var isListening by mutableStateOf(false)
    private var voiceStatus by mutableStateOf<String?>(null)
    private val messages = mutableStateListOf<ChatMessage>()

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        if (recordAudioGranted) {
            startVoiceAssistant()
        } else {
            Toast.makeText(this, "Permissão de microfone necessária para a voz da LYX", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            LyxTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF03010A)
                ) {
                    LyxApp(
                        isOn = isOn,
                        isListening = isListening,
                        voiceStatus = voiceStatus,
                        onTogglePower = { togglePower() },
                        messages = messages,
                        onSendMessage = { text -> handleSendMessage(text) }
                    )
                }
            }
        }
    }

    private fun togglePower() {
        if (isOn) {
            stopVoiceAssistant()
        } else {
            checkAndRequestPermissions()
        }
    }

    private fun checkAndRequestPermissions() {
        val permissionsToRequest = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val allGranted = permissionsToRequest.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }

        if (allGranted) {
            startVoiceAssistant()
        } else {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun startVoiceAssistant() {
        isOn = true
        isListening = true
        voiceStatus = "Ouvindo você..."

        val intent = Intent(this, JulsVoiceService::class.java).apply {
            action = JulsVoiceService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopVoiceAssistant() {
        isOn = false
        isListening = false
        voiceStatus = null

        val intent = Intent(this, JulsVoiceService::class.java).apply {
            action = JulsVoiceService.ACTION_STOP
        }
        startService(intent)
    }

    private fun handleSendMessage(text: String) {
        messages.add(ChatMessage(text = text, isUser = true))
        // Resposta imediata de texto pelo serviço ou engine local
        JulsVoiceService.instance?.speak(text)
    }

    override fun onDestroy() {
        if (isOn) {
            stopVoiceAssistant()
        }
        super.onDestroy()
    }
}
