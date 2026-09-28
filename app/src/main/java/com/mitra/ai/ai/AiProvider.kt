package com.mitra.ai.ai

import com.mitra.ai.data.AiResult
import com.mitra.ai.data.DetectedLanguage

interface AiProvider {
    suspend fun respond(input: String, language: DetectedLanguage): AiResult
}

class LocalAiProvider : AiProvider {
    override suspend fun respond(input: String, language: DetectedLanguage): AiResult {
        val query = input.trim().lowercase()
        if (query.isBlank()) return AiResult(copy(language, "Please ask about undergraduate courses or the university."))
        if (isLanguageChange(query)) return AiResult(copy(language, "Please use the language buttons to change the conversation language."))
        if (isEscalation(query)) return AiResult(escalation(language), requiresEscalation = true)

        val reply = when {
            containsAny(query, "course", "courses", "program", "programmes", "undergraduate", "ug", "branch", "school", "academic") -> introduction(language)
            containsAny(query, "bba", "bca") -> courseReply(language, query)
            containsAny(query, "seat", "seats", "intake") -> noVerifiedIntake(language)
            else -> escalation(language)
        }
        return AiResult(reply, requiresEscalation = reply == escalation(language))
    }

    private fun isEscalation(query: String): Boolean = containsAny(
        query,
        "fee", "fees", "eligibility", "eligible", "vacant", "vacancy", "available seat", "admission confirmed",
        "confirm admission", "application status", "payment", "document verification", "counselling", "counseling",
        "which course should", "course selection", "connect", "transfer", "admission department"
    ) || query.contains("seat now")

    private fun isLanguageChange(query: String): Boolean = containsAny(query, "change language", "switch language", "speak in hindi", "speak in marathi", "speak in english")

    private fun introduction(language: DetectedLanguage): String = when (language) {
        DetectedLanguage.HINDI -> "SVKM NMIMS Global University, Dhule महाराष्ट्र में एक state-private university है। आधिकारिक वेबसाइट पर तीन academic areas दिए गए हैं: School of Commerce, School of Technology, Management and Engineering, और School of Pharmacy and Technology Management। होमपेज पर undergraduate programmes में BBA और BCA सूचीबद्ध हैं। अधिक course details के लिए Admission Department से संपर्क करें। आप कौन सी जानकारी जानना चाहते हैं?"
        DetectedLanguage.MARATHI -> "SVKM NMIMS Global University, Dhule हे महाराष्ट्रातील state-private university आहे. अधिकृत वेबसाइटवर तीन academic areas दिले आहेत: School of Commerce, School of Technology, Management and Engineering, आणि School of Pharmacy and Technology Management. मुख्यपृष्ठावर undergraduate programmes मध्ये BBA आणि BCA सूचीबद्ध आहेत. अधिक course details साठी Admission Department शी संपर्क करा. आपल्याला कोणती माहिती हवी आहे?"
        else -> "SVKM NMIMS Global University, Dhule is a state-private university in Maharashtra. The official website lists three academic areas: School of Commerce, School of Technology, Management and Engineering, and School of Pharmacy and Technology Management. The homepage lists BBA and BCA under undergraduate programmes. For more course details, please contact the Admission Department. What information would you like to know?"
    }

    private fun courseReply(language: DetectedLanguage, query: String): String {
        val course = if (query.contains("bca")) "BCA" else "BBA"
        return when (language) {
            DetectedLanguage.HINDI -> "आधिकारिक NMIMS Dhule वेबसाइट के homepage पर $course undergraduate programme के रूप में सूचीबद्ध है। स्रोत: svkmnmimsgu.ac.in। प्रवेश, eligibility और fees की जानकारी Admission Department से लें।"
            DetectedLanguage.MARATHI -> "अधिकृत NMIMS Dhule वेबसाइटच्या मुख्यपृष्ठावर $course undergraduate programme म्हणून सूचीबद्ध आहे. स्रोत: svkmnmimsgu.ac.in. प्रवेश, eligibility आणि fees साठी Admission Department शी संपर्क करा."
            else -> "The official NMIMS Dhule homepage lists $course as an undergraduate programme. Source: svkmnmimsgu.ac.in. Please contact the Admission Department for admission, eligibility, and fee details."
        }
    }

    private fun noVerifiedIntake(language: DetectedLanguage): String = when (language) {
        DetectedLanguage.HINDI -> "Knowledge base में course-wise official intake उपलब्ध नहीं है। Official intake और current vacant seats अलग जानकारी हैं। कृपया Admission Department से संपर्क करें।"
        DetectedLanguage.MARATHI -> "Knowledge base मध्ये course-wise अधिकृत intake उपलब्ध नाही. Official intake आणि current vacant seats वेगवेगळी माहिती आहे. कृपया Admission Department शी संपर्क करा."
        else -> "A course-wise official intake is not available in the knowledge base. Official intake and current vacant seats are different information. Please contact the Admission Department."
    }

    private fun escalation(language: DetectedLanguage): String = when (language) {
        DetectedLanguage.HINDI -> "विस्तृत प्रवेश संबंधी जानकारी के लिए मैं आपको Admission Department से जोड़ रहा हूँ। कृपया लाइन पर बने रहें।"
        DetectedLanguage.MARATHI -> "प्रवेशासंबंधी सविस्तर माहितीसाठी मी आपल्याला Admission Department शी जोडत आहे. कृपया लाईनवर रहा."
        else -> "For detailed admission-related information, I will connect you with the Admission Department. Please stay on the line."
    }

    private fun copy(language: DetectedLanguage, english: String): String = when (language) {
        DetectedLanguage.HINDI -> "कृपया undergraduate courses या university के बारे में पूछें।"
        DetectedLanguage.MARATHI -> "कृपया undergraduate courses किंवा university बद्दल विचारा."
        else -> english
    }

    private fun containsAny(input: String, vararg values: String): Boolean = values.any(input::contains)
}
