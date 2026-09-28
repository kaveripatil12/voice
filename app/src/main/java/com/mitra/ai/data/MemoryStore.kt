package com.mitra.ai.data

import android.content.Context
import org.json.JSONArray

class MemoryStore(context: Context) {
    private val prefs = context.getSharedPreferences("mitra_memory", Context.MODE_PRIVATE)

    fun messages(): List<Message> = runCatching {
        val array = JSONArray(prefs.getString("messages", "[]"))
        List(array.length()) { index ->
            val item = array.getJSONObject(index)
            Message(item.getString("id"), Speaker.valueOf(item.getString("speaker")), item.getString("text"), item.getLong("timestamp"))
        }
    }.getOrDefault(emptyList())

    fun addMessage(message: Message) {
        val messages = (messages() + message).takeLast(100)
        val array = JSONArray()
        messages.forEach { item ->
            array.put(org.json.JSONObject().apply {
                put("id", item.id); put("speaker", item.speaker.name); put("text", item.text); put("timestamp", item.timestamp)
            })
        }
        prefs.edit().putString("messages", array.toString()).apply()
    }

    fun memories(): List<String> = prefs.getStringSet("facts", emptySet())?.toList().orEmpty()
    fun remember(fact: String) = prefs.edit().putStringSet("facts", memories().toSet() + fact.trim()).apply()
    fun clear() = prefs.edit().remove("messages").remove("facts").apply()
}
