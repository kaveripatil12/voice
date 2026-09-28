package com.mitra.ai

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mitra.ai.ai.AiProvider
import com.mitra.ai.ai.LocalAiProvider
import com.mitra.ai.data.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MitraViewModel(application: Application) : AndroidViewModel(application) {
    private val provider: AiProvider = LocalAiProvider()

    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()

    private val _state = MutableStateFlow(AssistantState.IDLE)
    val state: StateFlow<AssistantState> = _state.asStateFlow()

    private val _tab = MutableStateFlow(AppTab.HOME)
    val tab: StateFlow<AppTab> = _tab.asStateFlow()

    private val _memories = MutableStateFlow<List<String>>(emptyList())
    val memories: StateFlow<List<String>> = _memories.asStateFlow()

    private val _settings = MutableStateFlow(AssistantSettings())
    val settings: StateFlow<AssistantSettings> = _settings.asStateFlow()

    private val _detectedLanguage = MutableStateFlow(DetectedLanguage.ENGLISH)
    val detectedLanguage: StateFlow<DetectedLanguage> = _detectedLanguage.asStateFlow()

    private val _languageSelected = MutableStateFlow(false)
    val languageSelected: StateFlow<Boolean> = _languageSelected.asStateFlow()

    private val _requiresEscalation = MutableStateFlow(false)
    val requiresEscalation: StateFlow<Boolean> = _requiresEscalation.asStateFlow()

    fun setState(value: AssistantState) {
        _state.value = value
    }

    fun selectTab(value: AppTab) {
        _tab.value = value
    }

    fun updateSettings(value: AssistantSettings) {
        _settings.value = value
    }

    fun clearMemory() {
        _messages.value = emptyList()
        _memories.value = emptyList()
    }

    fun addMemory(fact: String) {
        if (fact.isNotBlank()) {
            _memories.value = _memories.value + fact
        }
    }

    fun selectLanguage(language: DetectedLanguage, speak: (String) -> Unit) {
        _detectedLanguage.value = language
        _languageSelected.value = true
        _requiresEscalation.value = false
        val welcome = when (language) {
            DetectedLanguage.HINDI -> "स्वागत है। SVKM NMIMS Global University, Dhule में आपका स्वागत है। मैं undergraduate courses और आधिकारिक university जानकारी में सहायता कर सकता हूँ।"
            DetectedLanguage.MARATHI -> "स्वागत आहे. SVKM NMIMS Global University, Dhule मध्ये आपले स्वागत आहे. मी undergraduate courses आणि अधिकृत university माहितीमध्ये मदत करू शकतो."
            else -> "Welcome to SVKM NMIMS Global University, Dhule. I can help with undergraduate courses and verified university information. What would you like to know?"
        }
        addMessage(Message(speaker = Speaker.MITRA, text = welcome))
        _state.value = AssistantState.SPEAKING
        speak(welcome)
    }

    fun submit(text: String, speak: (String) -> Unit) {
        if (text.isBlank()) return

        val clean = text.trim()
        addMessage(Message(speaker = Speaker.USER, text = clean))
        _state.value = AssistantState.THINKING

        viewModelScope.launch {
            runCatching {
                val result = provider.respond(clean, _detectedLanguage.value)
                _requiresEscalation.value = result.requiresEscalation
                addMessage(Message(speaker = Speaker.MITRA, text = result.reply))
                _state.value = AssistantState.SPEAKING
                speak(result.reply)
            }.onFailure {
                val fallback = "I could not retrieve verified information. Please contact the Admission Department."
                addMessage(Message(speaker = Speaker.MITRA, text = fallback))
                _state.value = AssistantState.SPEAKING
                speak(fallback)
            }
        }
    }

    fun addMessage(message: Message) {
        _messages.value = _messages.value + message
    }
}
