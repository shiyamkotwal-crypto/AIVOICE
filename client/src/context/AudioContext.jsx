import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import speechService, { isTTSSupported, isSTTSupported } from '../services/speechService';
import { chatAPI } from '../services/api';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('voicebridge_muted') === 'true';
  });
  const [autoTTS, setAutoTTS] = useState(() => {
    const saved = localStorage.getItem('voicebridge_auto_tts');
    return saved !== null ? saved === 'true' : true;
  });

  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem('voicebridge_tts_rate') || '1.0');
  });
  const [speechPitch, setSpeechPitch] = useState(() => {
    return parseFloat(localStorage.getItem('voicebridge_tts_pitch') || '1.0');
  });
  const [speechVolume, setSpeechVolume] = useState(() => {
    return parseFloat(localStorage.getItem('voicebridge_tts_volume') || '1.0');
  });
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    return localStorage.getItem('voicebridge_tts_voice') || null;
  });

  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechService.getAvailableVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save settings on changes
  useEffect(() => {
    localStorage.setItem('voicebridge_muted', isMuted);
    localStorage.setItem('voicebridge_auto_tts', autoTTS);
    localStorage.setItem('voicebridge_tts_rate', speechRate.toString());
    localStorage.setItem('voicebridge_tts_pitch', speechPitch.toString());
    localStorage.setItem('voicebridge_tts_volume', speechVolume.toString());
    if (selectedVoiceName) {
      localStorage.setItem('voicebridge_tts_voice', selectedVoiceName);
    }
  }, [isMuted, autoTTS, speechRate, speechPitch, speechVolume, selectedVoiceName]);

  const stopSpeech = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setActiveMessageId(null);
  }, []);

  const pauseSpeech = useCallback(() => {
    speechService.pauseSpeaking();
    setIsSpeaking(false);
  }, []);

  const resumeSpeech = useCallback(() => {
    speechService.resumeSpeaking();
    setIsSpeaking(true);
  }, []);

  const speakMessage = useCallback(
    (messageId, text, language = 'en-US', onComplete = null) => {
      if (isMuted) {
        console.log('Audio is muted, skipping speech synthesis.');
        return;
      }

      // If clicking on already playing message, toggle stop
      if (activeMessageId === messageId && isSpeaking) {
        stopSpeech();
        return;
      }

      stopSpeech();
      setActiveMessageId(messageId);
      setIsSpeaking(true);

      speechService.speak(text, {
        lang: language,
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume,
        voiceName: selectedVoiceName,
        onStart: () => {
          setIsSpeaking(true);
          setActiveMessageId(messageId);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setActiveMessageId(null);
          // Mark audio played in backend if messageId provided
          if (messageId && messageId !== 'demo' && messageId !== 'test') {
            chatAPI.markAudioPlayed(messageId).catch(() => {});
          }
          onComplete && onComplete();
        },
        onError: () => {
          setIsSpeaking(false);
          setActiveMessageId(null);
        },
      });
    },
    [isMuted, activeMessageId, isSpeaking, speechRate, speechPitch, speechVolume, selectedVoiceName, stopSpeech]
  );

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeech();
    }
    setIsMuted((prev) => !prev);
  };

  return (
    <AudioContext.Provider
      value={{
        isSpeaking,
        activeMessageId,
        isMuted,
        autoTTS,
        speechRate,
        speechPitch,
        speechVolume,
        selectedVoiceName,
        availableVoices,
        isSTTSupported: isSTTSupported(),
        isTTSSupported: isTTSSupported(),
        speakMessage,
        stopSpeech,
        pauseSpeech,
        resumeSpeech,
        toggleMute,
        setAutoTTS,
        setSpeechRate,
        setSpeechPitch,
        setSpeechVolume,
        setSelectedVoiceName,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
