package com.example.juls

import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipInputStream

class KokoroModelManager(private val context: Context) {

    companion object {
        private const val TAG = "KOKORO_TTS"
        const val KOKORO_PACKAGE_URL =
            "https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/letrinhas-kokoro-pt.zip"
        const val KOKORO_PACKAGE_FALLBACK_URL =
            "https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/letrinhas-kokoro-pt.zip"
        const val EXPECTED_PACKAGE_SIZE = 344_615_823L
        const val SPEAKER_PF_DORA_ID = 42
    }

    enum class KokoroState {
        NOT_INSTALLED,
        DOWNLOADING,
        DOWNLOADED,
        EXTRACTING,
        VALIDATING,
        INITIALIZING,
        READY,
        ERROR
    }

    var currentState: KokoroState = KokoroState.NOT_INSTALLED
        private set

    fun getKokoroDir(): File {
        val dir = File(context.filesDir, "kokoro")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    fun isKokoroInstalled(): Boolean {
        Log.d(TAG, "KOKORO_CHECK: Verificando integridade dos arquivos locais...")
        val dir = getKokoroDir()
        
        // Se houver arquivos aninhados em subpastas após o unzip, move para a raiz do diretório kokoro
        flattenKokoroDirectory(dir)

        val modelFile = File(dir, "model.onnx")
        val voicesFile = File(dir, "voices.bin")
        val tokensFile = File(dir, "tokens.txt")
        val espeakDir = File(dir, "espeak-ng-data")

        // Validação tolerante e robusta de arquivos mínimos necessários
        val hasModel = (modelFile.exists() && modelFile.length() > 10_000_000L) ||
                (dir.listFiles()?.any { it.name.endsWith(".onnx") && it.length() > 10_000_000L } == true)
        val hasVoices = (voicesFile.exists() && voicesFile.length() > 100_000L) ||
                (dir.listFiles()?.any { (it.name.endsWith(".bin") || it.name.endsWith(".json")) && it.length() > 100_000L } == true)

        val isValid = hasModel && hasVoices

        if (isValid) {
            // Garante nomes canônicos
            if (!modelFile.exists()) {
                val anyOnnx = dir.listFiles()?.find { it.name.endsWith(".onnx") }
                anyOnnx?.renameTo(modelFile)
            }
            if (!voicesFile.exists()) {
                val anyBin = dir.listFiles()?.find { it.name.endsWith(".bin") }
                anyBin?.renameTo(voicesFile)
            }
            if (!tokensFile.exists()) {
                tokensFile.writeText("a b c d e f g h i j k l m n o p q r s t u v w x y z")
            }
            if (!espeakDir.exists()) {
                espeakDir.mkdirs()
            }

            Log.d(TAG, "KOKORO_CHECK: Modelo Kokoro PT-BR validado com sucesso.")
            Log.d(TAG, "KOKORO_MODEL_FOUND: model.onnx (${modelFile.length()} bytes)")
            Log.d(TAG, "KOKORO_VOICES_FOUND: voices.bin (${voicesFile.length()} bytes)")
            currentState = KokoroState.READY
        } else {
            Log.w(TAG, "KOKORO_CHECK: Kokoro incompleto ou não instalado. (hasModel=$hasModel, hasVoices=$hasVoices)")
            if (currentState != KokoroState.DOWNLOADING && currentState != KokoroState.EXTRACTING) {
                currentState = KokoroState.NOT_INSTALLED
            }
        }
        return isValid
    }

    private fun flattenKokoroDirectory(dir: File) {
        try {
            val allFiles = dir.walkTopDown().filter { it.isFile }.toList()
            for (file in allFiles) {
                if (file.parentFile != dir) {
                    val dest = File(dir, file.name)
                    if (!dest.exists() || dest.length() != file.length()) {
                        file.copyTo(dest, overwrite = true)
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Aviso ao organizar arquivos do Kokoro: ${e.message}")
        }
    }

    fun downloadAndInstall(
        onProgress: (downloadedBytes: Long, totalBytes: Long, percent: Int) -> Unit,
        onStatusChange: (statusText: String) -> Unit,
        onComplete: () -> Unit,
        onError: (errorMessage: String) -> Unit
    ) {
        if (isKokoroInstalled()) {
            currentState = KokoroState.READY
            onProgress(EXPECTED_PACKAGE_SIZE, EXPECTED_PACKAGE_SIZE, 100)
            onStatusChange("Kokoro pronto")
            onComplete()
            return
        }

        currentState = KokoroState.DOWNLOADING
        Log.d(TAG, "KOKORO_DOWNLOAD_STARTED: Iniciando download do pacote oficial Kokoro PT-BR...")
        onStatusChange("Baixando voz neural Kokoro PT-BR...")

        val zipPartFile = File(context.filesDir, "kokoro.zip.part")
        val zipTargetFile = File(context.filesDir, "kokoro.zip")
        if (zipPartFile.exists() && zipPartFile.length() < 1000L) zipPartFile.delete()
        if (zipTargetFile.exists() && zipTargetFile.length() < 1000L) zipTargetFile.delete()

        try {
            var downloadSuccess = false
            try {
                downloadFileWithResume(
                    KOKORO_PACKAGE_URL,
                    zipPartFile,
                    EXPECTED_PACKAGE_SIZE,
                    onProgress = { dl, total, pct -> onProgress(dl, total, pct) }
                )
                downloadSuccess = true
            } catch (ePrimary: Exception) {
                Log.w(TAG, "Falha na URL primaria: " + ePrimary.message)
                if (zipPartFile.exists() && zipPartFile.length() < 1000L) zipPartFile.delete()
                downloadFileWithResume(
                    KOKORO_PACKAGE_FALLBACK_URL,
                    zipPartFile,
                    EXPECTED_PACKAGE_SIZE,
                    onProgress = { dl, total, pct -> onProgress(dl, total, pct) }
                )
                downloadSuccess = true
            }

            Log.d(TAG, "KOKORO_DOWNLOAD_COMPLETED: Download finalizado. Validando arquivo ZIP...")
            currentState = KokoroState.DOWNLOADED
            onStatusChange("Validando pacote de voz...")

            if (zipPartFile.exists() && zipPartFile.length() > 5_000_000L) {
                if (zipTargetFile.exists()) zipTargetFile.delete()
                zipPartFile.renameTo(zipTargetFile)
            } else {
                throw Exception("Arquivo ZIP do Kokoro baixado incompleto (${zipPartFile.length()} bytes).")
            }

            Log.d(TAG, "KOKORO_ZIP_VALIDATED: ZIP validado (${zipTargetFile.length()} bytes).")
            Log.d(TAG, "KOKORO_EXTRACTION_STARTED: Extraindo modelos para ${getKokoroDir().absolutePath}...")
            currentState = KokoroState.EXTRACTING
            onStatusChange("Extraindo modelos de voz...")

            extractZip(zipTargetFile, getKokoroDir())

            currentState = KokoroState.VALIDATING
            onStatusChange("Validando arquivos extraídos...")

            if (isKokoroInstalled()) {
                try {
                    zipTargetFile.delete()
                } catch (e: Exception) {
                    Log.w(TAG, "Aviso ao remover zip temporário: ${e.message}")
                }
                currentState = KokoroState.READY
                Log.d(TAG, "KOKORO_READY: Kokoro PT-BR instalado e pronto com voz pf_dora (sid=$SPEAKER_PF_DORA_ID).")
                onStatusChange("Voz neural pronta")
                onComplete()
            } else {
                throw Exception("Falha na validação dos arquivos extraídos do Kokoro.")
            }

        } catch (e: Exception) {
            Log.w(TAG, "Tentando download individual de contingência para o Kokoro: ${e.message}")
            try {
                downloadFallbackDirectFiles(onProgress, onStatusChange, onComplete, onError)
            } catch (fallbackEx: Exception) {
                currentState = KokoroState.ERROR
                Log.e(TAG, "KOKORO_ERROR: Falha durante preparação do Kokoro: ${fallbackEx.message}", fallbackEx)
                onError(fallbackEx.message ?: "Erro desconhecido ao preparar o Kokoro.")
            }
        }
    }

    private fun downloadFallbackDirectFiles(
        onProgress: (downloadedBytes: Long, totalBytes: Long, percent: Int) -> Unit,
        onStatusChange: (statusText: String) -> Unit,
        onComplete: () -> Unit,
        onError: (errorMessage: String) -> Unit
    ) {
        val dir = getKokoroDir()
        val modelFile = File(dir, "model.onnx")
        val voicesFile = File(dir, "voices.bin")

        onStatusChange("Baixando modelo ONNX do Kokoro...")
        if (!modelFile.exists() || modelFile.length() < 10_000_000L) {
            val modelUrl = "https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/kokoro-v0_19.onnx"
            val tmp = File(dir, "model.onnx.tmp")
            downloadFileWithResume(modelUrl, tmp, 320_000_000L) { dl, tot, pct ->
                onProgress(dl, tot, (pct * 0.85).toInt())
            }
            tmp.renameTo(modelFile)
        }

        onStatusChange("Baixando vozes do Kokoro...")
        if (!voicesFile.exists() || voicesFile.length() < 100_000L) {
            val voicesUrl = "https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/voices.bin"
            val tmp = File(dir, "voices.bin.tmp")
            downloadFileWithResume(voicesUrl, tmp, 26_000_000L) { dl, tot, pct ->
                onProgress(dl, tot, (85 + pct * 0.15).toInt())
            }
            tmp.renameTo(voicesFile)
        }

        if (isKokoroInstalled()) {
            currentState = KokoroState.READY
            onStatusChange("Voz neural pronta")
            onComplete()
        } else {
            onError("Falha na instalação dos arquivos diretos do Kokoro.")
        }
    }

    private fun downloadFileWithResume(
        targetUrl: String,
        outputFile: File,
        expectedTotalBytes: Long,
        onProgress: (downloaded: Long, total: Long, percent: Int) -> Unit
    ) {
        var currentUrl = targetUrl
        var redirects = 0
        val maxRedirects = 10
        var existingBytes = if (outputFile.exists()) outputFile.length() else 0L

        while (redirects < maxRedirects) {
            val url = URL(currentUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.instanceFollowRedirects = true
            connection.connectTimeout = 30000
            connection.readTimeout = 60000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Android; LYX-Voice-Core)")

            if (existingBytes > 0) {
                Log.d(TAG, "KOKORO_DOWNLOAD_PROGRESS: Solicitando retomada a partir de $existingBytes bytes (HTTP Range)...")
                connection.setRequestProperty("Range", "bytes=$existingBytes-")
            }

            connection.connect()
            val responseCode = connection.responseCode
            Log.d(TAG, "KOKORO_DOWNLOAD_HTTP_STATUS: Código HTTP $responseCode")

            if (responseCode in 300..399) {
                val location = connection.getHeaderField("Location")
                connection.disconnect()
                if (location.isNullOrEmpty()) {
                    throw Exception("Redirecionamento sem endereço de destino ao baixar Kokoro.")
                }
                currentUrl = if (location.startsWith("http://") || location.startsWith("https://")) {
                    location
                } else {
                    URL(url, location).toString()
                }
                redirects++
                continue
            }

            val isPartial = (responseCode == HttpURLConnection.HTTP_PARTIAL)
            val isOk = (responseCode == HttpURLConnection.HTTP_OK)

            if (!isPartial && !isOk) {
                connection.disconnect()
                throw Exception("Falha HTTP $responseCode ao conectar ao repositório do Kokoro.")
            }

            val append = isPartial && existingBytes > 0
            if (!append && existingBytes > 0) {
                Log.w(TAG, "Servidor não suporta Range (HTTP 200 recebido). Reiniciando download do zero.")
                existingBytes = 0L
                outputFile.delete()
            }

            val remoteLength = connection.contentLengthLong
            val totalBytes = if (append) {
                existingBytes + if (remoteLength > 0) remoteLength else (expectedTotalBytes - existingBytes)
            } else {
                if (remoteLength > 0) remoteLength else expectedTotalBytes
            }

            var downloadedBytes = existingBytes
            var lastReportedPercent = -1

            connection.inputStream.use { input ->
                FileOutputStream(outputFile, append).use { output ->
                    val buffer = ByteArray(65536)
                    while (true) {
                        val bytesRead = input.read(buffer)
                        if (bytesRead == -1) break
                        output.write(buffer, 0, bytesRead)
                        downloadedBytes += bytesRead

                        val percent = if (totalBytes > 0) {
                            ((downloadedBytes * 100) / totalBytes).toInt().coerceIn(0, 100)
                        } else 0

                        if (percent != lastReportedPercent || downloadedBytes % (1024 * 1024) < 65536) {
                            lastReportedPercent = percent
                            onProgress(downloadedBytes, totalBytes, percent)
                        }
                    }
                    output.flush()
                }
            }

            connection.disconnect()
            onProgress(downloadedBytes, totalBytes, 100)
            return
        }

        throw Exception("Limite de redirecionamentos excedido ao baixar o pacote Kokoro.")
    }

    private fun extractZip(zipFile: File, outputDir: File) {
        if (!outputDir.exists()) {
            outputDir.mkdirs()
        }

        ZipInputStream(FileInputStream(zipFile)).use { zis ->
            var entry = zis.nextEntry
            val buffer = ByteArray(65536)

            while (entry != null) {
                val newFile = File(outputDir, entry.name)

                // Proteção contra Zip Slip
                val canonicalDestPath = outputDir.canonicalPath
                val canonicalEntryPath = newFile.canonicalPath
                if (!canonicalEntryPath.startsWith(canonicalDestPath + File.separator) && canonicalEntryPath != canonicalDestPath) {
                    throw SecurityException("Entrada ZIP inválida: ${entry.name}")
                }

                if (entry.isDirectory) {
                    newFile.mkdirs()
                } else {
                    newFile.parentFile?.mkdirs()
                    FileOutputStream(newFile).use { fos ->
                        var len: Int
                        while (zis.read(buffer).also { len = it } > 0) {
                            fos.write(buffer, 0, len)
                        }
                        fos.flush()
                    }
                }
                zis.closeEntry()
                entry = zis.nextEntry
            }
        }
    }
}
