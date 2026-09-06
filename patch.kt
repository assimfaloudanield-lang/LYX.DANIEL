--- android/app/src/main/java/com/example/juls/MainActivity.kt
+++ android/app/src/main/java/com/example/juls/MainActivity.kt
@@ -48,6 +48,7 @@
     private var voiceEngine: VoiceEngine? = null
     private val qwenModelManager by lazy { QwenModelManager(this) }
     private val lyxMemoryManager by lazy { LyxMemoryManager(this) }
+    private val qwenEngine by lazy { QwenEngine(this) }
 
     @SuppressLint("SetJavaScriptEnabled")
     override fun onCreate(savedInstanceState: Bundle?) {
@@ -194,6 +195,18 @@
             runOnUiThread {
                 startDownloadingModel()
             }
         }
+
+        @JavascriptInterface
+        fun generateNativeResponse(prompt: String) {
+            qwenEngine.responder(prompt) { resposta ->
+                runOnUiThread {
+                    val escaped = JSONObject.quote(resposta)
+                    webView?.evaluateJavascript(
+                        "if (window.onNativeResponse) { window.onNativeResponse($escaped); }",
+                        null
+                    )
+                }
+            }
+        }
 
         @JavascriptInterface
         fun speakNative(text: String) {
@@ -410,6 +423,7 @@
         tts?.shutdown()
         tts = null
         webView?.destroy()
         webView = null
+        qwenEngine.destroy()
         super.onDestroy()
     }
 }
