import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Cpu,
  Database,
  Mic,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Zap,
  Globe,
  Activity,
  Award,
} from 'lucide-react';

export default function PresentationModal({ isOpen, onClose, onLaunchScenario }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const DEMO_SCENARIOS = [
    {
      title: 'Academic Fee & Hall Ticket Inquiry',
      language: 'en-US',
      langName: 'English (US)',
      domain: 'Academic & Admissions',
      prompt: 'When is the semester fee payment deadline and where can I download my hall ticket?',
      techHighlight: 'Gemini 3.8 Flash Contextual Reasoning + Web Speech STT & TTS',
      color: 'emerald',
    },
    {
      title: 'Technical Helpdesk — Campus Wi-Fi & Credentials',
      language: 'hi-IN',
      langName: 'हिन्दी (Hindi)',
      domain: 'Technical Helpdesk',
      prompt: 'कैंपस वाई-फाई नेटवर्क का पासवर्ड क्या है और इसे लैपटॉप में कैसे जोड़ें?',
      techHighlight: 'Cross-Lingual Hindi Phonetics + WPA2-Enterprise Guidance',
      color: 'blue',
    },
    {
      title: 'Campus Facilities — Library Hours & Hostel Allotment',
      language: 'kn-IN',
      langName: 'ಕನ್ನಡ (Kannada)',
      domain: 'Campus Facilities',
      prompt: 'ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯದ ಸಮಯ ಮತ್ತು ಹಾಸ್ಟೆಲ್ ಕೊಠಡಿ ಬದಲಾವಣೆ ಪ್ರಕ್ರಿಯೆ ತಿಳಿಸಿ.',
      techHighlight: 'Regional Kannada NLP + Spoken Audio Synthesis',
      color: 'amber',
    },
    {
      title: 'Administrative Formalities — Official Transcripts & ID Cards',
      language: 'es-ES',
      langName: 'Español (Spanish)',
      domain: 'General Administrative',
      prompt: '¿Cuál es el procedimiento para solicitar una credencial de estudiante duplicada?',
      techHighlight: 'Multilingual Administrative Workflow Resolution',
      color: 'purple',
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl glass-card border border-slate-200/90 dark:border-slate-800/90 shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-brand-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Academic Defense & Presentation Deck
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold uppercase tracking-wider">
                  Professor View
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                VoiceBridge AI — Real-time Multimodal Conversational Architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200/80 dark:border-slate-800/80 flex space-x-6 text-xs font-semibold">
          {[
            { id: 'overview', label: '1. Executive Abstract', icon: Award },
            { id: 'architecture', label: '2. System Architecture', icon: Layers },
            { id: 'scenarios', label: '3. Live Demo Scenarios', icon: Zap },
            { id: 'database', label: '4. Database & RLS Security', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-all ${
                  isActive
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* TAB 1: EXECUTIVE ABSTRACT */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-500/20">
                <h3 className="text-sm font-bold text-brand-800 dark:text-brand-200 mb-1 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span>Problem Statement & Academic Significance</span>
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Traditional university and enterprise support systems rely on rigid Interactive Voice Response (IVR) phone trees or fragmented web portals. Students and international visitors face friction due to complex menu navigation, regional language barriers, and lack of real-time multi-turn conversational intelligence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    🎙️ Multimodal STT/TTS
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Zero-latency browser SpeechRecognition & SpeechSynthesis with dynamic voice selection.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    🤖 Gemini 3.8 Flash
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Multi-turn conversational context with TTS-optimized, spoken-friendly answers.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    🐘 Supabase Cloud
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    PostgreSQL database with Row Level Security (RLS) and full conversation audit trails.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Target Campus Stakeholders
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Undergraduate Students', 'International Scholars', 'Faculty & Researchers', 'Administrative Staff'].map(
                    (s, i) => (
                      <div key={i} className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">{s}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 font-mono text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  [Tier 1] Client Interface (React 18 + Vite + Web Speech API)
                </p>
                <div className="pl-4 text-slate-500 border-l-2 border-brand-500 space-y-1">
                  <p>• Browser Audio Input: window.webkitSpeechRecognition / SpeechRecognition</p>
                  <p>• Interim Speech Streaming: Live audio waveform visualization & transcript chunking</p>
                  <p>• Speech Synthesis Engine: window.speechSynthesis with language locale matching</p>
                </div>

                <p className="font-bold text-slate-800 dark:text-slate-200 pt-2">
                  [Tier 2] Backend Relay & Middleware (Node.js + Express + Zod)
                </p>
                <div className="pl-4 text-slate-500 border-l-2 border-blue-500 space-y-1">
                  <p>• Request Validation: Strict Zod schemas on every payload</p>
                  <p>• Authentication: Stateless JWT Bearer tokens with bcrypt password hashing</p>
                  <p>• Latency Circuit Breaker: 8-second smart timeout ensuring 100% SLA</p>
                </div>

                <p className="font-bold text-slate-800 dark:text-slate-200 pt-2">
                  [Tier 3] Cloud Intelligence & Persistence (Google Gemini + Supabase)
                </p>
                <div className="pl-4 text-slate-500 border-l-2 border-purple-500 space-y-1">
                  <p>• LLM Reasoning: @google/genai SDK with gemini-3.8-flash model</p>
                  <p>• Storage & Auditing: Supabase PostgreSQL with Row Level Security (RLS)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE DEMO SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-slate-500">
                Click any scenario below to automatically load it into the active voice workspace for your professors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_SCENARIOS.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 glass-card flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {sc.title}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {sc.langName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-2">
                        "{sc.prompt}"
                      </p>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold block">
                        ⚙️ {sc.techHighlight}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onLaunchScenario && onLaunchScenario(sc);
                        onClose();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                    >
                      <span>Demonstrate Live</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & RLS SECURITY */}
          {activeTab === 'database' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Security Compliance</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Every SQL transaction is governed by PostgreSQL Row Level Security (RLS). Students cannot access conversation logs belonging to other student accounts, while administrative auditing is handled securely via service role credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-xl glass-panel">
                  <p className="font-mono font-bold text-slate-900 dark:text-white">public.profiles</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    id, full_name, email, role, created_at
                  </p>
                </div>
                <div className="p-3 rounded-xl glass-panel">
                  <p className="font-mono font-bold text-slate-900 dark:text-white">public.conversations</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    id, user_id (FK), title, language, domain, created_at
                  </p>
                </div>
                <div className="p-3 rounded-xl glass-panel">
                  <p className="font-mono font-bold text-slate-900 dark:text-white">public.messages</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    id, conversation_id (FK), sender, content, audio_played, is_voice
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Supabase Cloud PostgreSQL + Google Gemini 3.8 Flash Live
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-colors"
          >
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
}
