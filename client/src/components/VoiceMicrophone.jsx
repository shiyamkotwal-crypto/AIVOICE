import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import speechService, { isSTTSupported } from '../services/speechService';
import AudioWaveVisualizer from './AudioWaveVisualizer';

export default function VoiceMicrophone({
  language = 'en-US',
  onTranscript,
  onListeningChange,
  disabled = false,
  className = '',
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const hasSubmittedRef = useRef(false);
  const supported = isSTTSupported();

  useEffect(() => {
    onListeningChange && onListeningChange(isRecording);
  }, [isRecording, onListeningChange]);

  useEffect(() => {
    return () => {
      speechService.stopListening();
    };
  }, []);

  const handleToggle = () => {
    if (disabled) return;

    if (!supported) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      setInterimText('');
    } else {
      setErrorMsg(null);
      setInterimText('');
      hasSubmittedRef.current = false;
      speechService.startListening({
        lang: language,
        onStart: () => {
          setIsRecording(true);
        },
        onResult: ({ interimTranscript, finalTranscript }) => {
          setInterimText(interimTranscript);
          if (finalTranscript && finalTranscript.trim() && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            speechService.stopListening();
            setIsRecording(false);
            setInterimText('');
            onTranscript && onTranscript(finalTranscript.trim(), true);
          }
        },
        onError: (err) => {
          setIsRecording(false);
          setInterimText('');
          setErrorMsg(err);
          setTimeout(() => setErrorMsg(null), 5000);
        },
        onEnd: (finalTranscript) => {
          setIsRecording(false);
          setInterimText('');
          if (finalTranscript && finalTranscript.trim() && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            onTranscript && onTranscript(finalTranscript.trim(), true);
          }
        },
      });
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Listening Interim Bubble */}
      {isRecording && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-max max-w-xs sm:max-w-md px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 text-xs shadow-xl backdrop-blur-md flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150 z-30">
          <AudioWaveVisualizer isPlaying={true} count={4} color="bg-emerald-400 dark:bg-emerald-600" />
          <span className="font-semibold text-emerald-400 dark:text-emerald-600">Listening:</span>
          <span className="truncate italic">
            {interimText || 'Speak now...'}
          </span>
        </div>
      )}

      {/* Error alert toast */}
      {errorMsg && (
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-max max-w-xs sm:max-w-sm px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] shadow-lg flex items-center space-x-1.5 z-30 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{errorMsg}</span>
        </div>
      )}

      {/* The Microphone Button */}
      <div className="relative">
        {/* Animated Ripple Rings when recording */}
        {isRecording && (
          <>
            <span className="absolute -inset-2 rounded-full bg-brand-500/30 animate-ping opacity-75"></span>
            <span className="absolute -inset-4 rounded-full bg-brand-500/20 animate-pulse"></span>
          </>
        )}

        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          title={
            !supported
              ? 'Speech recognition not supported in this browser'
              : isRecording
              ? 'Click to stop listening'
              : 'Click to speak (Voice STT)'
          }
          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            disabled
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : isRecording
              ? 'bg-gradient-to-tr from-rose-500 to-rose-600 text-white shadow-rose-500/40 scale-105'
              : 'bg-gradient-to-tr from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white shadow-brand-500/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5 animate-pulse" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
