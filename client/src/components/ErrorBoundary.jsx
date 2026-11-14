import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    // Clear potentially corrupted preference keys
    try {
      if (typeof window !== 'undefined') {
        const lang = localStorage.getItem('voicebridge_pref_lang');
        if (lang === 'undefined' || lang === 'null') {
          localStorage.removeItem('voicebridge_pref_lang');
        }
      }
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-850 border border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">VoiceBridge AI Recovered</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A temporary interface state error was intercepted. Click below to reload with clean preferences.
            </p>
            {this.state.error && (
              <p className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-rose-300 break-all text-left">
                {this.state.error.message || String(this.state.error)}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
