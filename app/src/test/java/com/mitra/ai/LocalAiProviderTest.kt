package com.mitra.ai

import com.mitra.ai.ai.LocalAiProvider
import com.mitra.ai.data.DetectedLanguage
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalAiProviderTest {
    private val provider = LocalAiProvider()

    @Test
    fun supportedCoursesComeFromTheKnowledgeBase() = runTest {
        val answer = provider.respond("What UG courses are available?", DetectedLanguage.ENGLISH)
        assertTrue(answer.reply.contains("BBA"))
        assertTrue(answer.reply.contains("BCA"))
        assertTrue(!answer.requiresEscalation)
    }

    @Test
    fun feesAndVacanciesEscalateWithoutGuessing() = runTest {
        val fees = provider.respond("What are the fees?", DetectedLanguage.ENGLISH)
        val seats = provider.respond("How many seats are vacant now?", DetectedLanguage.ENGLISH)
        assertTrue(fees.requiresEscalation)
        assertTrue(seats.requiresEscalation)
        assertTrue(fees.reply.contains("Admission Department"))
        assertTrue(seats.reply.contains("Admission Department"))
    }

    @Test
    fun selectedLanguageControlsResponseLanguage() = runTest {
        val hindi = provider.respond("Tell me about BBA", DetectedLanguage.HINDI)
        val marathi = provider.respond("Tell me about BCA", DetectedLanguage.MARATHI)
        assertTrue(hindi.reply.contains("आधिकारिक"))
        assertTrue(marathi.reply.contains("अधिकृत"))
    }
}
