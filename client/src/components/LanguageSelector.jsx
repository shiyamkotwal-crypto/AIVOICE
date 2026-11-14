import React, { useState, useRef, useEffect, useContext } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import LanguageContext, { LANGUAGES as CONTEXT_LANGUAGES } from '../context/LanguageContext';

export const LANGUAGES = CONTEXT_LANGUAGES || [
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

export default function LanguageSelector({ currentLanguage, onChange, compact = false }) {
  const langCtx = useContext(LanguageContext);
  const activeLang =
    (typeof currentLanguage === 'string' && currentLanguage) ||
    (typeof langCtx?.selectedLanguage === 'string' && langCtx.selectedLanguage) ||
    'en-US';
  const handleLangChange = onChange || langCtx?.setLanguage;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const safeLang = typeof activeLang === 'string' && activeLang.trim() !== '' ? activeLang : 'en-US';

  // Normalize match
  const selected =
    LANGUAGES.find((l) => l.code.toLowerCase() === safeLang.toLowerCase()) ||
    LANGUAGES.find((l) => l.code.split('-')[0] === safeLang.split('-')[0]) ||
    LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    if (handleLangChange) {
      handleLangChange(lang.code);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch primary speech & AI language"
        className={`flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        }`}
      >
        <span className="px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-600 dark:text-brand-400 font-mono font-bold text-[10px] border border-brand-500/20">
          {selected?.short || 'EN'}
        </span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {compact ? selected?.native || 'English' : `${selected?.native} (${selected?.name})`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto">
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-brand-500" />
              <span>Select Spoken Language</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {selected?.short}
            </span>
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isCurrent =
                lang.code.toLowerCase() === safeLang.toLowerCase() ||
                (lang.code.split('-')[0] === safeLang.split('-')[0] && selected.code === lang.code);

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors border-l-2 ${
                    isCurrent
                      ? 'bg-brand-50/90 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-semibold border-brand-500'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`w-9 h-6 rounded-md font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                        isCurrent
                          ? 'bg-brand-500 text-white border-brand-400 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {lang.short}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                        {lang.native}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {lang.name}
                      </p>
                    </div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
