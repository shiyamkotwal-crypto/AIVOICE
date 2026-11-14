import React from 'react';
import { Sparkles } from 'lucide-react';

const SUGGESTIONS = {
  'Academic & Admissions': {
    en: [
      'When is the deadline for semester fee payment?',
      'Where can I find the mid-term examination timetable?',
      'What are the minimum attendance criteria for final exams?',
    ],
    hi: [
      'सेमेस्टर फीस जमा करने की अंतिम तिथि क्या है?',
      'मिड-टर्म परीक्षा की समय सारिणी कहाँ मिलेगी?',
      'परीक्षा में बैठने के लिए न्यूनतम उपस्थिति कितनी होनी चाहिए?',
    ],
    kn: [
      'ಸೆಮಿಸ್ಟರ್ ಶುಲ್ಕ ಪಾವತಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ?',
      'ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
    ],
    es: [
      '¿Cuál es la fecha límite para pagar la matrícula?',
      '¿Dónde puedo consultar el calendario de exámenes?',
    ],
  },
  'Technical Helpdesk': {
    en: [
      'How do I connect my laptop to campus Wi-Fi?',
      'I forgot my student portal password, how do I reset it?',
      'How do I get free campus MATLAB and Microsoft licenses?',
    ],
    hi: [
      'लैपटॉप को कैंपस वाई-फाई से कैसे जोड़ें?',
      'स्टूडेंट पोर्टल पासवर्ड भूल गया हूँ, रीसेट कैसे करें?',
      'सॉफ्टवेयर लाइसेंस कैसे प्राप्त करें?',
    ],
    kn: [
      'ಕ್ಯಾಂಪಸ್ ವೈ-ಫೈ ಸಂಪರ್ಕಿಸುವುದು ಹೇಗೆ?',
      'ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವುದು ಹೇಗೆ?',
    ],
    es: [
      '¿Cómo me conecto al Wi-Fi del campus?',
      'Olvidé la contraseña de mi portal, ¿cómo la restablezco?',
    ],
  },
  'Campus Facilities': {
    en: [
      'What are the opening hours for the Central Library?',
      'How do I request hostel maintenance or room change?',
      'What are the timings for the campus shuttle buses?',
    ],
    hi: [
      'केंद्रीय पुस्तकालय के खुलने और बंद होने का समय क्या है?',
      'हॉस्टल रूम बदलने के लिए कैसे अनुरोध करें?',
      'कैंपस बस के क्या समय हैं?',
    ],
    kn: [
      'ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯದ ತೆರೆಯುವ ಸಮಯವೇನು?',
      'ಕ್ಯಾಂಪಸ್ ಬಸ್ ಸೌಲಭ್ಯದ ವಿವರ ನೀಡಿ.',
    ],
    es: [
      '¿Cuáles son los horarios de la biblioteca central?',
      '¿Cómo solicito un cambio de habitación en el albergue?',
    ],
  },
  'General Administrative': {
    en: [
      'How do I get a duplicate student ID card?',
      'Where can I apply for an official bonafide certificate?',
      'What is the procedure for obtaining academic transcripts?',
    ],
    hi: [
      'नया छात्र आईडी कार्ड कैसे प्राप्त करें?',
      'बोनाफाइड प्रमाणपत्र के लिए कहाँ आवेदन करें?',
      'अकादमिक ट्रांसक्रिप्ट प्राप्त करने की प्रक्रिया क्या है?',
    ],
    kn: [
      'ವಿದ್ಯಾರ್ಥಿ ಗುರುತಿನ ಚೀಟಿ ಪಡೆಯುವುದು ಹೇಗೆ?',
      'ಬೋನಾಫೈಡ್ ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ ಎಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು?',
    ],
    es: [
      '¿Cómo obtengo un duplicado de mi credencial de estudiante?',
      '¿Dónde puedo solicitar una constancia de estudios?',
    ],
  },
};

export default function QuickActionChips({ domain = 'General Administrative', language = 'en-US', onSelect }) {
  const langKey = language.split('-')[0].toLowerCase();
  const domainData = SUGGESTIONS[domain] || SUGGESTIONS['General Administrative'];
  const prompts = domainData[langKey] || domainData['en'] || [];

  if (prompts.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-1 px-1 scrollbar-none">
      <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap pl-1">
        <Sparkles className="w-3 h-3 text-brand-500" />
        <span>Suggestions:</span>
      </div>
      {prompts.map((prompt, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(prompt)}
          className="px-3 py-1 text-xs rounded-full bg-slate-100 hover:bg-brand-50 dark:bg-slate-800/80 dark:hover:bg-brand-950/50 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 border border-slate-200/60 dark:border-slate-700/60 hover:border-brand-500/30 transition-all whitespace-nowrap shadow-xs"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
