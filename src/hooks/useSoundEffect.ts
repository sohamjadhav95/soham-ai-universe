import { useCallback, useRef } from 'react';

type SoundType = 'hover' | 'click' | 'success' | 'navigation' | 'cta' | 'project';

export const useSoundEffect = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createWhooshSound = useCallback((audioContext: AudioContext, volume: number, duration: number) => {
    // Whoosh/Swish for hovers - noise burst with filter sweep
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise burst
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + duration);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    source.start(audioContext.currentTime);
    source.stop(audioContext.currentTime + duration);
  }, []);

  const createBlipSound = useCallback((audioContext: AudioContext, frequency: number, volume: number, duration: number) => {
    // Blip/Pop for clicks - short, clean, high-pitched
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  const createChimeSound = useCallback((audioContext: AudioContext, volume: number, duration: number) => {
    // Chime/Glint for success - soft, pleasant, crystalline
    const fundamental = 800;
    const harmonics = [1, 2, 3, 4];
    const gainNode = audioContext.createGain();
    
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    harmonics.forEach((harmonic, index) => {
      const oscillator = audioContext.createOscillator();
      const harmonicGain = audioContext.createGain();
      
      oscillator.connect(harmonicGain);
      harmonicGain.connect(gainNode);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(fundamental * harmonic, audioContext.currentTime);
      
      const harmonicVolume = 1 / (harmonic * harmonic); // Decreasing harmonic intensity
      harmonicGain.gain.setValueAtTime(harmonicVolume, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    });
  }, []);

  const playSound = useCallback((type: SoundType = 'hover') => {
    try {
      const audioContext = getAudioContext();
      
      // Resume audio context if suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      switch (type) {
        case 'hover':
        case 'navigation':
          // Whoosh for hovers
          createWhooshSound(audioContext, 0.06, 0.12);
          break;
          
        case 'click':
        case 'cta':
          // Blip for clicks
          createBlipSound(audioContext, 1200, 0.1, 0.08);
          break;
          
        case 'project':
          // Medium blip for project interactions
          createBlipSound(audioContext, 1000, 0.08, 0.1);
          break;
          
        case 'success':
          // Chime for success actions
          createChimeSound(audioContext, 0.08, 0.3);
          break;
      }
    } catch (error) {
      // Silently fail if audio is not supported
      console.warn('Audio not supported:', error);
    }
  }, [getAudioContext, createWhooshSound, createBlipSound, createChimeSound]);

  return { playSound };
};