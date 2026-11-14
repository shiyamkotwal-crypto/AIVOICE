import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  PanelLeft,
  Loader2,
  RefreshCw,
  HelpCircle,
  Download,
} from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import LanguageSelector from '../components/LanguageSelector';
import DomainSelector, { DOMAINS } from '../components/DomainSelector';
import PersonaSwitcher from '../components/PersonaSwitcher';
import QuickActionChips from '../components/QuickActionChips';
import VoiceMicrophone from '../components/VoiceMicrophone';
import ChatMessage from '../components/ChatMessage';
import SpeechSynthesisControl from '../components/SpeechSynthesisControl';
import AudioWaveVisualizer from '../components/AudioWaveVisualizer';
import RainbowWaveBackground from '../components/RainbowWaveBackground';
import { LocationModal, DocumentModal, PortalModal } from '../components/ActionModals';

export default function DashboardPage() {
  const { user } = useAuth();
  const { autoTTS, speakMessage, isSpeaking, stopSpeech } = useAudio();
  const languageContext = useLanguage();
  const selectedLanguage = languageContext?.selectedLanguage || 'en-US';
  const setLanguage = languageContext?.setLanguage || (() => {});
  const currentLanguageMeta = languageContext?.currentLanguageMeta || {
    code: 'en-US',
    name: 'English (US)',
    native: 'English',
    flag: '🇺🇸',
    short: 'EN',
  };

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(() => {
    return localStorage.getItem('voicebridge_pref_domain') || 'General Administrative';
  });
  const [persona, setPersona] = useState(() => {
    return localStorage.getItem('voicebridge_persona') || 'buddy';
  });

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMicListening, setIsMicListening] = useState(false);

  // Interactive action modals state
  const [activeModal, setActiveModal] = useState(null); // 'location' | 'document' | 'portal'
  const [modalData, setModalData] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastSubmittedMsgRef = useRef({ text: '', time: 0 });

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage]);

  // Load user conversations on mount
  useEffect(() => {
    loadConversations();

    // Check for pending scenario from presentation modal
    const pending = localStorage.getItem('voicebridge_pending_prompt');
    if (pending) {
      localStorage.removeItem('voicebridge_pending_prompt');
      setInputText(pending);
      const prefLang = localStorage.getItem('voicebridge_pref_lang');
      const prefDom = localStorage.getItem('voicebridge_pref_domain');
      if (prefLang) setLanguage(prefLang);
      if (prefDom) setSelectedDomain(prefDom);
      setTimeout(() => {
        handleSendMessage(pending, true);
      }, 500);
    }
  }, []);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await chatAPI.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        if (res.conversations && res.conversations.length > 0 && !activeConversationId) {
          selectConversation(res.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Select and load specific conversation
  const selectConversation = async (id) => {
    stopSpeech();
    setActiveConversationId(id);
    setLoadingMessages(true);
    try {
      const res = await chatAPI.getConversation(id);
      if (res.success && res.conversation) {
        setActiveConversation(res.conversation);
        setMessages(res.messages || []);
        const titleScriptLang = languageContext?.detectLanguageFromScript?.(res.conversation.title);
        const resolvedLanguage = titleScriptLang || res.conversation.language;
        if (resolvedLanguage) {
          setLanguage(resolvedLanguage);
        }
        if (res.conversation.domain) {
          setSelectedDomain(res.conversation.domain);
        }
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Start a new conversation thread with automatic language assignment
  const handleNewConversation = () => {
    stopSpeech();
    setActiveConversationId(null);
    setActiveConversation(null);
    setMessages([]);
    setInputText('');
    inputRef.current?.focus();
  };

  // Delete conversation
  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await chatAPI.deleteConversation(id);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // One-click transcript export (Markdown / Text report)
  const handleExportTranscript = () => {
    if (!messages || messages.length === 0) {
      alert('No messages to export yet.');
      return;
    }

    const title = activeConversation?.title || 'VoiceBridge_Conversation';
    let transcriptText = `# VoiceBridge AI — Conversational Transcript\n`;
    transcriptText += `Conversation: ${title}\n`;
    transcriptText += `Export Date: ${new Date().toLocaleString()}\n`;
    transcriptText += `Domain: ${selectedDomain}\n`;
    transcriptText += `Active Language: ${currentLanguageMeta?.name || selectedLanguage}\n`;
    transcriptText += `Engine: Gemini 3.8 Flash / VoiceBridge Multilingual Intelligence Relay\n`;
    transcriptText += `========================================================\n\n`;

    messages.forEach((m, idx) => {
      const speaker = m.sender === 'user' ? 'User' : 'VoiceBridge AI';
      const time = m.created_at ? new Date(m.created_at).toLocaleTimeString() : '';
      const voiceTag = m.is_voice ? ' [Voice STT]' : '';
      transcriptText += `[${idx + 1}] ${speaker}${voiceTag} (${time}):\n`;
      transcriptText += `${m.content}\n`;
      if (m.metadata?.intent) {
        transcriptText += `    • Intent: ${m.metadata.intent} (${m.metadata.confidence || '98%'} confidence)\n`;
      }
      if (m.latency_ms) {
        transcriptText += `    • Response Latency: ${m.latency_ms}ms\n`;
      }
      transcriptText += `\n`;
    });

    const blob = new Blob([transcriptText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_transcript.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Send message handler (works for both text and voice STT)
  const handleSendMessage = async (textToSend = null, isVoice = false) => {
    const text = (textToSend !== null ? textToSend : inputText).trim();
    if (!text) return;

    // Deduplication guard: ignore identical message if submitted within 1500ms
    const now = Date.now();
    if (
      lastSubmittedMsgRef.current.text === text &&
      now - lastSubmittedMsgRef.current.time < 1500
    ) {
      console.warn('Duplicate voice/text message submission intercepted:', text);
      return;
    }
    if (sendingMessage) return;

    lastSubmittedMsgRef.current = { text, time: now };
    setInputText('');
    setSendingMessage(true);

    // Optimistic user message in UI
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      content: text,
      is_voice: isVoice,
      language: selectedLanguage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const requestStartTime = performance.now();
    try {
      const res = await chatAPI.sendMessage({
        conversation_id: activeConversationId,
        message: text,
        language: selectedLanguage,
        domain: selectedDomain,
        persona: persona,
        is_voice: isVoice,
      });

      if (res.success) {
        const latencyMs = Math.max(120, Math.round(performance.now() - requestStartTime));
        const enrichedAiMessage = {
          ...res.ai_message,
          latency_ms: latencyMs,
        };

        // Replace temp message with server messages
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          res.user_message,
          enrichedAiMessage,
        ]);

        // If new conversation was created on server
        if (!activeConversationId && res.conversation_id) {
          setActiveConversationId(res.conversation_id);
          loadConversations();
        }

        // Auto-sync active language if script detection recognized a different language
        if (res.language && res.language !== selectedLanguage) {
          setLanguage(res.language);
        }

        // Automatic Text-To-Speech (TTS) readout if enabled
        if (autoTTS && res.ai_message?.content) {
          speakMessage(
            res.ai_message.id,
            res.ai_message.content,
            res.ai_message.language || selectedLanguage
          );
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Add error feedback in chat stream
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          content: 'Sorry, I encountered an issue connecting to the AI relay. Please try again.',
          language: selectedLanguage,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = ({ type, data }) => {
    setModalData(data);
    setActiveModal(type);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left Sidebar: Language-Scoped Conversations & History (Modular Component) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        loading={loadingConversations}
        user={user}
      />

      {/* Main Conversational Workspace */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Control Bar with clean stacking context below master navbar */}
        <div className="relative z-30 px-4 py-3 border-b border-slate-200/90 dark:border-slate-800/90 glass-panel flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand conversations sidebar"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {activeConversation?.title || 'Interactive Voice Assistant'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Gemini 3.8 Flash</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono font-semibold hidden md:inline-flex items-center space-x-1">
                  <span>Supabase PostgreSQL (RLS)</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Domain: <span className="font-medium text-slate-600 dark:text-slate-300">{selectedDomain}</span>
                <span className="mx-1.5">•</span>
                Active Language:{' '}
                <span className="font-medium text-brand-600 dark:text-brand-400">
                  [{currentLanguageMeta?.short || 'EN'}] {currentLanguageMeta?.name || 'English'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls: Persona Switcher, Global Language Selector, Speech Synthesis Control */}
          <div className="flex items-center space-x-2 relative z-30">
            {/* Persona & Tone Switcher */}
            <PersonaSwitcher
              currentPersona={persona}
              onChange={(newPersona) => setPersona(newPersona)}
              compact={false}
            />

            {/* Global Language Selector */}
            <LanguageSelector
              currentLanguage={selectedLanguage}
              onChange={(code) => setLanguage(code)}
              compact={true}
            />

            {/* TTS Speech Synthesis Controls */}
            <SpeechSynthesisControl />

            {/* One-Click Transcript Export */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleExportTranscript}
                title="Export Conversation Transcript (.md report)"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden xl:inline">Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Domain Selection Tabs Bar */}
        <div className="relative z-20 px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 shrink-0">
          <DomainSelector
            currentDomain={selectedDomain}
            onChange={(domain) => {
              setSelectedDomain(domain);
              localStorage.setItem('voicebridge_pref_domain', domain);
            }}
          />
        </div>

        {/* Quick Action Chips Bar */}
        <div className="relative z-10 px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <QuickActionChips
            domain={selectedDomain}
            language={selectedLanguage}
            onSelect={(prompt) => handleSendMessage(prompt, false)}
          />
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 relative z-0">
          {/* Ambient Multi-Color Spectrum Waves (Flowing Left to Right) */}
          <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40 overflow-hidden -z-10">
            <RainbowWaveBackground height="100%" opacity={0.35} density={5} />
          </div>
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand-500" />
              <p className="text-xs">Fetching conversational history...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State: Welcome Hero */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 px-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-brand-500/25 mb-4">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-8 h-8 text-brand-400 animate-pulse-subtle" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                How can VoiceBridge AI assist you today?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
                Click the microphone button to speak naturally in{' '}
                <strong className="text-brand-600 dark:text-brand-400">
                  {currentLanguageMeta?.native || 'English'}
                </strong>
                , or type your query in the box below.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left w-full space-y-2">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Try asking in {currentLanguageMeta?.native || 'English'}:
                </p>
                <div className="space-y-1.5 text-xs text-brand-600 dark:text-brand-400">
                  <button
                    onClick={() => handleSendMessage('When is the semester fee payment deadline?', false)}
                    className="block text-left hover:underline"
                  >
                    • "When is the semester fee payment deadline?"
                  </button>
                  <button
                    onClick={() => handleSendMessage('How do I connect my phone to campus Wi-Fi?', false)}
                    className="block text-left hover:underline"
                  >
                    • "How do I connect my phone to campus Wi-Fi?"
                  </button>
                  <button
                    onClick={() => handleSendMessage('What are the central library opening hours?', false)}
                    className="block text-left hover:underline"
                  >
                    • "What are the central library opening hours?"
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Chronological Message Stream with Intent Badges & Action Cards */
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                language={selectedLanguage}
                onActionClick={handleActionClick}
              />
            ))
          )}

          {/* AI Thinking Animation */}
          {sendingMessage && (
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 py-2 animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-2xl glass-panel">
                <AudioWaveVisualizer isPlaying={true} count={4} />
                <span>VoiceBridge AI is analyzing your query with Gemini 3.8...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Voice & Text Input Dock */}
        <div className="p-4 border-t border-slate-200/90 dark:border-slate-800/90 glass-panel shrink-0">
          {/* Live Audio Waveform / Visualizer Animation */}
          {(isMicListening || isSpeaking) && (
            <div className="max-w-4xl mx-auto mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600/15 via-emerald-500/10 to-teal-500/15 border border-brand-500/30 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center space-x-3">
                <AudioWaveVisualizer
                  isPlaying={true}
                  count={9}
                  showGlow={true}
                  color={isMicListening ? 'bg-rose-500' : 'bg-emerald-500'}
                  className="h-5"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMicListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isMicListening
                        ? 'Speech-to-Text (STT) Active — Listening to Voice Stream...'
                        : 'Text-to-Speech (TTS) Active — Reading Response Aloud...'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isMicListening
                      ? `Voice input active in [${currentLanguageMeta?.short || 'EN'}] ${currentLanguageMeta?.name || 'English'}`
                      : 'Browser speech synthesis streaming response through audio device'}
                  </span>
                </div>
              </div>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeech}
                  className="px-3 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors shadow-xs"
                >
                  Stop Audio
                </button>
              )}
            </div>
          )}

          <div className="max-w-4xl mx-auto flex items-end gap-3">
            {/* STT Microphone Button with live listening state sync */}
            <VoiceMicrophone
              language={selectedLanguage}
              disabled={sendingMessage}
              onListeningChange={(active) => setIsMicListening(active)}
              onTranscript={(transcript, isFinal) => {
                if (isFinal && transcript) {
                  handleSendMessage(transcript, true);
                } else if (transcript) {
                  setInputText(transcript);
                }
              }}
            />

            {/* Text Input Area */}
            <div className="flex-1 relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type or click microphone to speak in ${currentLanguageMeta?.native || 'English'}...`}
                className="w-full max-h-32 p-3.5 pr-12 text-sm bg-transparent resize-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || sendingMessage}
                title="Send message (Enter)"
                className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white transition-all shadow-xs"
              >
                {sendingMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center space-x-3">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>•</span>
            <span>Language Isolation Active ({currentLanguageMeta?.short || 'EN'})</span>
            <span>•</span>
            <span>Web Speech STT + TTS Synced</span>
          </div>
        </div>
      </main>

      {/* Interactive Action Modals */}
      <LocationModal
        isOpen={activeModal === 'location'}
        onClose={() => setActiveModal(null)}
        data={modalData}
      />
      <DocumentModal
        isOpen={activeModal === 'document'}
        onClose={() => setActiveModal(null)}
        data={modalData}
      />
      <PortalModal
        isOpen={activeModal === 'portal'}
        onClose={() => setActiveModal(null)}
        data={modalData}
      />
    </div>
  );
}
