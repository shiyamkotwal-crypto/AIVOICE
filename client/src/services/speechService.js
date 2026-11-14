/**
 * VoiceBridge AI Web Speech API Service
 * Encapsulates Speech-to-Text (STT) and Text-to-Speech (TTS)
 */

// Check browser support
export const isSTTSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const isTTSSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
};

// Language code to SpeechRecognition locale mapping
export const SPEECH_LOCALES = {
  'en': 'en-US',
  'en-US': 'en-US',
  'en-IN': 'en-IN',
  'hi': 'hi-IN',
  'hi-IN': 'hi-IN',
  'kn': 'kn-IN',
  'kn-IN': 'kn-IN',
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'ta': 'ta-IN',
  'ta-IN': 'ta-IN',
  'te': 'te-IN',
  'te-IN': 'te-IN',
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'de': 'de-DE',
  'de-DE': 'de-DE',
  'bn': 'bn-IN',
  'bn-IN': 'bn-IN',
  'mr': 'mr-IN',
  'mr-IN': 'mr-IN',
};

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (isTTSSupported()) {
      this.voices = window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.voices = window.speechSynthesis.getVoices();
        };
      }
    }
  }

  getAvailableVoices() {
    if (this.voices.length === 0 && isTTSSupported()) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  findVoiceForLanguage(langCode) {
    const locale = SPEECH_LOCALES[langCode] || langCode;
    const baseCode = locale.split('-')[0].toLowerCase();

    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Exact locale match (e.g. hi-IN)
    let match = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
    if (match) return match;

    // 2. Base language prefix match (e.g. hi)
    match = voices.find((v) => v.lang.toLowerCase().startsWith(baseCode));
    if (match) return match;

    // 3. Fallback to default voice or first available
    return voices.find((v) => v.default) || voices[0] || null;
  }

  /**
   * Start Speech-to-Text Recognition
   */
  startListening({
    lang = 'en-US',
    onStart,
    onResult,
    onError,
    onEnd,
  }) {
    if (!isSTTSupported()) {
      onError && onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop existing instance if any
    this.stopListening();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    const targetLocale = SPEECH_LOCALES[lang] || lang;
    this.recognition.lang = targetLocale;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      onStart && onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      onResult && onResult({ interimTranscript, finalTranscript });
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      let errorMsg = 'An error occurred during speech recognition.';
      switch (event.error) {
        case 'not-allowed':
          errorMsg = 'Microphone access was denied. Please allow microphone permissions in your browser.';
          break;
        case 'no-speech':
          errorMsg = 'No speech was detected. Please check your microphone and speak clearly.';
          break;
        case 'network':
          errorMsg = 'Network connection error during voice recognition.';
          break;
        case 'audio-capture':
          errorMsg = 'No microphone device found on this system.';
          break;
        default:
          errorMsg = `Voice recognition error: ${event.error}`;
      }
      onError && onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd && onEnd(finalTranscript);
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      onError && onError(err.message || 'Failed to start speech recognition.');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignore if already stopped
      }
    }
    this.isListening = false;
  }

  /**
   * Text-to-Speech Synthesis
   */
  speak(text, {
    lang = 'en-US',
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    voiceName = null,
    onStart,
    onEnd,
    onError,
  } = {}) {
    if (!isTTSSupported()) {
      onError && onError('Text-to-speech is not supported in this browser.');
      return;
    }

    // Cancel any ongoing utterance
    this.stopSpeaking();

    // Clean text: strip markdown syntax if any remained
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLocale = SPEECH_LOCALES[lang] || lang;
    utterance.lang = targetLocale;
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.volume = Math.max(0, Math.min(1.0, volume));

    // Choose voice
    if (voiceName) {
      const selected = this.getAvailableVoices().find((v) => v.name === voiceName);
      if (selected) utterance.voice = selected;
    } else {
      const autoVoice = this.findVoiceForLanguage(lang);
      if (autoVoice) utterance.voice = autoVoice;
    }

    utterance.onstart = () => {
      onStart && onStart();
    };

    utterance.onend = () => {
      onEnd && onEnd();
    };

    utterance.onerror = (event) => {
      console.warn('TTS utterance error:', event);
      onError && onError(event.error);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('SpeechSynthesis error:', err);
      onError && onError(err.message);
    }
  }

  stopSpeaking() {
    if (isTTSSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  pauseSpeaking() {
    if (isTTSSupported()) {
      window.speechSynthesis.pause();
    }
  }

  resumeSpeaking() {
    if (isTTSSupported()) {
      window.speechSynthesis.resume();
    }
  }

  isSpeaking() {
    if (!isTTSSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();
export default speechService;
