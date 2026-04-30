let audioContext;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
};

const playTone = ({ frequency, duration, type = 'sine', volume = 0.18, delay = 0 }) => {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
};

export const playSuccessSound = () => {
  playTone({ frequency: 523.25, duration: 0.18, type: 'sine', volume: 0.16 });
  playTone({ frequency: 659.25, duration: 0.2, type: 'sine', volume: 0.14, delay: 0.12 });
  playTone({ frequency: 783.99, duration: 0.24, type: 'triangle', volume: 0.12, delay: 0.24 });
};

export const playErrorSound = () => {
  playTone({ frequency: 320, duration: 0.16, type: 'sawtooth', volume: 0.12 });
  playTone({ frequency: 240, duration: 0.22, type: 'sawtooth', volume: 0.1, delay: 0.12 });
};

export const playAudioUrl = (url) => {
  if (!url || typeof window === 'undefined') return;

  const audio = new Audio(url);
  audio.play().catch((error) => {
    console.log('Audio playback error:', error);
  });
};
