import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Building2, ChevronDown, Check, ShieldCheck, HeartHandshake } from 'lucide-react';

export const PERSONAS = [
  {
    id: 'buddy',
    label: 'Campus Buddy',
    shortLabel: 'Buddy',
    tagline: 'Casual, warm & supportive peer guide',
    icon: HeartHandshake,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    accentColor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'admin',
    label: 'Formal Admin',
    shortLabel: 'Admin',
    tagline: 'Precise, institutional & policy-driven tone',
    icon: Building2,
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    accentColor: 'from-blue-600 to-indigo-600',
  },
];

export default function PersonaSwitcher({
  currentPersona = 'buddy',
  onChange,
  compact = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selected = PERSONAS.find((p) => p.id === currentPersona) || PERSONAS[0];
  const IconComponent = selected.icon;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    onChange && onChange(id);
    localStorage.setItem('voicebridge_persona', id);
    setIsOpen(false);
  };

  return (
    <div className={`relative z-50 ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch AI voice persona and conversational tone"
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-medium shadow-xs ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 border-brand-500/50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200'
        }`}
      >
        <div className={`p-1 rounded-lg ${selected.badgeColor} shrink-0`}>
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold leading-none">
            Persona
          </span>
          <span className="font-semibold text-slate-900 dark:text-white leading-tight">
            {compact ? selected.shortLabel : selected.label}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select AI Communication Persona
            </span>
          </div>

          <div className="space-y-1">
            {PERSONAS.map((item) => {
              const ItemIcon = item.icon;
              const isItemActive = item.id === currentPersona;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-start space-x-2.5 p-2 rounded-xl text-left transition-all ${
                    isItemActive
                      ? 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-white font-medium shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isItemActive
                        ? `bg-gradient-to-tr ${item.accentColor} text-white shadow-xs`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      {isItemActive && <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug mt-0.5">
                      {item.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 text-[10px] text-slate-400">
            <span>Affects Gemini tone, formality & explanations.</span>
          </div>
        </div>
      )}
    </div>
  );
}
