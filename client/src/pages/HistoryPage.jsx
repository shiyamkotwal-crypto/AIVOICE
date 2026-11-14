import React, { useState, useEffect } from 'react';
import {
  History,
  MessageSquare,
  Mic,
  Volume2,
  Calendar,
  Globe,
  Trash2,
  Download,
  Search,
  Filter,
  BarChart3,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Loader2,
  FileText,
  Bot,
  User,
} from 'lucide-react';
import { chatAPI, analyticsAPI } from '../services/api';
import { LANGUAGES } from '../components/LanguageSelector';
import { DOMAINS } from '../components/DomainSelector';

export default function HistoryPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [convRes, analRes] = await Promise.all([
        chatAPI.getConversations(),
        analyticsAPI.getAnalytics(),
      ]);

      if (convRes.success) {
        setConversations(convRes.conversations || []);
        if (convRes.conversations?.length > 0) {
          loadThread(convRes.conversations[0]);
        }
      }
      if (analRes.success) {
        setAnalytics(analRes.analytics);
      }
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (conv) => {
    setSelectedConversation(conv);
    setLoadingMessages(true);
    try {
      const res = await chatAPI.getConversation(conv.id);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Failed to load thread messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entire conversation log?')) return;
    try {
      const res = await chatAPI.deleteConversation(id);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedConversation?.id === id) {
          setSelectedConversation(null);
          setMessages([]);
        }
        // Refresh analytics
        const analRes = await analyticsAPI.getAnalytics();
        if (analRes.success) setAnalytics(analRes.analytics);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Export functions
  const exportAsJSON = () => {
    if (!selectedConversation || messages.length === 0) return;
    const data = {
      conversation: selectedConversation,
      messages: messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicebridge-transcript-${selectedConversation.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    if (!selectedConversation || messages.length === 0) return;
    let text = `VOICEBRIDGE AI TRANSCRIPT\nTitle: ${selectedConversation.title}\nDomain: ${selectedConversation.domain}\nLanguage: ${selectedConversation.language}\nDate: ${selectedConversation.created_at}\n\n==========================================\n\n`;

    messages.forEach((m) => {
      const sender = m.sender === 'user' ? 'USER' : 'VOICEBRIDGE AI';
      const time = new Date(m.created_at).toLocaleTimeString();
      text += `[${time}] ${sender} ${m.is_voice ? '(Spoken Voice)' : '(Text)'}:\n${m.content}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicebridge-transcript-${selectedConversation.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtering
  const filtered = conversations.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.last_message || '').toLowerCase().includes(search.toLowerCase());
    const matchLang = filterLanguage === 'all' || (c.language || 'en').startsWith(filterLanguage);
    const matchDomain = filterDomain === 'all' || c.domain === filterDomain;
    return matchSearch && matchLang && matchDomain;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2.5">
          <History className="w-7 h-7 text-brand-500" />
          <span>Conversation History & Analytics</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review past voice interactions, message transcripts, and engagement metrics
        </p>
      </div>

      {/* Analytics Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Queries</span>
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {analytics.userQueriesCount || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Across {analytics.totalConversations || 0} conversation threads
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Voice Input Ratio</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Mic className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {analytics.voiceRatioPercentage || 0}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {analytics.voiceQueries || 0} voice queries / {analytics.textQueries || 0} text
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Audio Readout Rate</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {analytics.audioPlaybackRate || 0}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">AI responses spoken aloud via TTS</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Top Campus Domain</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-2 truncate">
              {Object.entries(analytics.domainStats || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ||
                'Academic'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Categorized by Gemini intelligence</p>
          </div>
        </div>
      )}

      {/* Main Split Section: Conversations + Thread Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & Conversations List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200/90 dark:border-slate-800/90 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history by keyword..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="es">Español (Spanish)</option>
              </select>

              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 truncate"
              >
                <option value="all">All Domains</option>
                {DOMAINS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-500" />
                <span className="text-xs">Loading logs...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center glass-card rounded-2xl text-slate-400 text-xs">
                No conversation history matching filters.
              </div>
            ) : (
              filtered.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => loadThread(conv)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50/90 dark:bg-brand-950/60 border-brand-500/40 shadow-xs'
                        : 'glass-card border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {conv.title}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {conv.last_message && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        "{conv.last_message}"
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium">
                          {conv.language?.toUpperCase() || 'EN'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium">
                          {conv.domain || 'General'}
                        </span>
                      </div>
                      <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Thread Viewer (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800/90 flex flex-col h-[700px] overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-white/40 dark:bg-slate-900/40">
                  <div className="min-w-0 pr-4">
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {selectedConversation.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Domain: {selectedConversation.domain} • Started on{' '}
                      {new Date(selectedConversation.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={exportAsText}
                      title="Download as Text Transcript"
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>.TXT</span>
                    </button>
                    <button
                      onClick={exportAsJSON}
                      title="Download as JSON"
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-500" />
                      <span className="text-xs">Loading message thread...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      No messages recorded in this conversation.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isUser = m.sender === 'user';
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-3 ${
                            isUser ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                              isUser ? 'bg-slate-800' : 'bg-brand-600'
                            }`}
                          >
                            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>

                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                              isUser
                                ? 'bg-brand-600 text-white rounded-tr-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                              <span className="font-semibold">{isUser ? 'User' : 'VoiceBridge AI'}</span>
                              <div className="flex items-center space-x-1.5">
                                {isUser && m.is_voice && (
                                  <span className="flex items-center space-x-0.5">
                                    <Mic className="w-2.5 h-2.5" />
                                    <span>Voice</span>
                                  </span>
                                )}
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-semibold">Select a conversation</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Choose a thread from the list on the left to inspect full transcripts and export logs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
