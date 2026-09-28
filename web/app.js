const COPY = {
  english: {
    label: "English",
    locale: "en-IN",
    welcomePrompt: "Welcome to SVKM NMIMS Global University, Dhule. Before we begin, please tell me your preferred language: English, Hindi, or Marathi.",
    languagePrompt: "Please say English, Hindi, or Marathi.",
    intro: "Welcome to SVKM NMIMS Global University, Dhule. The official website lists three academic areas: School of Commerce, School of Technology, Management and Engineering, and School of Pharmacy and Technology Management. The homepage lists BBA and BCA under undergraduate programmes. Course-wise official intake is not available in the knowledge base. How may I help you?",
    transfer: "For detailed admission-related information, I will connect you with the Admission Department. Please stay on the line."
  },
  hindi: {
    label: "Hindi",
    locale: "hi-IN",
    welcomePrompt: "SVKM NMIMS Global University, Dhule में आपका स्वागत है। शुरुआत से पहले, कृपया अपनी पसंदीदा भाषा बताइए: English, Hindi, या Marathi.",
    languagePrompt: "कृपया English, Hindi, या Marathi कहें।",
    intro: "SVKM NMIMS Global University, Dhule में आपका स्वागत है। आधिकारिक वेबसाइट पर तीन academic areas दिए गए हैं: School of Commerce, School of Technology, Management and Engineering, और School of Pharmacy and Technology Management. Homepage पर undergraduate programmes में BBA और BCA सूचीबद्ध हैं। Knowledge base में course-wise official intake उपलब्ध नहीं है। मैं आपकी कैसे सहायता कर सकता हूँ?",
    transfer: "विस्तृत प्रवेश संबंधी जानकारी के लिए मैं आपको Admission Department से जोड़ रहा हूँ। कृपया लाइन पर बने रहें।"
  },
  marathi: {
    label: "Marathi",
    locale: "mr-IN",
    welcomePrompt: "SVKM NMIMS Global University, Dhule मध्ये आपले स्वागत आहे. सुरुवात करण्यापूर्वी, कृपया आपली आवडती भाषा सांगा: English, Hindi, किंवा Marathi.",
    languagePrompt: "कृपया English, Hindi, किंवा Marathi म्हणा.",
    intro: "SVKM NMIMS Global University, Dhule मध्ये आपले स्वागत आहे. अधिकृत वेबसाइटवर तीन academic areas दिले आहेत: School of Commerce, School of Technology, Management and Engineering, आणि School of Pharmacy and Technology Management. मुख्यपृष्ठावर undergraduate programmes मध्ये BBA आणि BCA सूचीबद्ध आहेत. Knowledge base मध्ये course-wise official intake उपलब्ध नाही. मी तुम्हाला कशा मदत करू?",
    transfer: "प्रवेशासंबंधी सविस्तर माहितीसाठी मी आपल्याला Admission Department शी जोडत आहे. कृपया लाईनवर रहा."
  }
};

const languageMap = {
  english: "en-IN",
  hindi: "hi-IN",
  marathi: "mr-IN"
};

const voiceMap = {
  english: "en-IN",
  hindi: "hi-IN",
  marathi: "mr-IN"
};

let language = null;
let selectedLanguageCode = "en-IN";
let recognition = null;
let speaking = false;
let isCallActive = false;
let isMuted = false;
let isSpeakerOn = true;
let languageSelected = false;
let overviewSequenceInProgress = false;
let callTimer = null;
let callStartTime = 0;
let currentState = "IDLE";
let ended = false;
let lastIntent = "-";
let recognitionStatus = "Not initialized";
let lastRecognizedText = "-";
let speechError = "None";

const speechDiagnostics = {
  micPermission: "UNKNOWN",
  speechApi: "UNKNOWN",
  recognitionStart: "NO",
  audioCapture: "NO",
  speechResult: "NO",
  error: "None"
};

const $ = (selector) => document.querySelector(selector);
const copy = () => COPY[language] || COPY.english;
const overviewFlow = window.OverviewFlow || { buildOverviewSequence: () => [], buildLanguagePrompt: () => "Welcome to SVKM NMIMS Global University, Dhule. Before we begin, please select your preferred language: English, Hindi, or Marathi." };
const normalizeText = (value = "") => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const containsAny = (value, terms) => {
  const normalizedValue = normalizeText(value);
  return terms.some((term) => normalizedValue.includes(normalizeText(term)));
};

function getSelectedLanguageCode() {
  if (language && languageMap[language]) {
    return languageMap[language];
  }
  return selectedLanguageCode || "en-IN";
}

function setSelectedLanguage(nextLanguage) {
  if (!nextLanguage) return;
  language = nextLanguage;
  selectedLanguageCode = languageMap[nextLanguage] || "en-IN";
  if (recognition) {
    recognition.lang = selectedLanguageCode;
  }
  setTestingPanel();
}

function updateSpeechError(message) {
  speechError = message || "None";
  setTestingPanel();
}

function formatDuration(totalSeconds) {
  const total = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  $("#digital-clock").textContent = time;
}

function setTestingPanel() {
  $("#testing-language").textContent = language ? copy().label : "Pending";
  $("#testing-state").textContent = currentState;
  $("#testing-listening").textContent = isCallActive && !isMuted && currentState === "LISTENING" ? "Yes" : "No";
  $("#testing-intent").textContent = lastIntent;
  $("#testing-transfer").textContent = currentState === "TRANSFER" ? "Yes" : "No";
  $("#testing-selected-language").textContent = language ? copy().label : "Pending";
  $("#testing-recognition-language").textContent = selectedLanguageCode || "en-IN";
  $("#testing-recognition-status").textContent = recognitionStatus;
  $("#testing-last-recognized").textContent = lastRecognizedText || "-";
  $("#testing-speech-error").textContent = speechError || "None";
  $("#testing-mic-permission").textContent = speechDiagnostics.micPermission || "UNKNOWN";
  $("#testing-speech-api").textContent = speechDiagnostics.speechApi || "UNKNOWN";
  $("#testing-recognition-start").textContent = speechDiagnostics.recognitionStart || "NO";
  $("#testing-audio-capture").textContent = speechDiagnostics.audioCapture || "NO";
  $("#testing-speech-result").textContent = speechDiagnostics.speechResult || "NO";
  $("#testing-error").textContent = speechDiagnostics.error || "None";
}

function setTranscript(text) {
  $("#transcript-box").textContent = text;
}

function setVoiceIndicator(mode) {
  $("#voice-indicator").className = `voice-indicator ${mode}`;
}

function setState(nextState) {
  currentState = nextState;
  const statusMap = {
    IDLE: "NMIMS Dhule Voice Assistant",
    CALLING: "Calling...",
    CONNECTED: "Connected",
    LISTENING: "Listening...",
    PROCESSING: "Processing...",
    SPEAKING: "NMIMS Assistant is speaking...",
    TRANSFER: "Connecting to Admission Department...",
    ENDED: "Call Ended"
  };

  $("#call-status").textContent = statusMap[nextState] || statusMap.IDLE;
  const showDuration = ["CONNECTED", "LISTENING", "PROCESSING", "SPEAKING", "TRANSFER"].includes(nextState);
  $("#call-duration").style.opacity = showDuration ? "1" : "0";
  $("#call-controls").classList.toggle("hidden", !isCallActive || nextState === "IDLE" || nextState === "ENDED");
  $("#call-button").classList.toggle("hidden", isCallActive && nextState !== "ENDED");

  if (nextState === "CALLING") {
    setVoiceIndicator("connecting");
    setTranscript("Calling...");
  } else if (nextState === "LISTENING") {
    setVoiceIndicator("listening");
    setTranscript("Listening...");
  } else if (nextState === "PROCESSING") {
    setVoiceIndicator("processing");
    setTranscript("Processing...");
  } else if (nextState === "SPEAKING") {
    setVoiceIndicator("speaking");
  } else if (nextState === "TRANSFER") {
    setVoiceIndicator("transfer");
    $("#transfer-box").classList.remove("hidden");
    setTranscript("Connecting to Admission Department...");
  } else if (nextState === "ENDED") {
    setVoiceIndicator("idle");
    setTranscript("Call Ended");
    $("#transfer-box").classList.add("hidden");
    $("#ended-actions").classList.remove("hidden");
  } else if (nextState === "IDLE") {
    setVoiceIndicator("idle");
    setTranscript("Ready");
    $("#transfer-box").classList.add("hidden");
    $("#ended-actions").classList.add("hidden");
    $("#call-duration").textContent = "00:00";
  }

  setTestingPanel();
}

function answer(input) {
  const query = input.trim().toLowerCase();
  if (!query) return { text: language === "hindi" ? "कृपया undergraduate courses या university के बारे में पूछें।" : language === "marathi" ? "कृपया undergraduate courses किंवा university बद्दल विचारा." : "Please ask about undergraduate courses or the university.", escalation: false };

  const escalation = containsAny(query, [
    "fee", "fees", "eligibility", "eligible", "vacant", "vacancy", "available seat",
    "admission confirmed", "confirm admission", "application status", "payment",
    "document verification", "counselling", "counseling", "which course should",
    "course selection", "connect", "transfer", "admission department", "currently how many seats",
    "how many seats are left", "seat now", "admission related"
  ]);

  if (escalation) return { text: copy().transfer, escalation: true };

  if (containsAny(query, ["seat", "seats", "intake"])) {
    return {
      text: language === "hindi"
        ? "Published intake और course-wise seat details वर्तमान सत्यापित knowledge base में उपलब्ध नहीं हैं। प्रवेश, eligibility और current vacancy के लिए Admission Department से संपर्क करें।"
        : language === "marathi"
          ? "Published intake आणि course-wise seat details सध्याच्या सत्यापित knowledge base मध्ये उपलब्ध नाहीत. प्रवेश, eligibility आणि current vacancy साठी Admission Department शी संपर्क करा."
          : "Published intake and course-wise seat details are not available in the current verified knowledge base. For admission, eligibility, and current vacancy information, please contact the Admission Department.",
      escalation: false
    };
  }

  if (containsAny(query, ["bba", "bca"])) {
    const course = query.includes("bca") ? "BCA" : "BBA";
    return {
      text: language === "hindi"
        ? `आधिकारिक NMIMS Dhule होमपेज पर ${course} undergraduate programme के रूप में सूचीबद्ध है। प्रवेश, eligibility और fees के लिए Admission Department से संपर्क करें।`
        : language === "marathi"
          ? `अधिकृत NMIMS Dhule होमपेजवर ${course} undergraduate programme म्हणून सूचीबद्ध आहे. प्रवेश, eligibility आणि fees साठी Admission Department शी संपर्क करा.`
          : `The official NMIMS Dhule homepage lists ${course} as an undergraduate programme. For admission, eligibility, and fee details, please contact the Admission Department.`,
      escalation: false
    };
  }

  if (containsAny(query, ["course", "courses", "program", "programmes", "undergraduate", "ug", "branch", "school", "academic"])) {
    if (language === "hindi") {
      return {
        text: "SVKM NMIMS Global University, Dhule एक state-private university है। आधिकारिक वेबसाइट पर मुख्य शैक्षणिक क्षेत्र Commerce, Pharmacy, और Engineering and Technology हैं। Commerce के अंतर्गत BBA और BCA सूचीबद्ध हैं। अधिक जानकारी के लिए Admission Department से संपर्क करें।",
        escalation: false
      };
    }
    if (language === "marathi") {
      return {
        text: "SVKM NMIMS Global University, Dhule हे महाराष्ट्रातील state-private university आहे. अधिकृत वेबसाइटवर मुख्य शैक्षणिक क्षेत्र Commerce, Pharmacy, आणि Engineering and Technology आहेत. Commerce अंतर्गत BBA आणि BCA सूचीबद्ध आहेत. अधिक माहितीसाठी Admission Department शी संपर्क करा.",
        escalation: false
      };
    }
    return {
      text: "SVKM NMIMS Global University, Dhule is a state-private university in Maharashtra. The official website lists the main academic areas as Commerce, Pharmacy, and Engineering and Technology. Commerce includes BBA and BCA on the official homepage. For more detailed information, please contact the Admission Department.",
      escalation: false
    };
  }

  return { text: copy().transfer, escalation: true };
}

function detectLanguage(text) {
  const normalized = normalizeText(text);
  if (containsAny(normalized, ["english", "en ", "en.", "english language"])) return "english";
  if (containsAny(normalized, ["hindi", "हिंदी", "हिन्दी", "हिन्दी भाषा"])) return "hindi";
  if (containsAny(normalized, ["marathi", "मराठी", "मराठा"])) return "marathi";
  return null;
}

function speakText(text, callback = null) {
  if (!window.speechSynthesis) {
    if (callback) callback();
    return;
  }

  speaking = true;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const locale = voiceMap[language] || selectedLanguageCode || "en-IN";
  utterance.lang = locale;

  const availableVoices = window.speechSynthesis.getVoices() || [];
  const preferredVoice = availableVoices.find((voice) => {
    const voiceName = (voice.name || "").toLowerCase();
    const lang = (voice.lang || "").toLowerCase();
    return lang === locale.toLowerCase() || voiceName.includes(locale.toLowerCase().replace("-", ""));
  }) || availableVoices.find((voice) => (voice.lang || "").toLowerCase().startsWith(locale.split("-")[0].toLowerCase()));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    speaking = true;
    setState("SPEAKING");
    setTranscript("NMIMS Assistant is speaking...");
  };

  utterance.onend = () => {
    speaking = false;
    if (callback) callback();
  };

  window.speechSynthesis.speak(utterance);
}

function startTimer() {
  clearInterval(callTimer);
  callStartTime = Date.now();
  callTimer = setInterval(() => {
    const elapsedSeconds = (Date.now() - callStartTime) / 1000;
    $("#call-duration").textContent = formatDuration(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(callTimer);
  $("#call-duration").textContent = "00:00";
}

function beginListening() {
  if (!recognition || ended || isMuted || !isCallActive || languageSelected || overviewSequenceInProgress) return;

  try {
    if (recognition.state === "listening") {
      recognition.stop();
      return;
    }

    const nextLanguageCode = getSelectedLanguageCode();
    selectedLanguageCode = nextLanguageCode;
    recognition.lang = nextLanguageCode;
    recognitionStatus = "Listening";
    updateSpeechError("None");
    setTestingPanel();
    setState("LISTENING");
    setTranscript(languageSelected ? "Listening..." : "Listening for language...");
    recognition.start();
  } catch (error) {
    recognitionStatus = "Error";
    updateSpeechError("Could not start voice recognition. Please try again.");
    setTimeout(() => {
      if (!ended && isCallActive && !isMuted && !speaking) beginListening();
    }, 350);
  }
}

function playOverviewSequence(callback = null) {
  const sequence = overviewFlow.buildOverviewSequence(language);
  let index = 0;
  overviewSequenceInProgress = true;

  if (recognition && recognition.state === "listening") {
    recognition.stop();
  }

  const speakNext = () => {
    if (index >= sequence.length) {
      overviewSequenceInProgress = false;
      setState("TRANSFER");
      $("#transfer-box").classList.remove("hidden");
      setTranscript("Connecting to Admission Department...");
      if (callback) callback();
      return;
    }

    const segment = sequence[index];
    if (segment.title === "Admission transfer") {
      setState("TRANSFER");
      $("#transfer-box").classList.remove("hidden");
      setTranscript("Connecting to Admission Department...");
    } else {
      setTranscript(segment.title || "NMIMS Assistant is speaking...");
    }

    speakText(segment.text, () => {
      index += 1;
      setTimeout(speakNext, 350);
    });
  };

  speakNext();
}

function handleLanguageSelection(rawText) {
  const detected = detectLanguage(rawText);
  if (!detected) {
    speakText(overviewFlow.languageText.english.languagePrompt, () => beginListening());
    return;
  }

  language = detected;
  languageSelected = true;
  selectedLanguageCode = languageMap[language] || "en-IN";
  recognitionStatus = "Language selected";
  if (recognition) {
    recognition.lang = selectedLanguageCode;
    if (recognition.state === "listening") {
      recognition.stop();
    }
  }
  setTestingPanel();
  playOverviewSequence();
}

function handleUserSpeech(rawText) {
  const text = rawText.trim();
  if (!text) return;

  if (overviewSequenceInProgress) {
    return;
  }

  const detectedLanguage = detectLanguage(text);
  lastIntent = text.slice(0, 60);
  setTestingPanel();

  if (languageSelected) {
    return;
  }

  if (detectedLanguage && !languageSelected) {
    handleLanguageSelection(text);
    return;
  }

  if (!languageSelected) {
    handleLanguageSelection(text);
    return;
  }

  setState("PROCESSING");
  setTranscript("Processing...");

  window.setTimeout(() => {
    const result = answer(text);
    if (result.escalation) {
      setState("TRANSFER");
      $("#transfer-box").classList.remove("hidden");
      speakText(copy().transfer, () => {
        setTranscript("Admission Department");
        setTimeout(() => {
          if (!ended && isCallActive) {
            beginListening();
          }
        }, 800);
      });
      return;
    }

    speakText(result.text, () => {
      if (!ended && isCallActive) beginListening();
    });
  }, 350);
}

function startCall() {
  ended = false;
  language = null;
  languageSelected = false;
  overviewSequenceInProgress = false;
  selectedLanguageCode = "en-IN";
  recognitionStatus = "Waiting for language";
  lastRecognizedText = "-";
  speechError = "None";
  isMuted = false;
  isSpeakerOn = true;
  isCallActive = true;
  setTestingPanel();
  $("#transfer-box").classList.add("hidden");
  $("#ended-actions").classList.add("hidden");
  setState("CALLING");

  window.setTimeout(() => {
    setState("CONNECTED");
    $("#call-duration").style.opacity = "1";
    startTimer();
    speakText("Welcome to SVKM NMIMS Global University, Dhule.\n\nBefore we begin, please select your preferred language: English, Hindi, or Marathi.", () => {
      setState("LISTENING");
      beginListening();
    });
  }, 1300);
}

function resetToIdle() {
  ended = false;
  language = null;
  languageSelected = false;
  overviewSequenceInProgress = false;
  selectedLanguageCode = "en-IN";
  recognitionStatus = "Idle";
  lastRecognizedText = "-";
  speechError = "None";
  isMuted = false;
  isSpeakerOn = true;
  isCallActive = false;
  if (recognition) {
    recognition.stop();
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  stopTimer();
  setState("IDLE");
  setTestingPanel();
}

function endCall() {
  ended = true;
  isCallActive = false;
  recognitionStatus = "Stopped";
  if (recognition) {
    recognition.stop();
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  stopTimer();
  $("#transfer-box").classList.add("hidden");
  setState("ENDED");
  setTestingPanel();
}

function toggleMute() {
  if (!isCallActive || ended) return;
  isMuted = !isMuted;
  const muteButton = document.querySelector('[data-action="mute"]');
  muteButton.classList.toggle("active", isMuted);
  setTranscript(isMuted ? "Microphone muted" : "Microphone on");
  if (isMuted && recognition) recognition.stop();
  if (!isMuted && !speaking) beginListening();
}

function toggleSpeaker() {
  if (!isCallActive || ended) return;
  isSpeakerOn = !isSpeakerOn;
  const speakerButton = document.querySelector('[data-action="speaker"]');
  speakerButton.classList.toggle("active", isSpeakerOn);
  setTranscript(isSpeakerOn ? "Speaker enabled" : "Speaker muted");
}

function showKeypad() {
  if (!isCallActive) return;
  $("#keypad-overlay").classList.remove("hidden");
  $("#keypad-overlay").setAttribute("aria-hidden", "false");
}

function hideKeypad() {
  $("#keypad-overlay").classList.add("hidden");
  $("#keypad-overlay").setAttribute("aria-hidden", "true");
}

document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setState("IDLE");
  setTestingPanel();

  $("#call-button").addEventListener("click", startCall);
  $("#call-again-button").addEventListener("click", startCall);
  $("#back-button").addEventListener("click", resetToIdle);

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "mute") toggleMute();
      if (action === "speaker") toggleSpeaker();
      if (action === "keypad") showKeypad();
      if (action === "end") endCall();
    });
  });

  $("#close-keypad").addEventListener("click", hideKeypad);
  $("#keypad-overlay").addEventListener("click", (event) => {
    if (event.target === $("#keypad-overlay")) hideKeypad();
  });

  document.querySelectorAll(".keypad-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.classList.contains("empty")) {
        setTranscript(`Keypad pressed: ${button.textContent}`);
      }
    });
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechDiagnostics.speechApi = SpeechRecognition ? "AVAILABLE" : "UNAVAILABLE";
  if (!SpeechRecognition) {
    recognitionStatus = "Unsupported";
    speechError = "Voice recognition is not supported in this browser. Please use Google Chrome.";
    speechDiagnostics.error = speechError;
    setTranscript("Voice recognition is not supported in this browser. Please use Google Chrome.");
    setTestingPanel();
    return;
  }

  const isInsecureHttpContext = window.location.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isInsecureHttpContext) {
    speechError = "Microphone access may be blocked because this page is running over HTTP. Use HTTPS or localhost for microphone permission.";
    speechDiagnostics.error = speechError;
    speechDiagnostics.micPermission = "FAILED";
    speechDiagnostics.audioCapture = "NO";
    setTestingPanel();
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        speechDiagnostics.micPermission = "OK";
        speechDiagnostics.audioCapture = "YES";
        setTestingPanel();
      })
      .catch((error) => {
        speechDiagnostics.micPermission = "FAILED";
        speechDiagnostics.audioCapture = "NO";
        speechDiagnostics.error = (error && error.name ? `${error.name}: ${error.message}` : String(error)) || "Microphone permission failed.";
        speechError = speechDiagnostics.error;
        setTestingPanel();
      });
  } else {
    speechDiagnostics.micPermission = "FAILED";
    speechDiagnostics.audioCapture = "NO";
    speechDiagnostics.error = "navigator.mediaDevices.getUserMedia is unavailable. Use Chrome on localhost or HTTPS.";
    speechError = speechDiagnostics.error;
    setTestingPanel();
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = selectedLanguageCode;

  recognition.onstart = () => {
    recognitionStatus = "Listening";
    speechDiagnostics.recognitionStart = "YES";
    setState("LISTENING");
    setTestingPanel();
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result && result[0]) {
        transcript += `${result[0].transcript} `;
      }
    }

    transcript = transcript.trim();
    if (!transcript) return;

    lastRecognizedText = transcript;
    speechDiagnostics.speechResult = "YES";
    setTestingPanel();

    const finalResult = event.results[event.results.length - 1];
    if (finalResult && finalResult.isFinal) {
      speechError = "None";
      recognitionStatus = "Recognized";
      updateSpeechError("None");
      handleUserSpeech(transcript);
    } else {
      setTranscript(`Listening... ${transcript}`);
    }
  };

  recognition.onerror = (event) => {
    const errorMessages = {
      "not-allowed": "Microphone permission is required.",
      "no-speech": "Could not hear your voice. Please try again.",
      "audio-capture": "Microphone could not be accessed. Please check your device settings.",
      network: "Network error while recognizing speech. Please try again.",
      aborted: "Voice recognition was stopped. Please try again."
    };

    recognitionStatus = "Error";
    speechError = errorMessages[event.error] || "Speech recognition failed. Please try again.";
    speechDiagnostics.error = speechError;
    setTranscript(speechError);
    setTestingPanel();

    if (!ended && isCallActive) {
      setTimeout(() => {
        if (!ended && isCallActive && !isMuted && !speaking) beginListening();
      }, 500);
    }
  };

  recognition.onend = () => {
    recognitionStatus = "Stopped";
    setTestingPanel();
    if (!ended && isCallActive && !isMuted && !speaking && !languageSelected && !overviewSequenceInProgress) {
      setTimeout(() => beginListening(), 300);
    }
  };

  setInterval(updateClock, 15000);
});
