import { Router } from 'express';

const router = Router();

const CAMPUS_DOMAINS = [
  {
    id: 'academic',
    name: 'Academic & Admissions',
    icon: 'GraduationCap',
    color: 'emerald',
    description: 'Course syllabi, semester credits, fee structures, exam timetables, cutoff scores, and academic regulations.',
    quickPrompts: {
      en: [
        'When is the deadline for semester fee payment?',
        'Where can I find the mid-term examination timetable?',
        'What are the minimum attendance criteria for final exams?',
        'How do I apply for a course credit transfer?',
      ],
      hi: [
        'सेमेस्टर फीस जमा करने की अंतिम तिथि क्या है?',
        'मिड-टर्म परीक्षा की समय सारिणी कहाँ मिलेगी?',
        'परीक्षा में बैठने के लिए न्यूनतम उपस्थिति कितनी होनी चाहिए?',
        'कोर्स क्रेडिट ट्रांसफर के लिए कैसे आवेदन करें?',
      ],
      kn: [
        'ಸೆಮಿಸ್ಟರ್ ಶುಲ್ಕ ಪಾವತಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ಯಾವಾಗ?',
        'ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
        'ಪರೀಕ್ಷೆಗೆ ಕನಿಷ್ಠ ಹಾಜರಾತಿ ಎಷ್ಟು ಬೇಕು?',
      ],
      es: [
        '¿Cuál es la fecha límite para pagar la matrícula?',
        '¿Dónde puedo consultar el calendario de exámenes?',
        '¿Cuáles son los requisitos de asistencia mínima?',
      ],
    },
  },
  {
    id: 'technical',
    name: 'Technical Helpdesk',
    icon: 'Laptop',
    color: 'blue',
    description: 'Campus Wi-Fi (SSID, 802.1X), student portal logins, password recovery, lab software licenses, and VPN setup.',
    quickPrompts: {
      en: [
        'How do I connect my laptop to campus Wi-Fi?',
        'I forgot my student portal password, how do I reset it?',
        'How can I access MATLAB and Microsoft 365 campus licenses?',
        'How do I set up campus VPN for remote access?',
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
  },
  {
    id: 'facilities',
    name: 'Campus Facilities',
    icon: 'Building2',
    color: 'amber',
    description: 'Hostel room allocations, dining mess timings, campus shuttle transit routes, sports complex, and library hours.',
    quickPrompts: {
      en: [
        'What are the opening hours for the Central Library?',
        'How do I request hostel maintenance or room change?',
        'What are the timings for the campus shuttle buses?',
        'How do I book a court in the sports complex?',
      ],
      hi: [
        'केंद्रीय पुस्तकालय के खुलने और बंद होने का समय क्या है?',
        'हॉस्टल रूम बदलने के लिए कैसे अनुरोध करें?',
        'कैंपस बस के क्या समय हैं?',
      ],
      kn: [
        'ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯದ ತೆರೆಯುವ ಸಮಯವೇನು?',
        'ಹಾಸ್ಟೆಲ್ ಕೊಠಡಿ ನಿರ್ವಹಣೆಗೆ ಎಲ್ಲಿ ಮನವಿ ಮಾಡಬೇಕು?',
      ],
      es: [
        '¿Cuáles son los horarios de la biblioteca central?',
        '¿Cómo solicito un cambio de habitación en el albergue?',
      ],
    },
  },
  {
    id: 'administrative',
    name: 'General Administrative',
    icon: 'FileText',
    color: 'purple',
    description: 'Student ID card issuance, bonafide certificates, official transcripts, scholarship verification, and clearances.',
    quickPrompts: {
      en: [
        'How do I get a duplicate student ID card?',
        'Where can I apply for an official bonafide certificate?',
        'What is the procedure for obtaining academic transcripts?',
        'How do I submit scholarship verification documents?',
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
  },
];

const getDomainsResponse = (req, res) => {
  return res.status(200).json({
    success: true,
    domains: CAMPUS_DOMAINS,
  });
};

router.get('/', getDomainsResponse);
router.get('/info', getDomainsResponse);

export default router;
