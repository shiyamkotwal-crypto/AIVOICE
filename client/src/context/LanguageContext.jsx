import React, { createContext, useContext, useState } from 'react';

export const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', native: 'English', short: 'EN' },
  { code: 'en-IN', name: 'English (India)', native: 'Indian English', short: 'EN-IN' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', short: 'HI' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', short: 'KN' },
  { code: 'es-ES', name: 'Spanish', native: 'Español', short: 'ES' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', short: 'TA' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', short: 'TE' },
  { code: 'fr-FR', name: 'French', native: 'Français', short: 'FR' },
  { code: 'de-DE', name: 'German', native: 'Deutsch', short: 'DE' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', short: 'BN' },
];

/**
 * Unicode Script Auto-Detector for Indian & Global Languages
 */
export function detectLanguageFromScript(text) {
  if (!text || typeof text !== 'string') return null;
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Devanagari (Hindi)
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN'; // Bengali
  return null;
}

const DEFAULT_META = LANGUAGES[0];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('voicebridge_pref_lang');
      if (!saved || saved === 'undefined' || saved === 'null') return 'en-US';
      return saved;
    } catch (_) {
      return 'en-US';
    }
  });

  // Sidebar filter pill state: 'active' | 'all' | 'en' | 'hi' | 'kn' | 'es'
  const [sidebarFilter, setSidebarFilter] = useState('active');

  const setLanguage = (code) => {
    const valid = typeof code === 'string' && code.trim() !== '' ? code : 'en-US';
    setSelectedLanguageState(valid);
    try {
      localStorage.setItem('voicebridge_pref_lang', valid);
    } catch (_) {}
  };

  const getBaseLanguage = (code) => {
    if (!code || typeof code !== 'string') return 'en';
    return code.split('-')[0].toLowerCase();
  };

  const safeLang = typeof selectedLanguage === 'string' && selectedLanguage.trim() !== '' ? selectedLanguage : 'en-US';

  const currentLanguageMeta =
    LANGUAGES.find((l) => l.code.toLowerCase() === safeLang.toLowerCase()) ||
    LANGUAGES.find((l) => l.code.split('-')[0] === safeLang.split('-')[0]) ||
    DEFAULT_META;

  /**
   * Evaluates if a conversation's language matches the current filter
   */
  const matchesFilter = (convLanguage, filter = sidebarFilter) => {
    if (!convLanguage || typeof convLanguage !== 'string') return filter === 'all' || filter === 'en';
    const cLang = convLanguage.toLowerCase();
    const cBase = cLang.split('-')[0];

    if (filter === 'all') return true;

    if (filter === 'active') {
      const activeBase = getBaseLanguage(safeLang);
      return cLang === safeLang.toLowerCase() || cBase === activeBase;
    }

    const targetBase = typeof filter === 'string' ? filter.toLowerCase().split('-')[0] : 'en';
    return cLang === (filter || '').toLowerCase() || cBase === targetBase;
  };

  const value = {
    selectedLanguage: safeLang,
    setLanguage,
    currentLanguageMeta,
    sidebarFilter,
    setSidebarFilter,
    getBaseLanguage,
    matchesFilter,
    detectLanguageFromScript,
    LANGUAGES,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      selectedLanguage: 'en-US',
      setLanguage: () => {},
      currentLanguageMeta: DEFAULT_META,
      sidebarFilter: 'active',
      setSidebarFilter: () => {},
      getBaseLanguage: () => 'en',
      matchesFilter: () => true,
      detectLanguageFromScript: () => null,
      LANGUAGES,
    };
  }
  return context;
}

export default LanguageContext;
