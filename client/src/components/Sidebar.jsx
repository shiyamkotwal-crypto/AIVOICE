import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Loader2,
  Globe,
  Sparkles,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  isOpen,
  onClose,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  loading = false,
  user,
}) {
  const languageContext = useLanguage();
  const selectedLanguage = languageContext?.selectedLanguage || 'en-US';
  const currentLanguageMeta = languageContext?.currentLanguageMeta || {
    code: 'en-US',
    name: 'English (US)',
    native: 'English',
    flag: '🇺🇸',
    short: 'EN',
  };
  const sidebarFilter = languageContext?.sidebarFilter || 'active';
  const setSidebarFilter = languageContext?.setSidebarFilter || (() => {});
  const matchesFilter = languageContext?.matchesFilter || (() => true);
  const LANGUAGES = languageContext?.LANGUAGES || [];
  const getBaseLanguage =
    languageContext?.getBaseLanguage ||
    ((code) => (code && typeof code === 'string' ? code.split('-')[0].toLowerCase() : 'en'));

  const [searchQuery, setSearchQuery] = useState('');

  // Define filter pills (Active, All, EN, HI, KN, ES)
  const filterPills = useMemo(() => {
    const shortCode = currentLanguageMeta?.short || 'EN';
    return [
      {
        id: 'active',
        label: `Active (${shortCode})`,
        short: `Active (${shortCode})`,
        isActiveTag: true,
      },
      { id: 'all', label: 'All', short: 'All' },
      { id: 'en', label: 'English', short: 'EN' },
      { id: 'hi', label: 'हिन्दी', short: 'HI' },
      { id: 'kn', label: 'ಕನ್ನಡ', short: 'KN' },
      { id: 'es', label: 'Español', short: 'ES' },
    ];
  }, [currentLanguageMeta]);

  // Compute counts per filter
  const filterCounts = useMemo(() => {
    const safeConvs = Array.isArray(conversations) ? conversations : [];
    const counts = { all: safeConvs.length, active: 0, en: 0, hi: 0, kn: 0, es: 0 };
    const activeBase = getBaseLanguage(selectedLanguage);

    safeConvs.forEach((c) => {
      if (!c) return;
      const cScript = languageContext?.detectLanguageFromScript?.(c.title);
      const cLang = (cScript || c.language || 'en').toLowerCase();
      const cBase = cLang.split('-')[0];

      if (cLang === selectedLanguage.toLowerCase() || cBase === activeBase) {
        counts.active += 1;
      }
      if (cBase === 'en') counts.en += 1;
      if (cBase === 'hi') counts.hi += 1;
      if (cBase === 'kn') counts.kn += 1;
      if (cBase === 'es') counts.es += 1;
    });

    return counts;
  }, [conversations, selectedLanguage, getBaseLanguage]);

  // Filter conversations by search query AND language filter
  const filteredConversations = useMemo(() => {
    const safeConvs = Array.isArray(conversations) ? conversations : [];
    return safeConvs.filter((c) => {
      if (!c) return false;
      const titleMatch = (c.title || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      if (!titleMatch) return false;

      const cScript = languageContext?.detectLanguageFromScript?.(c.title);
      const effectiveLanguage = cScript || c.language || 'en';
      return matchesFilter(effectiveLanguage, sidebarFilter);
    });
  }, [conversations, searchQuery, sidebarFilter, matchesFilter]);

  const activeFilterMeta = filterPills.find((p) => p.id === sidebarFilter) || filterPills[0];

  return (
    <aside
      className={`border-r border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col transition-all duration-300 z-20 ${
        isOpen ? 'w-80' : 'w-0 -translate-x-full overflow-hidden'
      }`}
    >
      {/* Sidebar Header: New Voice Thread & Collapse */}
      <div className="p-3.5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between gap-2">
        <button
          onClick={onNewConversation}
          title={`Start new voice thread in ${currentLanguageMeta?.name || 'English'}`}
          className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>New Voice Thread</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono font-normal">
            {currentLanguageMeta?.short || 'EN'}
          </span>
        </button>

        <button
          onClick={onClose}
          title="Collapse conversations sidebar"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input Filter */}
      <div className="p-3 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-850/90 border border-slate-200 dark:border-slate-700/80 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Language Filter Tabs / Pills */}
      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-2 px-1">
          <div className="flex items-center space-x-1.5 uppercase tracking-wider">
            <Globe className="w-3 h-3 text-brand-500 shrink-0" />
            <span>Filter by Language:</span>
          </div>
          <span className="font-mono text-slate-400">
            {filteredConversations.length} of {conversations.length}
          </span>
        </div>

        {/* Filter Pills Grid / Scroll */}
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
          {filterPills.map((pill) => {
            const isSelected = sidebarFilter === pill.id;
            const count = filterCounts[pill.id] ?? 0;

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSidebarFilter(pill.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {pill.isActiveTag && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                )}
                <span>{pill.short}</span>
                <span
                  className={`text-[9px] px-1.5 rounded-full font-mono font-normal ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-500" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          /* Empty State when no threads match language filter */
          <div className="text-center py-10 px-4 text-slate-400 space-y-2 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
              <MessageSquare className="w-5 h-5 opacity-50" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {sidebarFilter === 'active'
                  ? `No ${currentLanguageMeta?.name || 'selected'} threads yet`
                  : sidebarFilter === 'all'
                  ? 'No past conversations'
                  : `No ${activeFilterMeta?.label || 'matching'} threads found`}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {sidebarFilter === 'active'
                  ? `Speak or type in ${currentLanguageMeta?.native || 'this language'} to create your first thread.`
                  : 'Switch filter to "All" or start a new thread.'}
              </p>
            </div>

            <button
              onClick={onNewConversation}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start in {currentLanguageMeta?.short || 'this language'}</span>
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const cScript = languageContext?.detectLanguageFromScript?.(conv.title);
            const convLang = (cScript || conv.language || 'en').toLowerCase();
            const convLangMeta =
              (LANGUAGES || []).find((l) => l.code.toLowerCase() === convLang) ||
              (LANGUAGES || []).find((l) => l.code.split('-')[0] === convLang.split('-')[0]) ||
              { code: 'en-US', name: 'English (US)', native: 'English', short: 'EN' };

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-900 dark:text-brand-100 font-semibold border border-brand-500/30 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0 pr-6">
                  <MessageSquare
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <p className="truncate leading-tight">{conv.title || 'Voice Thread'}</p>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-1 font-normal">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          (convLangMeta?.short || '').startsWith('KN')
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : (convLangMeta?.short || '').startsWith('HI')
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : (convLangMeta?.short || '').startsWith('ES')
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                        }`}
                      >
                        <span>{convLangMeta?.native || convLangMeta?.short || 'EN'}</span>
                      </span>
                      <span>•</span>
                      <span>{conv.message_count || 0} msgs</span>
                    </div>
                  </div>
                </div>

                {/* Delete button (hover reveal) */}
                <button
                  type="button"
                  onClick={(e) => onDeleteConversation(e, conv.id)}
                  title="Delete thread"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all absolute right-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer User Info */}
      <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 bg-white/40 dark:bg-slate-900/40 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold uppercase text-[10px]">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
            {user?.full_name}
          </span>
        </div>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
          {user?.role || 'student'}
        </span>
      </div>
    </aside>
  );
}
