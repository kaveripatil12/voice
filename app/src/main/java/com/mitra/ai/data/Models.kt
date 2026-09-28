package com.mitra.ai.data

import java.util.UUID

enum class Speaker { USER, MITRA }
enum class AssistantState { IDLE, LISTENING, THINKING, SPEAKING }
enum class AppTab { HOME, CHAT, TASKS, MEMORY, SETTINGS }
enum class DetectedLanguage { ENGLISH, HINDI, MARATHI, MIXED_HINGLISH, MIXED_MARATHI_ENGLISH }
enum class UserRole { STUDENT, PARENT, VISITOR }
enum class KnowledgeCategory { ADMISSION, EXAM, SCHOLARSHIP, NOTICE, CONTACT, DEPARTMENT, CAMPUS, ACADEMIC, GENERAL }

data class Message(
    val id: String = UUID.randomUUID().toString(),
    val speaker: Speaker,
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class AssistantSettings(
    val preferredLanguage: String = "auto",
    val speechRate: Float = 0.9f,
    val autoListen: Boolean = false,
    val conciseResponses: Boolean = true,
    val currentRole: UserRole = UserRole.STUDENT
)

data class KnowledgeDocument(
    val title: String,
    val content: String,
    val source: String,
    val publishedAt: String,
    val updatedAt: String,
    val category: KnowledgeCategory,
    val version: String = "v1.0"
)

data class CollegeAnswer(
    val reply: String,
    val source: String? = null,
    val verified: Boolean = true,
    val category: KnowledgeCategory? = null,
    val tool: ToolRequest? = null,
    val requiresConfirmation: Boolean = false
)

data class ToolRequest(val name: String, val argument: String? = null)
data class AiResult(
    val reply: String,
    val tool: ToolRequest? = null,
    val requiresConfirmation: Boolean = false,
    val source: String? = null,
    val verified: Boolean = true,
    val requiresEscalation: Boolean = false
)
