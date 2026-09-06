package com.example.juls

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
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

    private var myWebView: WebView? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkPermissions()
        
        // qwenModelManager.initialize()

        setContent {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { context ->
                    WebView(context).apply {
                        myWebView = this
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.mediaPlaybackRequiresUserGesture = false
                        settings.cacheMode = WebSettings.LOAD_NO_CACHE
                        settings.allowFileAccess = true
                        settings.allowContentAccess = true
                        
                        webViewClient = WebViewClient()
                        webChromeClient = WebChromeClient()
                        
                        addJavascriptInterface(WebAppInterface(), "AndroidBridge")
                        
                        loadUrl("file:///android_asset/public/index.html")
                    }
                }
            )
        }
    }
    
    fun evalJs(script: String) {
        myWebView?.post {
            myWebView?.evaluateJavascript(script, null)
        }
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun startListening() {
            if (voiceEngine == null) {
                voiceEngine = VoiceEngine(
                    context = this@MainActivity,
                    onInterruption = {
                        kokoroVoiceService.stop()
                        evalJs("if(window.onUserInterrupted) window.onUserInterrupted();")
                    },
                    onPartialText = { partial ->
                        val safeStr = partial.replace("'", "\\\\'")
                        evalJs("if(window.onVoicePartialRecognized) window.onVoicePartialRecognized('$safeStr');")
                    },
                    onText = { final ->
                        val safeStr = final.replace("'", "\\\\'")
                        evalJs("if(window.onVoiceRecognized) window.onVoiceRecognized('$safeStr');")
                    }
                )
            }
            // voiceEngine?.startListening()
            evalJs("if(window.onAndroidStateChanged) window.onAndroidStateChanged(true, true);")
        }

        @JavascriptInterface
        fun stopListening() {
            // voiceEngine?.stopListening()
            evalJs("if(window.onAndroidStateChanged) window.onAndroidStateChanged(true, false);")
        }

        @JavascriptInterface
        fun speakNative(text: String) {
            evalJs("if(window.onSpeechStart) window.onSpeechStart();")
            kokoroVoiceService.speak(text) {
                evalJs("if(window.onSpeechDone) window.onSpeechDone();")
            }
        }
        
        @JavascriptInterface
        fun speakNativeChunk(text: String, isFirst: Boolean) {
            if (isFirst) evalJs("if(window.onSpeechStart) window.onSpeechStart();")
            kokoroVoiceService.speakChunk(text, isFirst, false) {
                // Done chunk callback if needed
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            kokoroVoiceService.stop()
        }

        @JavascriptInterface
        fun generateNativeResponse(prompt: String, historyJson: String) {
            val qwen = QwenEngine(this@MainActivity)
            CoroutineScope(Dispatchers.IO).launch {
                qwen.responder(prompt, historyJson) { response ->
                    CoroutineScope(Dispatchers.Main).launch {
                        val safeRes = response.replace("'", "\\\\'")
                        evalJs("if(window.onQwenResponse) window.onQwenResponse('$safeRes');")
                    }
                }
            }
        }

        @JavascriptInterface
        fun togglePower(state: Boolean) {
            evalJs("if(window.onAndroidStateChanged) window.onAndroidStateChanged($state, false);")
        }
        
        @JavascriptInterface
        fun startModelDownload() {
            CoroutineScope(Dispatchers.IO).launch {
                qwenModelManager.downloadWithProgress(
                    onProgress = { file, progress, max -> 
                        evalJs("if(window.onModelDownloadProgress) window.onModelDownloadProgress('$file', $progress, $max);")
                    },
                    onComplete = {
                        evalJs("if(window.onModelDownloadComplete) window.onModelDownloadComplete();")
                    },
                    onError = { err -> 
                        val safeErr = err.replace("'", "\\\\'")
                        evalJs("if(window.onModelDownloadError) window.onModelDownloadError('$safeErr');")
                    }
                )
            }
        }

        @JavascriptInterface
        fun isModelDownloaded(): Boolean {
            return qwenModelManager.isModelDownloaded()
        }

        @JavascriptInterface
        fun getNativeVoices(): String {
            return "[{\"id\":\"pt-br-dora\",\"name\":\"Dora (PT-BR)\"}]"
        }
        
        @JavascriptInterface
        fun setNativeVoice(voiceId: String) {}
        
        @JavascriptInterface
        fun setVoiceStyle(pitch: Float, rate: Float) {}
        
        @JavascriptInterface
        fun setVoiceStyleId(styleId: String) {}
        
        @JavascriptInterface
        fun saveMemory(key: String, content: String) {
            lyxMemoryManager.saveMemory(key, content)
        }
        
        @JavascriptInterface
        fun getMemories(): String {
            return "[]" 
        }
        
        @JavascriptInterface
        fun autoExtractMemory(text: String) {}
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
}
