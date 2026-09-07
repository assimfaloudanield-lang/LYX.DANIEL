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
                        
                        // FIX TELA BRANCA: Permite carregamento de módulos ES (type="module") via file://
                        settings.allowFileAccessFromFileURLs = true
                        settings.allowUniversalAccessFromFileURLs = true
                        
                        webViewClient = WebViewClient()
                        webChromeClient = object : WebChromeClient() {
                            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                                android.util.Log.d("LYX_WEBVIEW", "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                                return true
                            }
                        }
                        
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
            runOnUiThread {
                if (voiceEngine == null) {
                    voiceEngine = VoiceEngine(
                        context = this@MainActivity,
                        onInterruption = {
                            kokoroVoiceService.stop()
                            evalJs("if(window.onUserInterrupted) window.onUserInterrupted();")
                        },
                        onPartialText = { partial ->
                            val safeStr = partial.replace("'", "\'")
                            evalJs("if(window.onVoicePartialRecognized) window.onVoicePartialRecognized('$safeStr');")
                        },
                        onText = { final ->
                            val safeStr = final.replace("'", "\'")
                            evalJs("if(window.onVoiceRecognized) window.onVoiceRecognized('$safeStr');")
                        }
                    )
                }
                voiceEngine?.start()
                evalJs("if(window.onAndroidStateChanged) window.onAndroidStateChanged(true, true);")
            }
        }

        @JavascriptInterface
        fun stopListening() {
            runOnUiThread {
                voiceEngine?.stop()
                evalJs("if(window.onAndroidStateChanged) window.onAndroidStateChanged(true, false);")
            }
        }

        @JavascriptInterface
        fun speakNative(text: String) {
            evalJs("if(window.onSpeechStart) window.onSpeechStart();")
            kokoroVoiceService.speak(text) {
                evalJs("if(window.onSpeechDone) window.onSpeechDone();")
            }
        }
        
        @JavascriptInterface
        fun speakNativeChunk(text: String, isFirst: Boolean, isFinal: Boolean) {
            if (isFirst) evalJs("if(window.onSpeechStart) window.onSpeechStart();")
            kokoroVoiceService.speakChunk(text, isFirst, isFinal) {
                if (isFinal) {
                    evalJs("if(window.onSpeechDone) window.onSpeechDone();")
                }
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
                var qwenPercent = 0
                var qwenDlMB = 0L
                var qwenTotMB = 1180L
                var kokoroPercent = 0
                var kokoroDlMB = 0L
                var kokoroTotMB = 345L
                var qwenDone = false
                var kokoroDone = false
                var errorReported = false

                fun reportProgress() {
                    if (errorReported) return
                    evalJs("if(window.onUnifiedModelProgress) window.onUnifiedModelProgress($qwenPercent, $qwenDlMB, $qwenTotMB, $kokoroPercent, $kokoroDlMB, $kokoroTotMB, 'Baixando modelos neurais...');")
                }

                launch {
                    qwenModelManager.downloadWithProgress(
                        onProgress = { downloadedBytes, totalBytes, percent -> 
                            qwenDlMB = downloadedBytes / (1024 * 1024)
                            qwenTotMB = totalBytes / (1024 * 1024)
                            qwenPercent = percent
                            reportProgress()
                        },
                        onComplete = {
                            qwenDone = true
                            qwenPercent = 100
                            reportProgress()
                            if (qwenDone && kokoroDone) {
                                evalJs("if(window.onModelDownloadComplete) window.onModelDownloadComplete();")
                            }
                        },
                        onError = { err -> 
                            if (!errorReported) {
                                errorReported = true
                                val safeErr = err.replace("'", "\'")
                                evalJs("if(window.onModelDownloadError) window.onModelDownloadError('Qwen: $safeErr');")
                            }
                        }
                    )
                }

                launch {
                    kokoroModelManager.downloadAndInstall(
                        onProgress = { downloadedBytes, totalBytes, percent -> 
                            kokoroDlMB = downloadedBytes / (1024 * 1024)
                            kokoroTotMB = totalBytes / (1024 * 1024)
                            kokoroPercent = percent
                            reportProgress()
                        },
                        onStatusChange = { },
                        onComplete = {
                            kokoroDone = true
                            kokoroPercent = 100
                            reportProgress()
                            if (qwenDone && kokoroDone) {
                                evalJs("if(window.onModelDownloadComplete) window.onModelDownloadComplete();")
                            }
                        },
                        onError = { err -> 
                            if (!errorReported) {
                                errorReported = true
                                val safeErr = err.replace("'", "\'")
                                evalJs("if(window.onModelDownloadError) window.onModelDownloadError('Kokoro: $safeErr');")
                            }
                        }
                    )
                }
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
