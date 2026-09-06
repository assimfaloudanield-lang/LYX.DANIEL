package com.example.juls

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.Normalizer
import java.util.Locale

class LocalMemoryStore(context: Context) {

    private val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    @Synchronized
    fun preparePrompt(userText: String): String {
        val memories = readMemories()
        val recentHistory = readHistory()
        val extractedMemory = extractDurableMemory(userText)

        if (extractedMemory != null && memories.none { it == extractedMemory }) {
            memories.add(extractedMemory)
            writeMemories(memories)
        }

        val relevantMemories = memories
            .sortedByDescending { relevance(it, userText) }
            .filter { relevance(it, userText) > 0 }
            .take(MAX_RELEVANT_MEMORIES)

        val prompt = buildString {
            if (relevantMemories.isNotEmpty()) {
                append("Memórias locais relevantes:\n")
                relevantMemories.forEach { append("- ").append(it).append('\n') }
            }
            if (recentHistory.isNotEmpty()) {
                append("Histórico recente da conversa:\n")
                recentHistory.forEach { turn ->
                    append(if (turn.role == USER_ROLE) "Usuário: " else "LYX: ")
                        .append(turn.text)
                        .append('\n')
                }
            }
            append("Mensagem atual do usuário:\n")
            append(userText.trim())
        }

        return prompt
    }

    @Synchronized
    fun addTurn(role: String, text: String) {
        val trimmedText = text.trim()
        if (trimmedText.isEmpty()) return

        val history = readHistory()
        history.add(Turn(role, trimmedText))
        while (history.size > MAX_HISTORY_TURNS) {
            history.removeAt(0)
        }
        writeHistory(history)
    }

    private fun extractDurableMemory(text: String): String? {
        val normalized = normalize(text)
        val durableMarkers = listOf(
            "meu nome e",
            "eu sou",
            "eu gosto de",
            "eu prefiro",
            "eu trabalho",
            "meu projeto",
            "estou trabalhando",
            "estou usando",
            "moro em",
            "lembre que"
        )
        if (text.length > MAX_MEMORY_LENGTH || durableMarkers.none { normalized.contains(it) }) {
            return null
        }
        return text.trim()
    }

    private fun relevance(memory: String, query: String): Int {
        val memoryTerms = terms(memory)
        val queryTerms = terms(query)
        return memoryTerms.count { it in queryTerms }
    }

    private fun terms(value: String): Set<String> {
        return normalize(value)
            .split(Regex("[^a-z0-9]+"))
            .filter { it.length >= MIN_TERM_LENGTH && it !in STOP_WORDS }
            .toSet()
    }

    private fun normalize(value: String): String {
        return Normalizer.normalize(value.lowercase(Locale.ROOT), Normalizer.Form.NFD)
            .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
    }

    private fun readMemories(): MutableList<String> {
        val values = JSONArray(preferences.getString(MEMORIES_KEY, "[]"))
        return MutableList(values.length()) { index -> values.optString(index) }
            .filter { it.isNotBlank() }
            .toMutableList()
    }

    private fun writeMemories(memories: List<String>) {
        val values = JSONArray()
        memories.forEach { values.put(it) }
        preferences.edit().putString(MEMORIES_KEY, values.toString()).apply()
    }

    private fun readHistory(): MutableList<Turn> {
        val values = JSONArray(preferences.getString(HISTORY_KEY, "[]"))
        return MutableList(values.length()) { index ->
            val item = values.optJSONObject(index) ?: JSONObject()
            Turn(item.optString(ROLE_KEY), item.optString(TEXT_KEY))
        }.filter { it.text.isNotBlank() }.toMutableList()
    }

    private fun writeHistory(history: List<Turn>) {
        val values = JSONArray()
        history.forEach { turn ->
            values.put(JSONObject().apply {
                put(ROLE_KEY, turn.role)
                put(TEXT_KEY, turn.text)
            })
        }
        preferences.edit().putString(HISTORY_KEY, values.toString()).apply()
    }

    private data class Turn(val role: String, val text: String)

    companion object {
        private const val PREFERENCES_NAME = "lyx_local_memory"
        private const val MEMORIES_KEY = "durable_memories"
        private const val HISTORY_KEY = "recent_history"
        private const val ROLE_KEY = "role"
        private const val TEXT_KEY = "text"
        private const val USER_ROLE = "user"
        private const val MAX_RELEVANT_MEMORIES = 6
        private const val MAX_HISTORY_TURNS = 8
        private const val MAX_MEMORY_LENGTH = 240
        private const val MIN_TERM_LENGTH = 3
        private val STOP_WORDS = setOf(
            "para", "com", "uma", "uns", "por", "que", "dos", "das", "mes", "mais",
            "estou", "meu", "minha", "isso", "essa", "esse", "como", "quando", "onde"
        )
    }
}
