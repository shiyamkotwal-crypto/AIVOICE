import React from 'react';
import { GraduationCap, Laptop, Building2, FileText } from 'lucide-react';

export const DOMAINS = [
  {
    name: 'Academic & Admissions',
    icon: GraduationCap,
    badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20',
    activeColor: 'bg-emerald-600 text-white shadow-emerald-500/20',
  },
  {
    name: 'Technical Helpdesk',
    icon: Laptop,
    badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-500/20',
    activeColor: 'bg-blue-600 text-white shadow-blue-500/20',
  },
  {
    name: 'Campus Facilities',
    icon: Building2,
    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20',
    activeColor: 'bg-amber-600 text-white shadow-amber-500/20',
  },
  {
    name: 'General Administrative',
    icon: FileText,
    badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-500/20',
    activeColor: 'bg-purple-600 text-white shadow-purple-500/20',
  },
];

export default function DomainSelector({ currentDomain = 'General Administrative', onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {DOMAINS.map((domain) => {
        const Icon = domain.icon;
        const isActive = currentDomain === domain.name;

        return (
          <button
            key={domain.name}
            type="button"
            onClick={() => onChange(domain.name)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? `${domain.activeColor} shadow-md scale-[1.02]`
                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{domain.name}</span>
          </button>
        );
      })}
    </div>
  );
}
