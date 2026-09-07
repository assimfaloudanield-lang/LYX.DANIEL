package com.example.juls

import android.content.Context
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

class QwenModelManager(private val context: Context) {

    private val modelName = "Qwen3-1.7B-Q4_K_M.gguf"

    private val modelUrl =
        "https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF/resolve/main/$modelName"

    fun isModelDownloaded(): Boolean {
        val folder = File(context.filesDir, "models")
        val modelFile = File(folder, modelName)
        return modelFile.exists() && modelFile.length() > 500_000_000L
    }

    fun getModelFile(): File {
        val folder = File(context.filesDir, "models")

        if (!folder.exists()) {
            folder.mkdirs()
        }

        val modelFile = File(folder, modelName)

        // Se já existe e possui dados válidos, não baixa novamente
        if (modelFile.exists() && modelFile.length() > 500_000_000L) {
            return modelFile
        }

        // Se o arquivo existir corrompido ou incompleto, remove antes de baixar
        if (modelFile.exists()) {
            modelFile.delete()
        }

        val tempFile = File(folder, "$modelName.tmp")
        if (tempFile.exists() && tempFile.length() < 1000L) {
            tempFile.delete()
        }

        download(tempFile, null)

        if (tempFile.exists() && tempFile.length() > 0L) {
            tempFile.renameTo(modelFile)
        } else {
            throw Exception("Arquivo baixado inválido ou vazio.")
        }

        return modelFile
    }

    fun downloadWithProgress(
        onProgress: (downloadedBytes: Long, totalBytes: Long, percent: Int) -> Unit,
        onComplete: (File) -> Unit,
        onError: (String) -> Unit
    ) {
        val folder = File(context.filesDir, "models")
        if (!folder.exists()) {
            folder.mkdirs()
        }

        val modelFile = File(folder, modelName)
        if (modelFile.exists() && modelFile.length() > 500_000_000L) {
            onProgress(modelFile.length(), modelFile.length(), 100)
            onComplete(modelFile)
            return
        }

        val tempFile = File(folder, "$modelName.tmp")
        if (tempFile.exists() && tempFile.length() < 1000L) {
            tempFile.delete()
        }

        try {
            download(tempFile, onProgress)
            if (tempFile.exists() && tempFile.length() > 500_000_000L) {
                if (modelFile.exists()) modelFile.delete()
                tempFile.renameTo(modelFile)
                onComplete(modelFile)
            } else {
                onError("Arquivo baixado incompleto")
            }
        } catch (e: Exception) {
            onError(e.message ?: "Erro desconhecido durante o download")
        }
    }

    private fun download(
        file: File,
        progressCallback: ((downloadedBytes: Long, totalBytes: Long, percent: Int) -> Unit)?
    ) {
        var currentUrl = modelUrl
        var redirects = 0
        val maxRedirects = 10
        var existingBytes = if (file.exists() && file.length() > 1000L) file.length() else 0L
        if (existingBytes == 0L && file.exists()) {
            file.delete()
        }

        while (redirects < maxRedirects) {
            val url = URL(currentUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.instanceFollowRedirects = true
            connection.connectTimeout = 30000
            connection.readTimeout = 60000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Android; LYX-Model-Downloader)")

            if (existingBytes > 0) {
                connection.setRequestProperty("Range", "bytes=$existingBytes-")
            }

            connection.connect()
            val responseCode = connection.responseCode
            if (responseCode in 300..399) {
                val location = connection.getHeaderField("Location")
                connection.disconnect()
                if (location.isNullOrEmpty()) {
                    throw Exception("Redirecionamento sem endereço de destino ao baixar o Qwen3")
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
                throw Exception("Falha HTTP $responseCode ao baixar o modelo Qwen3")
            }

            val append = isPartial && existingBytes > 0
            if (!append && existingBytes > 0) {
                existingBytes = 0L
                file.delete()
            }

            val remoteLength = connection.contentLengthLong
            val totalBytes = if (append) {
                existingBytes + if (remoteLength > 0) remoteLength else (1_282_439_264L - existingBytes)
            } else {
                if (remoteLength > 0) remoteLength else 1_282_439_264L
            }

            var downloadedBytes = existingBytes
            var lastReportedPercent = -1
            connection.inputStream.use { input ->
                FileOutputStream(file, append).use { output ->
                    val buffer = ByteArray(65536)
                    while (true) {
                        val bytes = input.read(buffer)
                        if (bytes == -1) break
                        output.write(buffer, 0, bytes)
                        downloadedBytes += bytes
                        val percent = ((downloadedBytes * 100) / totalBytes).toInt().coerceIn(0, 100)
                        if (percent != lastReportedPercent || downloadedBytes % (1024 * 1024) < 65536) {
                            lastReportedPercent = percent
                            progressCallback?.invoke(downloadedBytes, totalBytes, percent)
                        }
                    }
                    output.flush()
                }
            }
            connection.disconnect()
            progressCallback?.invoke(downloadedBytes, totalBytes, 100)
            break
        }
    }
}

