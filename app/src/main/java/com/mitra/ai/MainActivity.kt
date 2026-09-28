package com.mitra.ai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.mitra.ai.data.AssistantState
import com.mitra.ai.data.DetectedLanguage
import com.mitra.ai.data.Message
import com.mitra.ai.data.Speaker
import java.util.Locale

class MainActivity : ComponentActivity() {
    private val viewModel by viewModels<MitraViewModel>()
    private var recognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var listening = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this) {}
        setContent { VoiceAssistantApp(viewModel, ::startListening, ::stopListening, ::connectToAdmissions, ::speak) }
    }

    private fun startListening() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) return
        listening = true
        tts?.stop()
        recognizer?.destroy()
        recognizer = SpeechRecognizer.createSpeechRecognizer(this).also { speech ->
            speech.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) = viewModel.setState(AssistantState.LISTENING)
                override fun onBeginningOfSpeech() = Unit
                override fun onResults(results: Bundle?) {
                    val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty()
                    if (text.isNotBlank()) viewModel.submit(text, ::speak)
                    listening = false
                }
                override fun onError(error: Int) { listening = false; viewModel.setState(AssistantState.IDLE) }
                override fun onEndOfSpeech() = viewModel.setState(AssistantState.THINKING)
                override fun onRmsChanged(rmsdB: Float) = Unit
                override fun onBufferReceived(buffer: ByteArray?) = Unit
                override fun onPartialResults(partialResults: Bundle?) = Unit
                override fun onEvent(eventType: Int, params: Bundle?) = Unit
            })
            val locale = when (viewModel.detectedLanguage.value) {
                DetectedLanguage.HINDI -> "hi-IN"
                DetectedLanguage.MARATHI -> "mr-IN"
                else -> "en-IN"
            }
            speech.startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
            })
        }
    }

    private fun stopListening() {
        listening = false
        recognizer?.cancel()
        recognizer?.destroy()
        recognizer = null
        tts?.stop()
        viewModel.setState(AssistantState.IDLE)
    }

    private fun speak(text: String) {
        val locale = when (viewModel.detectedLanguage.value) {
            DetectedLanguage.HINDI -> Locale("hi", "IN")
            DetectedLanguage.MARATHI -> Locale("mr", "IN")
            else -> Locale("en", "IN")
        }
        tts?.language = locale
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "nmims-response")
        viewModel.setState(AssistantState.IDLE)
    }

    private fun connectToAdmissions() {
        viewModel.addMessage(Message(speaker = Speaker.MITRA, text = "Transfer simulation: Admission Department would receive this request. No phone call has been placed."))
    }

    override fun onDestroy() {
        recognizer?.destroy()
        tts?.shutdown()
        super.onDestroy()
    }
}

@Composable
private fun VoiceAssistantApp(viewModel: MitraViewModel, listen: () -> Unit, stop: () -> Unit, connect: () -> Unit, speak: (String) -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val selected by viewModel.languageSelected.collectAsState()
    val language by viewModel.detectedLanguage.collectAsState()
    val state by viewModel.state.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val requiresEscalation by viewModel.requiresEscalation.collectAsState()
    var hasMicPermission by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { hasMicPermission = it }
    val colors = lightColorScheme(primary = Color(0xFF0B5D57), secondary = Color(0xFFE39B32), background = Color(0xFFF4F1EA), surface = Color.White)

    MaterialTheme(colorScheme = colors) {
        Surface(Modifier.fillMaxSize(), color = colors.background) {
            Column(Modifier.fillMaxSize().padding(20.dp)) {
                Spacer(Modifier.height(18.dp))
                Text("SVKM NMIMS", color = colors.primary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Dhule voice desk", fontSize = 31.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1B2827))
                Text("Verified university information, in your language.", color = Color(0xFF53615E))
                Spacer(Modifier.height(18.dp))
                if (!selected) {
                    LanguageChooser { chosen -> viewModel.selectLanguage(chosen, speak) }
                } else {
                    ActiveConversation(language, state, messages, requiresEscalation, listen = { if (hasMicPermission) listen() else permissionLauncher.launch(Manifest.permission.RECORD_AUDIO) }, stop = stop, connect = connect)
                }
            }
        }
    }
}

@Composable
private fun LanguageChooser(select: (DetectedLanguage) -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(18.dp)) {
        Column(Modifier.padding(22.dp)) {
            Icon(Icons.Default.Language, contentDescription = null, tint = Color(0xFF0B5D57), modifier = Modifier.size(32.dp))
            Spacer(Modifier.height(12.dp))
            Text("Welcome to SVKM NMIMS Global University, Dhule.", fontSize = 21.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Before we begin, please tell me your preferred language: English, Hindi, or Marathi.", color = Color(0xFF53615E))
            Spacer(Modifier.height(20.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                LanguageButton("English", DetectedLanguage.ENGLISH, select)
                LanguageButton("हिंदी", DetectedLanguage.HINDI, select)
                LanguageButton("मराठी", DetectedLanguage.MARATHI, select)
            }
        }
    }
}

@Composable
private fun LanguageButton(label: String, language: DetectedLanguage, select: (DetectedLanguage) -> Unit) {
    Button(onClick = { select(language) }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0B5D57)), modifier = Modifier.width(104.dp)) { Text(label) }
}

@Composable
private fun ActiveConversation(language: DetectedLanguage, state: AssistantState, messages: List<Message>, requiresEscalation: Boolean, listen: () -> Unit, stop: () -> Unit, connect: () -> Unit) {
    Surface(color = Color(0xFFE2E9E3), shape = RoundedCornerShape(50.dp)) {
        Row(Modifier.padding(horizontal = 14.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(9.dp).background(if (state == AssistantState.IDLE) Color(0xFF2E8B57) else Color(0xFFE39B32), CircleShape))
            Spacer(Modifier.width(8.dp))
            Text("${language.label()}  •  ${state.label()}", fontWeight = FontWeight.SemiBold, color = Color(0xFF1B2827))
        }
    }
    Spacer(Modifier.height(14.dp))
    LazyColumn(Modifier.fillMaxWidth().height(300.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) { items(messages) { MessageBubble(it) } }
    if (requiresEscalation) {
        OutlinedButton(onClick = connect, modifier = Modifier.fillMaxWidth()) { Icon(Icons.Default.Call, null); Spacer(Modifier.width(8.dp)); Text("Connect to Admission Department") }
        Spacer(Modifier.height(8.dp))
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = if (state == AssistantState.LISTENING) stop else listen, modifier = Modifier.size(78.dp).background(Color(0xFF0B5D57), CircleShape)) {
            Icon(if (state == AssistantState.LISTENING) Icons.Default.Stop else Icons.Default.Mic, contentDescription = "Microphone", tint = Color.White, modifier = Modifier.size(38.dp))
        }
    }
    Text("Tap the microphone to ask about verified undergraduate courses.", Modifier.fillMaxWidth().padding(top = 8.dp), color = Color(0xFF53615E), fontSize = 13.sp)
}

@Composable
private fun MessageBubble(message: Message) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (message.speaker == Speaker.USER) Arrangement.End else Arrangement.Start) {
        Surface(color = if (message.speaker == Speaker.USER) Color(0xFF0B5D57) else Color.White, shape = RoundedCornerShape(14.dp), shadowElevation = 1.dp) {
            Text(message.text, Modifier.padding(13.dp), color = if (message.speaker == Speaker.USER) Color.White else Color(0xFF1B2827))
        }
    }
}

private fun DetectedLanguage.label() = when (this) {
    DetectedLanguage.HINDI -> "Hindi"
    DetectedLanguage.MARATHI -> "Marathi"
    else -> "English"
}

private fun AssistantState.label() = when (this) {
    AssistantState.LISTENING -> "Listening"
    AssistantState.THINKING -> "Checking verified knowledge"
    AssistantState.SPEAKING -> "Speaking"
    AssistantState.IDLE -> "Ready"
}
