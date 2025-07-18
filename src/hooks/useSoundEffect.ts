import { useCallback, useRef } from 'react';

type SoundType = 'hover' | 'click' | 'navigation' | 'cta' | 'project';

export const useSoundEffect = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType = 'hover') => {
    try {
      const audioContext = getAudioContext();
      
      // Resume audio context if suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies and durations for different sound types
      const soundConfig = {
        hover: { frequency: 800, duration: 0.1, volume: 0.1 },
        click: { frequency: 1000, duration: 0.15, volume: 0.15 },
        navigation: { frequency: 600, duration: 0.12, volume: 0.08 },
        cta: { frequency: 1200, duration: 0.2, volume: 0.12 },
        project: { frequency: 900, duration: 0.14, volume: 0.1 }
      };

      const config = soundConfig[type];
      
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(config.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
    } catch (error) {
      // Silently fail if audio is not supported
      console.warn('Audio not supported:', error);
    }
  }, [getAudioContext]);

  return { playSound };
};