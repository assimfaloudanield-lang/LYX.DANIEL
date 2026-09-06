package com.example.juls

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

data class MemoryItem(
    val id: String,
    val key: String,
    val content: String,
    val timestamp: Long
)

class LyxMemoryManager(private val context: Context) {

    private val memoryFile = File(context.filesDir, "lyx_memory.json")
    private val memories = mutableListOf<MemoryItem>()

    init {
        loadMemories()
    }

    private fun loadMemories() {
        memories.clear()
        if (!memoryFile.exists()) {
            // Inicializa memória inicial obrigatória com o nome do usuário Daniel
            val initialItem = MemoryItem(
                id = "user_name_default",
                key = "nome",
                content = "O usuário se chama Daniel.",
                timestamp = System.currentTimeMillis()
            )
            memories.add(initialItem)
            saveToFile()
            return
        }

        try {
            val jsonStr = memoryFile.readText()
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                memories.add(
                    MemoryItem(
                        id = obj.optString("id", System.currentTimeMillis().toString()),
                        key = obj.optString("key", "info"),
                        content = obj.optString("content", ""),
                        timestamp = obj.optLong("timestamp", System.currentTimeMillis())
                    )
                )
            }
        } catch (e: Exception) {
            // Em caso de corrupção, inicializa com Daniel
            memories.clear()
            memories.add(
                MemoryItem(
                    id = "user_name_default",
                    key = "nome",
                    content = "O usuário se chama Daniel.",
                    timestamp = System.currentTimeMillis()
                )
            )
            saveToFile()
        }

        // Garante que o nome Daniel exista se a memória estiver vazia
        if (memories.none { it.key == "nome" || it.content.contains("Daniel", ignoreCase = true) }) {
            memories.add(
                0,
                MemoryItem(
                    id = "user_name_default",
                    key = "nome",
                    content = "O usuário se chama Daniel.",
                    timestamp = System.currentTimeMillis()
                )
            )
            saveToFile()
        }
    }

    @Synchronized
    private fun saveToFile() {
        try {
            val array = JSONArray()
            for (item in memories) {
                val obj = JSONObject()
                obj.put("id", item.id)
                obj.put("key", item.key)
                obj.put("content", item.content)
                obj.put("timestamp", item.timestamp)
                array.put(obj)
            }
            memoryFile.writeText(array.toString(2))
        } catch (e: Exception) {
            // Falha segura
        }
    }

    /**
     * Salva ou atualiza uma informação na memória persistente
     * Sem limite artificial de 40 itens
     */
    @Synchronized
    fun saveMemory(key: String, content: String) {
        if (content.isBlank()) return
        val existingIndex = memories.indexOfFirst { it.key.equals(key, ignoreCase = true) }
        val newItem = MemoryItem(
            id = "mem_${System.currentTimeMillis()}_${(0..999).random()}",
            key = key,
            content = content.trim(),
            timestamp = System.currentTimeMillis()
        )

        if (existingIndex >= 0) {
            memories[existingIndex] = newItem
        } else {
            memories.add(newItem)
        }
        saveToFile()
    }

    @Synchronized
    fun getMemories(): List<MemoryItem> {
        return ArrayList(memories)
    }

    @Synchronized
    fun getMemoriesJson(): String {
        val array = JSONArray()
        for (item in memories) {
            val obj = JSONObject()
            obj.put("id", item.id)
            obj.put("key", item.key)
            obj.put("content", item.content)
            obj.put("timestamp", item.timestamp)
            array.put(obj)
        }
        return array.toString()
    }

    @Synchronized
    fun deleteMemory(id: String): Boolean {
        val removed = memories.removeAll { it.id == id }
        if (removed) saveToFile()
        return removed
    }

    @Synchronized
    fun clearMemories(): Boolean {
        memories.clear()
        saveToFile()
        return true
    }

    /**
     * Recupera contexto relevante para não sobrecarregar a janela de contexto do Qwen
     */
    @Synchronized
    fun getRelevantContext(query: String): String {
        if (memories.isEmpty()) return ""

        val queryLower = query.lowercase()
        val queryWords = queryLower.split(Regex("[^\\p{L}\\p{Nd}]+")).filter { it.length > 2 }

        // Itens prioritários (nome do usuário é sempre relevante)
        val relevant = mutableListOf<MemoryItem>()
        val nameItem = memories.firstOrNull { it.key == "nome" || it.content.contains("Daniel", ignoreCase = true) }
        if (nameItem != null) {
            relevant.add(nameItem)
        }

        // Busca por relevância léxica na consulta atual
        for (item in memories) {
            if (relevant.contains(item)) continue
            val itemLower = item.content.lowercase()
            if (queryWords.any { word -> itemLower.contains(word) }) {
                relevant.add(item)
            }
            if (relevant.size >= 6) break
        }

        // Se ainda tiver espaço, adiciona as mais recentes
        if (relevant.size < 4) {
            val recent = memories.filter { !relevant.contains(it) }.takeLast(4 - relevant.size)
            relevant.addAll(recent)
        }

        val sb = StringBuilder("Informações memorizadas sobre o usuário:\n")
        for (item in relevant) {
            sb.append("- ").append(item.content).append("\n")
        }
        return sb.toString().trim()
    }

    /**
     * Extrai automaticamente fatos estáveis e úteis para conversas futuras
     */
    fun autoExtractMemory(userInput: String) {
        val lower = userInput.trim().lowercase()

        // Detecta nome
        val nomeRegex = Regex("(?:meu nome é|me chamo|sou o|pode me chamar de)\\s+([A-ZÀ-Úa-zà-ú]+)", RegexOption.IGNORE_CASE)
        val nomeMatch = nomeRegex.find(userInput)
        if (nomeMatch != null) {
            val nome = nomeMatch.groupValues[1].capitalize()
            saveMemory("nome", "O usuário se chama $nome.")
            return
        }

        // Detecta preferências
        if (lower.startsWith("eu gosto de ") || lower.contains(" minha preferência é ") || lower.startsWith("eu prefiro ")) {
            saveMemory("pref_${System.currentTimeMillis()}", "O usuário gosta de: ${userInput.trim()}")
        }

        // Detecta profissão/trabalho
        if (lower.contains("eu trabalho com ") || lower.contains("minha profissão é ") || lower.contains("eu sou desenvolvedor") || lower.contains("eu sou programador")) {
            saveMemory("trabalho", "Trabalho do usuário: ${userInput.trim()}")
        }

        // Detecta projeto
        if (lower.contains("meu projeto é ") || lower.contains("estou desenvolvendo ") || lower.contains("estou criando ")) {
            saveMemory("projeto", "Projeto do usuário: ${userInput.trim()}")
        }
    }
}
