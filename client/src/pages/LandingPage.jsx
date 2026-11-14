import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Database,
  Cpu,
  GraduationCap,
  Laptop,
  Building2,
  FileText,
  Play,
  CheckCircle2,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import LanguageSelector, { LANGUAGES } from '../components/LanguageSelector';
import AudioWaveVisualizer from '../components/AudioWaveVisualizer';
import VoiceMicrophone from '../components/VoiceMicrophone';
import RainbowWaveBackground from '../components/RainbowWaveBackground';

export default function LandingPage() {
  const { isAuthenticated, demoLogin } = useAuth();
  const { speakMessage, isSpeaking } = useAudio();
  const navigate = useNavigate();

  // Interactive Live Demo State on Landing Page
  const [demoLang, setDemoLang] = useState('en-US');
  const [demoQuery, setDemoQuery] = useState('');
  const [demoResponse, setDemoResponse] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [selectedDomainTab, setSelectedDomainTab] = useState('academic');

  const handleDemoSpeakOrType = async (queryText) => {
    const textToSend = queryText || demoQuery;
    if (!textToSend.trim()) return;

    setDemoLoading(true);
    setDemoResponse('');

    // Pre-curated instant demonstration responses
    const langKey = demoLang.split('-')[0].toLowerCase();
    let reply = '';

    if (langKey === 'hi') {
      reply = 'वॉयसब्रिज एआई में आपका स्वागत है। सेमेस्टर फीस भुगतान की अंतिम तिथि 30 नवंबर है और सेंट्रल लाइब्रेरी रात 11:00 बजे तक खुली है। क्या आप किसी अन्य सेवा के बारे में जानना चाहते हैं?';
    } else if (langKey === 'kn') {
      reply = 'ವಾಯ್ಸ್‌ಬ್ರಿಡ್ಜ್ ಎಐ ಕ್ಯಾಂಪಸ್ ಸಹಾಯವಾಣಿಗೆ ಸುಸ್ವಾಗತ. ಸೆಮಿಸ್ಟರ್ ಶುಲ್ಕ ಪಾವತಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ನವೆಂಬರ್ 30. ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿಯನ್ನು ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.';
    } else if (langKey === 'es') {
      reply = 'Bienvenido a VoiceBridge AI. La fecha límite para el pago de la matrícula es el 30 de noviembre. La biblioteca central está abierta hasta las 11:00 PM.';
    } else {
      reply = 'Welcome to VoiceBridge AI. The deadline for semester fee payments is November 30th via the Student ERP portal. Campus Wi-Fi is available across all academic blocks on SSID Campus-Secure.';
    }

    setTimeout(() => {
      setDemoResponse(reply);
      setDemoLoading(false);
      speakMessage('demo', reply, demoLang);
    }, 700);
  };

  const handleOneClickDemo = async (role = 'student') => {
    const res = await demoLogin(role);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Living Dynamic Multi-Color Spectrum Waves Running Left to Right */}
      <div className="absolute top-0 left-0 right-0 h-[620px] pointer-events-none -z-10 opacity-75 dark:opacity-85">
        <RainbowWaveBackground height="620px" opacity={0.7} density={6} showControls={true} />
      </div>

      {/* Background Decorative Glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand-500/10 via-emerald-500/5 to-transparent pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Hackathon Edition: Voice & Conversational Intelligence</span>
          <span className="h-1 w-1 rounded-full bg-brand-500" />
          <span className="font-mono text-[10px]">Gemini 3.8 + Web Speech API</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15]">
          Next-Gen Multilingual{' '}
          <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Voice & Conversational Intelligence
          </span>{' '}
          Platform
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Eliminate rigid IVR menus and slow manual helpdesks. Empower academic campuses and enterprises with real-time Speech-to-Text, Gemini AI reasoning, and seamless multilingual voice synthesis in English, Hindi, Kannada, Spanish, and beyond.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Launch Voice Assistant</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <button
                onClick={() => handleOneClickDemo('student')}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl glass-panel text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
              >
                <Play className="w-4 h-4 text-brand-500" />
                <span>1-Click Demo Student</span>
              </button>

              <button
                onClick={() => handleOneClickDemo('admin')}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all"
              >
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Demo Admin Login</span>
              </button>
            </>
          )}
        </div>

        {/* Live Interactive Voice Demo Sandbox on Landing Page */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl glass-card p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Interactive Voice Sandbox
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Language:</span>
              <LanguageSelector currentLanguage={demoLang} onChange={setDemoLang} compact={true} />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] self-center">Try asking:</span>
              {[
                { en: 'When is semester fee due?', hi: 'सेमेस्टर फीस कब तक देनी है?', kn: 'ಶುಲ್ಕ ಯಾವಾಗ ಕಟ್ಟಬೇಕು?' },
                { en: 'How do I connect to Wi-Fi?', hi: 'वाईफाई पासवर्ड क्या है?', kn: 'ವೈ-ಫೈ ಕನೆಕ್ಟ್ ಮಾಡುವುದು ಹೇಗೆ?' },
                { en: 'Library timings today?', hi: 'पुस्तकालय कब तक खुला है?', kn: 'ಗ್ರಂಥಾಲಯದ ಸಮಯವೇನು?' },
              ].map((sample, idx) => {
                const langKey = demoLang.split('-')[0].toLowerCase();
                const text = sample[langKey] || sample.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDemoQuery(text);
                      handleDemoSpeakOrType(text);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    "{text}"
                  </button>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDemoSpeakOrType()}
                  placeholder={`Type or click microphone to speak in ${LANGUAGES.find((l) => l.code === demoLang)?.name || 'any language'}...`}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* STT Microphone */}
              <VoiceMicrophone
                language={demoLang}
                onTranscript={(transcript) => {
                  setDemoQuery(transcript);
                  handleDemoSpeakOrType(transcript);
                }}
              />

              <button
                type="button"
                onClick={() => handleDemoSpeakOrType()}
                disabled={demoLoading}
                className="px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
              >
                {demoLoading ? 'Processing...' : 'Send'}
              </button>
            </div>

            {/* Response Output Box */}
            {demoResponse && (
              <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-500/20 text-sm animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-500/10">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                    <Bot className="w-3.5 h-3.5 text-brand-500" />
                    <span>VoiceBridge AI Spoken Audio Response</span>
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400">
                      <AudioWaveVisualizer isPlaying={true} count={3} />
                      <span className="text-[11px] font-mono">Synthesizing TTS</span>
                    </div>
                  )}
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{demoResponse}</p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => speakMessage('demo', demoResponse, demoLang)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Audio</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">Web Speech Synthesis</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for Real-Time Multimodal Voice Intelligence
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Engineered from the ground up to replace clunky phone menus with frictionless natural voice dialogue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Mic,
              title: 'Browser-Native STT',
              color: 'text-brand-500',
              bg: 'bg-brand-500/10',
              desc: 'Continuous real-time speech recognition via Web Speech API with interim transcript streaming and noise cancellation.',
            },
            {
              icon: Cpu,
              title: 'Gemini 3.8 Reasoning',
              color: 'text-cyan-500',
              bg: 'bg-cyan-500/10',
              desc: 'High-speed conversational NLU with multi-turn memory, tailored system prompts, and cross-lingual code-switching understanding.',
            },
            {
              icon: Volume2,
              title: 'Multilingual TTS',
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
              desc: 'Instant audio playback in 10+ regional & international languages with pitch, speed, and native voice inflection controls.',
            },
            {
              icon: Database,
              title: 'Supabase PostgreSQL RLS',
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              desc: 'Production schema storing conversations, user queries, AI responses, domain tags, audio tracking, and Row Level Security.',
            },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/30 transition-all hover:shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl ${pillar.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${pillar.color}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Campus Domains Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Domain-Specific Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Tailored For Academic Campuses & Helpdesks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: GraduationCap,
              name: 'Academic & Admissions',
              color: 'emerald',
              items: ['Course details & credits', 'Semester fee payment deadlines', 'Mid-term & final exam schedules', 'Transfer and credit equivalency'],
            },
            {
              icon: Laptop,
              name: 'Technical Helpdesk',
              color: 'blue',
              items: ['Campus Wi-Fi (SSID & 802.1X)', 'Student ERP & LMS password resets', 'MATLAB & Microsoft 365 licensing', 'VPN remote access guidance'],
            },
            {
              icon: Building2,
              name: 'Campus Facilities',
              color: 'amber',
              items: ['Hostel room allocations & rules', 'Dining mess timings & menus', 'Campus shuttle transit routes', 'Sports complex court bookings'],
            },
            {
              icon: FileText,
              name: 'General Administrative',
              color: 'purple',
              items: ['Duplicate student ID card issuance', 'Official bonafide certificates', 'Academic transcripts for higher ed', 'Fee payment receipts & clearances'],
            },
          ].map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{domain.name}</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {domain.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Production Architecture Flow Diagram */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            End-to-End Multimodal Relay Pipeline
          </h2>
        </div>

        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center text-center">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
                <Mic className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">1. User Speech</p>
              <p className="text-[11px] text-slate-500">Web Speech API STT converts microphone audio to text</p>
            </div>

            <div className="hidden sm:block text-slate-400 font-bold">→</div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Express Relay</p>
              <p className="text-[11px] text-slate-500">Zod schema validation, JWT auth & language context</p>
            </div>

            <div className="hidden sm:block text-slate-400 font-bold">→</div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Gemini 3.8 Flash</p>
              <p className="text-[11px] text-slate-500">Multi-turn NLU & fluent multilingual generation</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-500/20">
              <div className="flex items-center justify-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs mb-1">
                <Volume2 className="w-4 h-4" />
                <span>4. Audio Synthesis (TTS)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Browser speechSynthesis reads aloud AI responses with pitch & speed controls.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20">
              <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                <Database className="w-4 h-4" />
                <span>5. Persistent Supabase Logs</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                PostgreSQL schema records all queries, messages, domain tags, and audio play counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-tr from-brand-700 via-emerald-600 to-teal-500 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Experience Seamless Voice Intelligence?
            </h2>
            <p className="text-brand-50 text-sm sm:text-base max-w-2xl mx-auto font-normal">
              Sign up or test with our instant pre-configured demo account to interact in English, Hindi, Kannada, Spanish, and more.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleOneClickDemo('student')}
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-md"
              >
                Try Voice Assistant Now
              </button>
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl bg-slate-900/30 hover:bg-slate-900/40 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 VoiceBridge AI — Multilingual Voice & Conversational Intelligence Platform. Built for Hackathon Excellence.</p>
      </footer>
    </div>
  );
}
