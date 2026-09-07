package com.example.juls

import java.io.File
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.juls.ui.LyxApp
import com.example.juls.ui.LyxTheme
import com.example.juls.ui.chat.ChatMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    companion object {
        private const val TAG = "LYX_MAIN"
        private const val PERMISSION_REQUEST_CODE = 200
    }

    private var voiceEngine: VoiceEngine? = null
    val qwenModelManager by lazy { QwenModelManager(this) }
    val kokoroModelManager by lazy { KokoroModelManager(this) }
    val kokoroVoiceService by lazy { KokoroVoiceService(this, kokoroModelManager) }
    private val lyxMemoryManager by lazy { LyxMemoryManager(this) }
    private val qwenEngine by lazy { QwenEngine(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkPermissions()

        setContent {
            LyxTheme {
                var isOn by remember { mutableStateOf(false) }
                var isListening by remember { mutableStateOf(false) }
                var voiceStatus by remember { mutableStateOf<String?>("Pronto") }
                val messages = remember { mutableStateListOf<ChatMessage>() }
                val coroutineScope = rememberCoroutineScope()

                LaunchedEffect(Unit) {
                    voiceEngine = VoiceEngine(
                        context = this@MainActivity,
                        onStateChanged = { listening ->
                            isListening = listening
                        },
                        onVoiceRecognized = { text ->
                            if (text.isNotBlank() && isOn) {
                                messages.add(ChatMessage(id = System.currentTimeMillis().toString(), text = text, isUser = true))
                                voiceStatus = "Pensando..."
                                voiceEngine?.stop() // Pausa escuta enquanto responde para evitar loop acústico
                                
                                coroutineScope.launch(Dispatchers.IO) {
                                    qwenEngine.responder(text, "[]") { reply ->
                                        coroutineScope.launch(Dispatchers.Main) {
                                            messages.add(ChatMessage(id = System.currentTimeMillis().toString(), text = reply, isUser = false))
                                            voiceStatus = "Falando..."
                                            kokoroVoiceService.speak(reply) {
                                                coroutineScope.launch(Dispatchers.Main) {
                                                    if (isOn) {
                                                        voiceStatus = "Ouvindo..."
                                                        voiceEngine?.start()
                                                    } else {
                                                        voiceStatus = "Pronto"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        onError = { err ->
                            voiceStatus = "Erro de áudio: $err"
                        }
                    )
                }

                LyxApp(
                    isOn = isOn,
                    isListening = isListening,
                    voiceStatus = voiceStatus,
                    onTogglePower = {
                        isOn = !isOn
                        if (isOn) {
                            voiceEngine?.start()
                            isListening = true
                            voiceStatus = "Ouvindo..."
                        } else {
                            voiceEngine?.stop()
                            kokoroVoiceService.stop()
                            isListening = false
                            voiceStatus = "Desligado"
                        }
                    },
                    messages = messages,
                    onSendMessage = { text ->
                        if (text.isNotBlank()) {
                            messages.add(ChatMessage(id = System.currentTimeMillis().toString(), text = text, isUser = true))
                            voiceStatus = "Pensando..."
                            coroutineScope.launch(Dispatchers.IO) {
                                qwenEngine.responder(text, "[]") { reply ->
                                    coroutineScope.launch(Dispatchers.Main) {
                                        messages.add(ChatMessage(id = System.currentTimeMillis().toString(), text = reply, isUser = false))
                                        voiceStatus = "Falando..."
                                        kokoroVoiceService.speak(reply) {
                                            coroutineScope.launch(Dispatchers.Main) {
                                                if (isOn) {
                                                    voiceStatus = "Ouvindo..."
                                                    voiceEngine?.start()
                                                } else {
                                                    voiceStatus = "Pronto"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                )
            }
        }
    }

    private fun checkPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.INTERNET
        )
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

    override fun onDestroy() {
        super.onDestroy()
        voiceEngine?.stop()
        kokoroVoiceService.stop()
    }
}
