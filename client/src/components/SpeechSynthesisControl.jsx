import React from 'react';
import { Volume2, VolumeX, Square, Play, Pause, Zap } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import AudioWaveVisualizer from './AudioWaveVisualizer';

export default function SpeechSynthesisControl({ className = '' }) {
  const {
    isSpeaking,
    isMuted,
    autoTTS,
    speechRate,
    stopSpeech,
    toggleMute,
    setAutoTTS,
    setSpeechRate,
  } = useAudio();

  const cycleSpeed = () => {
    if (speechRate === 1.0) setSpeechRate(1.25);
    else if (speechRate === 1.25) setSpeechRate(1.5);
    else if (speechRate === 1.5) setSpeechRate(0.85);
    else setSpeechRate(1.0);
  };

  return (
    <div
      className={`flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 ${className}`}
    >
      {/* Auto-TTS Toggle */}
      <button
        type="button"
        onClick={() => setAutoTTS(!autoTTS)}
        title={autoTTS ? 'Auto Voice Readout: Enabled' : 'Auto Voice Readout: Disabled'}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
          autoTTS
            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span className="font-semibold text-[11px]">Auto Voice: {autoTTS ? 'ON' : 'OFF'}</span>
      </button>

      {/* Speed Selector */}
      <button
        type="button"
        onClick={cycleSpeed}
        title="Cycle playback speed"
        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[11px] font-semibold transition-colors"
      >
        {speechRate}x
      </button>

      {/* Stop Speaking button if active */}
      {isSpeaking && (
        <button
          type="button"
          onClick={stopSpeech}
          title="Stop reading response"
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 font-semibold text-[11px] transition-colors shadow-xs animate-in fade-in"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>Stop</span>
        </button>
      )}

      {/* Global Mute Toggle */}
      <button
        type="button"
        onClick={toggleMute}
        title={isMuted ? 'Audio Muted' : 'Audio Enabled'}
        className={`p-1.5 rounded-lg border transition-colors ${
          isMuted
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        }`}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
