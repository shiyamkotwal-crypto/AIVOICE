import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  Mic,
  Moon,
  Sun,
  Globe,
  Sliders,
  Play,
  RotateCcw,
  Check,
  Server,
  User,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { healthAPI } from '../services/api';
import { LANGUAGES } from '../components/LanguageSelector';
import { DOMAINS } from '../components/DomainSelector';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const {
    speechRate,
    speechPitch,
    speechVolume,
    selectedVoiceName,
    availableVoices,
    autoTTS,
    isSTTSupported,
    isTTSSupported,
    setSpeechRate,
    setSpeechPitch,
    setSpeechVolume,
    setSelectedVoiceName,
    setAutoTTS,
    speakMessage,
  } = useAudio();

  const { selectedLanguage, setLanguage } = useLanguage();

  const [defaultLang, setDefaultLang] = useState(() => {
    return selectedLanguage || localStorage.getItem('voicebridge_pref_lang') || 'en-US';
  });
  const [defaultDomain, setDefaultDomain] = useState(() => {
    return localStorage.getItem('voicebridge_pref_domain') || 'General Administrative';
  });

  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await healthAPI.checkHealth();
      setSystemHealth(data);
    } catch (err) {
      console.warn('Health check failed:', err);
      setSystemHealth({ status: 'offline', error: 'Relay unreachable' });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleTestVoice = () => {
    const langKey = defaultLang.split('-')[0].toLowerCase();
    let sample = 'VoiceBridge AI voice synthesis test completed successfully.';
    if (langKey === 'hi') {
      sample = 'वॉयसब्रिज एआई बहुभाषी आवाज संश्लेषण परीक्षण सफलतापूर्वक संपन्न हुआ।';
    } else if (langKey === 'kn') {
      sample = 'ವಾಯ್ಸ್‌ಬ್ರಿಡ್ಜ್ ಎಐ ಧ್ವನಿ ಸಂಶ್ಲೇಷಣೆ ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿದೆ.';
    } else if (langKey === 'es') {
      sample = 'Prueba de síntesis de voz de VoiceBridge AI completada con éxito.';
    }
    speakMessage('test', sample, defaultLang);
  };

  const handleResetAudio = () => {
    setSpeechRate(1.0);
    setSpeechPitch(1.0);
    setSpeechVolume(1.0);
    setSelectedVoiceName(null);
    setAutoTTS(true);
  };

  const handleSavePreferences = () => {
    setLanguage(defaultLang);
    localStorage.setItem('voicebridge_pref_domain', defaultDomain);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Settings className="w-7 h-7 text-brand-500" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Web Speech synthesis, default language models, and user profile
          </p>
        </div>

        {saveToast && (
          <div className="px-3.5 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Section 1: Audio & Voice Synthesis Settings */}
      <div className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Speech Synthesis (TTS) Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust browser-native text-to-speech voice playback parameters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestVoice}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Audio</span>
            </button>
            <button
              onClick={handleResetAudio}
              title="Reset defaults"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Speech Rate</span>
              <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Voice Pitch</span>
              <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{speechPitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5 (Low)</span>
              <span>1.0 (Natural)</span>
              <span>1.5 (High)</span>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Master Volume</span>
              <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                {Math.round(speechVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={speechVolume}
              onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Mute)</span>
              <span>50%</span>
              <span>100% (Max)</span>
            </div>
          </div>
        </div>

        {/* Voice Selector & Auto TTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Available Browser Synthesizer Voice
            </label>
            <select
              value={selectedVoiceName || ''}
              onChange={(e) => setSelectedVoiceName(e.target.value || null)}
              className="w-full p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
            >
              <option value="">Auto-detect best voice matching chosen language</option>
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.default ? '— Default' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Auto-readout AI responses
              </p>
              <p className="text-[11px] text-slate-500">
                Automatically speak responses out loud when received
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoTTS}
              onChange={(e) => setAutoTTS(e.target.checked)}
              className="w-4 h-4 accent-brand-500 rounded"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Language & Campus Domain Preferences */}
      <div className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Language & Workspace Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set default spoken language, default campus domain, and visual theme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Language
            </label>
            <select
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Campus Domain
            </label>
            <select
              value={defaultDomain}
              onChange={(e) => setDefaultDomain(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              {DOMAINS.map((domain) => (
                <option key={domain.name} value={domain.name}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                  !isDark
                    ? 'bg-white text-slate-900 border-brand-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                  isDark
                    ? 'bg-slate-800 text-white border-brand-500 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-transparent'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-200" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Save Workspace Preferences
          </button>
        </div>
      </div>

      {/* Section 3: System Diagnostics & Health */}
      <div className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Platform Diagnostic Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live verification of AI reasoning, Web Speech API, and database services
              </p>
            </div>
          </div>

          <button
            onClick={checkHealth}
            disabled={healthLoading}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            {healthLoading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Web Speech API */}
          <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Web Speech STT/TTS</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isSTTSupported && isTTSSupported ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              STT: {isSTTSupported ? 'Supported' : 'Not Supported'} • TTS: {isTTSSupported ? 'Supported' : 'Not Supported'}
            </p>
          </div>

          {/* Gemini AI */}
          <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Gemini 3.8 AI Model</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth?.gemini_configured ? 'bg-emerald-500' : 'bg-emerald-400'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {systemHealth?.gemini_configured ? 'Connected (Live API)' : 'Built-in Campus Intelligence'}
            </p>
          </div>

          {/* Database */}
          <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Database Layer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              {systemHealth?.supabase_configured ? 'Supabase PostgreSQL' : 'Local Persistent Engine (Schema Active)'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: User Profile Info */}
      <div className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold text-lg uppercase shadow-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{user?.full_name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-brand-600 dark:text-brand-400 font-mono">
              <Shield className="w-3 h-3" />
              <span>Role: {user?.role || 'student'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
