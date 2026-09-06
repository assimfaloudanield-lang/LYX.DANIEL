--- android/app/src/main/java/com/example/juls/MainActivity.kt
+++ android/app/src/main/java/com/example/juls/MainActivity.kt
@@ -465,9 +465,8 @@
         }
 
         @JavascriptInterface
-        fun generateNativeResponse(prompt: String) {
-            // Usa o motor local e retorna à interface web via callback global (window.onNativeResponse)
-            qwenEngine.responder(prompt) { resposta ->
+        fun generateNativeResponse(prompt: String, historyJson: String) {
+            qwenEngine.responder(prompt, historyJson) { resposta ->
                 runOnUiThread {
                     val escaped = JSONObject.quote(resposta)
                     webView?.evaluateJavascript(
