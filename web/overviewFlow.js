(function (global) {
  const languageText = {
    english: {
      welcomePrompt: "Welcome to SVKM NMIMS Global University, Dhule.\n\nBefore we begin, please select your preferred language: English, Hindi, or Marathi.",
      languagePrompt: "Please say English, Hindi, or Marathi.",
      transfer: "Admission, eligibility, course selection, current vacant seats, application status or other detailed admission-related information can be connected to the SVKM NMIMS Global University, Dhule Admission Department. Please stay on the line.",
      intro: "SVKM NMIMS Global University, Dhule is a state-private university in Maharashtra. The current official website identifies the Dhule campus and lists the main academic areas as Commerce, Pharmacy, and Engineering and Technology.",
      branches: "The main academic areas are Commerce, Pharmacy, and Engineering and Technology. The official Dhule structure also refers to School of Commerce, School of Technology, Management and Engineering, and School of Pharmacy and Technology Management.",
      ug: "Under Commerce, the current official Dhule homepage lists Bachelor of Business Administration, BBA, and Bachelor in Computer Applications, BCA. These are the currently confirmed undergraduate programmes in the official knowledge base.",
      pg: "The official Dhule website and admission notices confirm Engineering and Technology programmes such as B.Tech, B.Tech MBA, M.Tech, and MCA. The current official academic information also references Computer Engineering in the university's departments and activities.",
      details: "The official website and university admission documents list the Pharmacy and Engineering areas as part of the Dhule academic structure. Published intake and seat numbers are official numbers, but they are not the same as current vacant seats. For current vacancy, eligibility, fees, and detailed admission information, the official published documents and Admission Department should be used.",
      final: "Admission, eligibility, course selection, current vacant seats, application status or other detailed admission-related information can be connected to the SVKM NMIMS Global University, Dhule Admission Department. Please stay on the line."
    },
    hindi: {
      welcomePrompt: "Welcome to SVKM NMIMS Global University, Dhule.\n\nआगे की जानकारी के लिए कृपया अपनी पसंदीदा भाषा चुनें: English, Hindi या Marathi.",
      languagePrompt: "कृपया English, Hindi या Marathi कहें।",
      transfer: "Admission, eligibility, course selection, current vacant seats, application status या अन्य detailed admission-related information के लिए मैं आपको SVKM NMIMS Global University, Dhule के Admission Department से जोड़ सकता हूँ। कृपया लाइन पर बने रहें।",
      intro: "SVKM NMIMS Global University, Dhule महाराष्ट्र का एक state-private university है। वर्तमान आधिकारिक वेबसाइट Dhule campus को पहचानती है और मुख्य शैक्षणिक क्षेत्र Commerce, Pharmacy, और Engineering and Technology के रूप में सूचीबद्ध करती है।",
      branches: "मुख्य शैक्षणिक क्षेत्र Commerce, Pharmacy, और Engineering and Technology हैं। आधिकारिक Dhule structure में School of Commerce, School of Technology, Management and Engineering, और School of Pharmacy and Technology Management का उल्लेख भी है।",
      ug: "Commerce के अंतर्गत वर्तमान आधिकारिक Dhule homepage पर Bachelor of Business Administration, BBA, और Bachelor in Computer Applications, BCA, सूचीबद्ध हैं। ये वर्तमान सत्यापित undergraduate programmes हैं।",
      pg: "आधिकारिक Dhule वेबसाइट और admission notices में Engineering and Technology programmes जैसे B.Tech, B.Tech MBA, M.Tech, और MCA का उल्लेख है। वर्तमान आधिकारिक academic information में Computer Engineering का भी उल्लेख मिलता है।",
      details: "अधिकृत वेबसाइट और university admission documents में Pharmacy और Engineering क्षेत्रों को Dhule academic structure का हिस्सा बताया गया है। Published intake और seat numbers official numbers हैं, लेकिन ये current vacant seats के समान नहीं हैं। Current vacancy, eligibility, fees, और detailed admission information के लिए official published documents और Admission Department का उपयोग किया जाना चाहिए।",
      final: "Admission, eligibility, course selection, current vacant seats, application status या अन्य detailed admission-related information के लिए मैं आपको SVKM NMIMS Global University, Dhule के Admission Department से जोड़ सकता हूँ। कृपया लाइन पर बने रहें।"
    },
    marathi: {
      welcomePrompt: "SVKM NMIMS Global University, Dhule मध्ये आपले स्वागत आहे.\n\nपुढील माहितीसाठी कृपया आपली पसंतीची भाषा निवडा: English, Hindi किंवा Marathi.",
      languagePrompt: "कृपया English, Hindi किंवा Marathi म्हणा.",
      transfer: "Admission, eligibility, course selection, current vacant seats, application status किंवा इतर detailed admission-related information साठी मी तुम्हाला SVKM NMIMS Global University, Dhule च्या Admission Department शी connect करत आहे. कृपया call वर राहा.",
      intro: "SVKM NMIMS Global University, Dhule हे महाराष्ट्रातील state-private university आहे. वर्तमान अधिकृत वेबसाइट Dhule campus ओळखते आणि मुख्य शैक्षणिक क्षेत्र Commerce, Pharmacy, आणि Engineering and Technology म्हणून सूचीबद्ध करते.",
      branches: "मुख्य शैक्षणिक क्षेत्र Commerce, Pharmacy, आणि Engineering and Technology आहेत. अधिकृत Dhule structure मध्ये School of Commerce, School of Technology, Management and Engineering, आणि School of Pharmacy and Technology Management यांचा उल्लेखही आहे.",
      ug: "Commerce अंतर्गत वर्तमान अधिकृत Dhule homepage वर Bachelor of Business Administration, BBA, आणि Bachelor in Computer Applications, BCA, सूचीबद्ध आहेत. हे वर्तमान सत्यापित undergraduate programmes आहेत.",
      pg: "अधिकृत Dhule वेबसाइट आणि admission notices मध्ये Engineering and Technology programmes जसे B.Tech, B.Tech MBA, M.Tech, आणि MCA यांचा उल्लेख आहे. वर्तमान अधिकृत academic information मध्ये Computer Engineering यांचा उल्लेखही आढळतो.",
      details: "अधिकृत वेबसाइट आणि university admission documents मध्ये Pharmacy आणि Engineering क्षेत्रांना Dhule academic structure चा भाग म्हटले आहे. Published intake आणि seat numbers official numbers आहेत, पण ते current vacant seats सारखे नाहीत. Current vacancy, eligibility, fees, आणि detailed admission information साठी official published documents आणि Admission Department वापर करणे आवश्यक आहे.",
      final: "Admission, eligibility, course selection, current vacant seats, application status किंवा इतर detailed admission-related information साठी मी तुम्हाला SVKM NMIMS Global University, Dhule च्या Admission Department शी connect करत आहे. कृपया call वर राहा."
    }
  };

  function buildLanguagePrompt(language) {
    const key = language && languageText[language] ? language : 'english';
    return languageText[key].welcomePrompt;
  }

  function buildOverviewSequence(language) {
    const key = language && languageText[language] ? language : 'english';
    const copy = languageText[key];
    return [
      { title: 'University introduction', text: copy.intro },
      { title: 'Main academic areas', text: copy.branches },
      { title: 'Commerce programmes', text: copy.ug },
      { title: 'Pharmacy and Engineering overview', text: copy.pg },
      { title: 'Published intake and official information', text: copy.details },
      { title: 'Admission transfer', text: copy.final }
    ];
  }

  const api = {
    buildLanguagePrompt,
    buildOverviewSequence,
    languageText
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.OverviewFlow = api;
})(typeof window !== 'undefined' ? window : globalThis);
