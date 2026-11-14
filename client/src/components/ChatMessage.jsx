import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Copy,
  Check,
  Bot,
  User,
  CheckCheck,
  MapPin,
  FileText,
  ExternalLink,
  Sparkles,
  Zap,
  Target,
  MessageCircle,
  Building2,
  HeartHandshake,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import AudioWaveVisualizer from './AudioWaveVisualizer';

/**
 * Fallback heuristic extractor for intent and actions in case message doesn't carry server metadata
 */
function resolveMetadata(message) {
  if (message.metadata) return message.metadata;

  const content = (message.content || '').toLowerCase();
  const trimmed = content.trim().toLowerCase();
  let intent = 'Campus Assistance';
  let confidence = '98%';
  let sentiment = 'Helpful & Reassuring';
  const actions = [];

  // 0. Greeting & Pleasantries check
  const isGreeting =
    /^(ನಮಸ್ಕಾರ|ನಮಸ್ಕಾರಗಳು|ಹಲೋ|ಹಾಯ್|ಶುಭೋದಯ|ಶುಭ ಸಂಜೆ|ಶುಭ ರಾತ್ರಿ|ಹೇಗಿದ್ದೀರಾ|ಹೇಗಿದ್ದೀರಿ|ಧನ್ಯವಾದ|ಧನ್ಯವಾದಗಳು|ಥ್ಯಾಂಕ್ಸ್)/i.test(trimmed) ||
    /^(नमस्ते|नमस्कार|प्रणाम|हेलो|हाय|सुप्रभात|शुभ संध्या|कैसे हैं|कैसे हो|धन्यवाद|शुक्रिया|आभार)/i.test(trimmed) ||
    /^(hello|hi|hey|good morning|good afternoon|good evening|how are you|greetings|thank you|thanks|hola|buenos dias|gracias)/i.test(trimmed) ||
    trimmed === 'hi' ||
    trimmed === 'hello' ||
    trimmed === 'hey' ||
    trimmed === 'namaste' ||
    trimmed === 'namaskara' ||
    trimmed === 'namaskaragalu';

  if (isGreeting) {
    return {
      intent: 'Campus Welcome & Assistance',
      confidence: '99%',
      sentiment: 'Warm & Welcoming',
      actions: [],
    };
  }

  if (
    content.includes('fee') ||
    content.includes('payment') ||
    content.includes('admission') ||
    content.includes('cutoff') ||
    content.includes('scholarship') ||
    content.includes('फीस') ||
    content.includes('ಶುಲ್ಕ') ||
    content.includes('ಫೀಸ್')
  ) {
    intent = 'Fee Payment & Admissions';
    confidence = '99%';
    sentiment = 'Procedural & Direct';
    actions.push({
      type: 'portal',
      title: 'Student Fee Gateway',
      label: 'Open Fee Payment Portal',
      url: 'https://fees.campus.edu',
      description: 'Official student accounts portal for online payments, receipts and installment schedules.',
    });
    actions.push({
      type: 'form',
      title: 'Fee Structure PDF',
      label: 'Download Fee Breakdown (PDF)',
      filename: 'Campus_Fee_Structure_2026.pdf',
      size: '340 KB',
      description: 'Official schedule of academic tuition, laboratory fees, and payment deadlines.',
    });
  } else if (
    content.includes('wifi') ||
    content.includes('wi-fi') ||
    content.includes('password') ||
    content.includes('login') ||
    content.includes('वाईफाई') ||
    content.includes('ವೈ-ಫೈ') ||
    content.includes('ವೈಫೈ') ||
    content.includes('ಪಾಸ್‌ವರ್ಡ್') ||
    content.includes('network')
  ) {
    intent = 'Wi-Fi & SSO Authentication';
    confidence = '98%';
    sentiment = 'Technical & Solution-Oriented';
    actions.push({
      type: 'location',
      title: 'IT Helpdesk Counter',
      label: 'View Tech Block, Room 204',
      building: 'Technology Center Block',
      room: 'Room 204',
      floor: '2nd Floor',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
      description: 'Walk in for MAC address registration, device certificates, and enterprise Wi-Fi troubleshooting.',
    });
    actions.push({
      type: 'portal',
      title: 'Identity Access Portal',
      label: 'Campus Password Recovery Portal',
      url: 'https://auth.campus.edu/reset',
      description: 'Automated self-service password reset and 2-factor authentication management.',
    });
  } else if (
    content.includes('library') ||
    content.includes('book') ||
    content.includes('ಗ್ರಂಥಾಲಯ') ||
    content.includes('ಪುಸ್ತಕ') ||
    content.includes('ಪುಸ್ತकालय') ||
    content.includes('ಲೈಬ್ರರಿ')
  ) {
    intent = 'Library & Study Resources';
    confidence = '98%';
    sentiment = 'Supportive & Informative';
    actions.push({
      type: 'location',
      title: 'Central University Library',
      label: 'Main Quadrangle Library Building',
      building: 'Knowledge & Learning Center',
      room: 'Circulation Desk, 1st Floor',
      floor: 'Ground & 1st Floor',
      hours: 'Mon-Sat: 8:00 AM - 10:00 PM',
      description: 'Access 200,000+ volumes, reading halls, group study pods, and digital research journals.',
    });
    actions.push({
      type: 'portal',
      title: 'Digital Library Catalogue',
      label: 'Search OPAC Library Catalog',
      url: 'https://opac.campus.edu',
      description: 'Search books, reserve reading pods, and renew active loans online.',
    });
  } else if (
    content.includes('hostel') ||
    content.includes('ಹಾಸ್ಟೆಲ್') ||
    content.includes('हॉस्टल') ||
    content.includes('mess') ||
    content.includes('ಮೆಸ್')
  ) {
    intent = 'Hostel & Residential Life';
    confidence = '96%';
    sentiment = 'Caring & Direct';
    actions.push({
      type: 'location',
      title: 'Chief Warden Directorate',
      label: 'Hostel Complex Block A',
      building: 'Residential Complex',
      room: 'Chief Warden Suite 101',
      floor: 'Ground Floor',
      hours: 'Mon-Fri: 10:00 AM - 4:00 PM',
      description: 'Room allocations, maintenance ticketing, and official leave clearances.',
    });
    actions.push({
      type: 'form',
      title: 'Room Re-Allocation Form',
      label: 'Download Hostel Allotment Form (PDF)',
      filename: 'Hostel_Allotment_Application.pdf',
      size: '190 KB',
      description: 'Submit request with roommate preferences and semester fee clearance.',
    });
  } else if (
    /\b(id\s*card|identity\s*card|student\s*id|bonafide|certificate|transcript|marks\s*card)\b/i.test(content) ||
    content.includes('ಗುರುತಿನ ಚೀಟಿ') ||
    content.includes('ಪ್ರಮಾಣಪತ್ರ') ||
    content.includes('ಅಂಕಪಟ್ಟಿ') ||
    content.includes('पहचान पत्र') ||
    content.includes('बोनाफाइड') ||
    content.includes('प्रमाणपत्र')
  ) {
    intent = 'Campus Administrative Services';
    confidence = '97%';
    sentiment = 'Institutional Guidance';
    actions.push({
      type: 'location',
      title: 'Registrar & Student Affairs',
      label: 'Administrative Complex, Counter 4',
      building: 'Main Administrative Wing',
      room: 'Counter 4 (Student Affairs)',
      floor: 'Ground Floor',
      hours: 'Mon-Fri: 9:30 AM - 4:30 PM',
      description: 'ID card reissuance, bonafide verification, academic transcripts, and official seals.',
    });
    actions.push({
      type: 'form',
      title: 'ID Reissuance Form',
      label: 'Download ID Replacement Form (PDF)',
      filename: 'Student_ID_Replacement_Form.pdf',
      size: '185 KB',
      description: 'Submit this signed form along with clearance receipt at Counter 4.',
    });
  }

  return { intent, confidence, sentiment, actions };
}

export default function ChatMessage({
  message,
  language = 'en-US',
  onActionClick,
}) {
  const { isSpeaking, activeMessageId, speakMessage, stopSpeech } = useAudio();
  const [copied, setCopied] = useState(false);

  const isUser = message.sender === 'user';
  const isCurrentlySpeaking = isSpeaking && activeMessageId === message.id;

  const metadata = !isUser ? resolveMetadata(message) : null;
  const actions = metadata?.actions || [];

  const handleTTS = () => {
    if (isCurrentlySpeaking) {
      stopSpeech();
    } else {
      speakMessage(message.id, message.content, message.language || language);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex items-start gap-3 my-4 group ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white dark:from-slate-700 dark:to-slate-800'
            : 'bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 text-white shadow-brand-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`max-w-[88%] sm:max-w-[78%] space-y-1.5 ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Header row: Name, Voice badge, Timestamp */}
        <div
          className={`flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500 px-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isUser ? 'You' : 'VoiceBridge AI'}
          </span>
          {isUser && message.is_voice && (
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium text-[10px]">
              <Mic className="w-2.5 h-2.5" />
              <span>Voice Input</span>
            </span>
          )}
          <span>{formatTime(message.created_at)}</span>
        </div>

        {/* AI Intent & Sentiment Badges (Killer Hackathon Upgrade) */}
        {!isUser && metadata && (
          <div className="flex flex-wrap items-center gap-1.5 px-1 text-[10px]">
            {/* Intent Badge */}
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 font-medium">
              <Zap className="w-3 h-3 text-brand-500" />
              <span>Intent: <strong>{metadata.intent}</strong></span>
            </span>

            {/* Confidence Badge */}
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
              <Target className="w-3 h-3 text-emerald-500" />
              <span>Confidence: <strong>{metadata.confidence}</strong></span>
            </span>

            {/* Sentiment / Tone Badge */}
            <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-medium">
              <MessageCircle className="w-3 h-3 text-purple-500" />
              <span>Tone: {metadata.sentiment}</span>
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all shadow-sm ${
            isUser
              ? 'bg-brand-600 text-white rounded-tr-xs shadow-brand-500/10'
              : 'glass-card border border-slate-200/90 dark:border-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-xs'
          }`}
        >
          {/* Text Content */}
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Interactive Rich Action Cards Inside Chat Bubble */}
          {!isUser && actions.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-brand-500" />
                <span>Contextual Actions & Resources:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {actions.map((act, idx) => {
                  if (act.type === 'location') {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onActionClick && onActionClick({ type: 'location', data: act })}
                        className="group/act flex items-start space-x-2.5 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-600 text-left transition-all hover:scale-[1.01]"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 truncate">
                            {act.label || 'View Location'}
                          </span>
                          <span className="block text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-tight truncate">
                            {act.room || act.building || 'Campus Map Coordinate'}
                          </span>
                          <span className="mt-1 inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover/act:underline">
                            <span>Open Campus Map</span>
                            <span>→</span>
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (act.type === 'form') {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onActionClick && onActionClick({ type: 'document', data: act })}
                        className="group/act flex items-start space-x-2.5 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600 text-left transition-all hover:scale-[1.01]"
                      >
                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[11px] font-bold text-purple-900 dark:text-purple-200 truncate">
                            {act.label || 'Download Form'}
                          </span>
                          <span className="block text-[10px] text-purple-700/80 dark:text-purple-400/80 leading-tight truncate">
                            {act.filename || 'PDF Document'} ({act.size || 'Official'})
                          </span>
                          <span className="mt-1 inline-flex items-center space-x-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 group-hover/act:underline">
                            <span>Preview & Download</span>
                            <span>→</span>
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (act.type === 'portal') {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onActionClick && onActionClick({ type: 'portal', data: act })}
                        className="group/act flex items-start space-x-2.5 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all hover:scale-[1.01]"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[11px] font-bold text-blue-900 dark:text-blue-200 truncate">
                            {act.label || 'Portal Gateway'}
                          </span>
                          <span className="block text-[10px] text-blue-700/80 dark:text-blue-400/80 leading-tight truncate">
                            {act.title || 'SSO Campus Link'}
                          </span>
                          <span className="mt-1 inline-flex items-center space-x-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover/act:underline">
                            <span>Open Single Sign-On</span>
                            <span>→</span>
                          </span>
                        </div>
                      </button>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          {/* Glowing Audio Streaming Waveform (Live Voice Readout Indicator) */}
          {!isUser && isCurrentlySpeaking && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-500/15 via-emerald-500/10 to-teal-500/15 border border-brand-500/30 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <AudioWaveVisualizer
                  isPlaying={true}
                  count={6}
                  showGlow={true}
                  color="bg-brand-500"
                  className="h-4"
                />
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                  Synthesizing speech readout...
                </span>
              </div>
              <button
                type="button"
                onClick={stopSpeech}
                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 underline transition-colors"
              >
                Stop Audio
              </button>
            </div>
          )}

          {/* AI Message Action Bar */}
          {!isUser && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                {/* TTS Play / Stop Button */}
                <button
                  type="button"
                  onClick={handleTTS}
                  title={isCurrentlySpeaking ? 'Stop voice readout' : 'Read aloud with AI voice'}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    isCurrentlySpeaking
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
                  }`}
                >
                  {isCurrentlySpeaking ? (
                    <>
                      <AudioWaveVisualizer isPlaying={true} count={3} color="bg-white" className="h-3" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{message.audio_played ? 'Replay Voice' : 'Listen'}</span>
                    </>
                  )}
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy response"
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Status badges */}
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                {message.latency_ms && (
                  <span
                    className="inline-flex items-center space-x-0.5 text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold"
                    title={`AI Response Latency: ${message.latency_ms} milliseconds`}
                  >
                    <Zap className="w-2.5 h-2.5 text-emerald-500" />
                    <span>{message.latency_ms}ms</span>
                  </span>
                )}
                {message.audio_played && (
                  <span className="flex items-center space-x-0.5 text-brand-600 dark:text-brand-400" title="Audio was played">
                    <CheckCheck className="w-3 h-3" />
                    <span>Played</span>
                  </span>
                )}
                {message.language && (
                  <span className="uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                    {message.language.split('-')[0]}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
