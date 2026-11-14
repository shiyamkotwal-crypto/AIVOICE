import React, { useState } from 'react';
import {
  MapPin,
  FileText,
  ExternalLink,
  X,
  Download,
  Printer,
  Clock,
  Building,
  Navigation,
  CheckCircle,
  Shield,
  Compass,
} from 'lucide-react';

export function LocationModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-slate-200 dark:border-slate-800 shadow-2xl p-6 bg-white dark:bg-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Interactive Campus Locator
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {data.label || 'Campus Destination'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated Campus Mini-Map Visual */}
        <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-950 p-4 border border-slate-700/60 overflow-hidden flex flex-col justify-between text-white">
          {/* Decorative Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono border border-emerald-500/30">
              <Compass className="w-3.5 h-3.5" />
              <span>Campus GPS Grid: Sector 4-B</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Walking: 2 mins</span>
          </div>

          {/* Animated Pin */}
          <div className="relative z-10 flex items-center space-x-3 self-center my-auto">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 items-center justify-center text-white">
                <MapPin className="w-3 h-3" />
              </span>
            </span>
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-semibold shadow-lg">
              {data.room || data.label}
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Building: {data.building || 'Main Campus Block'}</span>
            <span>Floor: {data.floor || 'Ground Level'}</span>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Operating Hours: <strong className="text-slate-900 dark:text-white">{data.hours || 'Mon-Fri: 9:00 AM - 5:00 PM'}</strong></span>
          </div>
          <div className="flex items-start space-x-2">
            <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{data.description || 'Visit during operational hours with your student ID card.'}</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md"
        >
          Done / Close Locator
        </button>
      </div>
    </div>
  );
}

export function DocumentModal({ isOpen, onClose, data }) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    setDownloaded(true);
    const element = document.createElement('a');
    const file = new Blob([
      `OFFICIAL UNIVERSITY DOCUMENT\nDocument: ${data.label}\nFile: ${data.filename}\nGenerated via VoiceBridge AI Platform\nDate: ${new Date().toISOString()}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = data.filename || 'University_Official_Form.pdf';
    document.body.appendChild(element);
    element.click();
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-slate-200 dark:border-slate-800 shadow-2xl p-6 bg-white dark:bg-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Official Document Vault
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-xs">
                {data.title || 'Official University PDF'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Sheet Preview */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 space-y-3 font-serif">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-3 text-center">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-sans">
              UNIVERSITY ADMINISTRATIVE COUNCIL
            </p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {data.label || 'Application & Clearance Form'}
            </h4>
            <p className="text-[10px] font-sans text-slate-400 mt-0.5">
              Ref: VB-DOC-{Math.floor(100000 + Math.random() * 900000)} • Size: {data.size || '220 KB'}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
            {data.description || 'This document has been verified by the Registrar Directorate. Submit the signed copy with your student clearance receipt.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            {downloaded ? <CheckCircle className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Downloaded!' : 'Download PDF'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Form</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PortalModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-card border border-slate-200 dark:border-slate-800 shadow-2xl p-6 bg-white dark:bg-slate-900 space-y-5">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ExternalLink className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Single Sign-On (SSO)
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {data.title || 'Campus Portal Link'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <p className="font-semibold text-slate-900 dark:text-white">{data.label}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            {data.description || 'You will be redirected to the secure university portal. Authenticate using your student credentials.'}
          </p>
          <div className="pt-1 font-mono text-[10px] text-blue-600 dark:text-blue-400 truncate">
            Target URL: {data.url || 'https://portal.campus.edu'}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={data.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors text-center"
          >
            <span>Proceed to Gateway</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
