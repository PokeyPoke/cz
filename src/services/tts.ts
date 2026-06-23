const TTS_LANG = 'cs-CZ';
const DEFAULT_RATE = 0.8;
const DEFAULT_PITCH = 1.0;

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25;

let currentRate: number = DEFAULT_RATE;

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(
  text: string,
  rate: number = DEFAULT_RATE,
  pitch: number = DEFAULT_PITCH,
): void {
  if (!isTtsSupported()) return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = TTS_LANG;
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Try to find a Czech voice
  const voices = window.speechSynthesis.getVoices();
  const czechVoice = voices.find(
    (v) => v.lang.startsWith('cs') || v.lang.startsWith('cz'),
  );
  if (czechVoice) {
    utterance.voice = czechVoice;
  }

  currentRate = rate;
  window.speechSynthesis.speak(utterance);
}

export function stop(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
}

export function pause(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.pause();
}

export function resume(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.resume();
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  return window.speechSynthesis.getVoices();
}

export function getCurrentRate(): number {
  return currentRate;
}

export function isSpeaking(): boolean {
  if (!isTtsSupported()) return false;
  return window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  if (!isTtsSupported()) return false;
  return window.speechSynthesis.paused;
}

/**
 * Speak a single word slowly for pronunciation practice.
 */
export function speakWord(word: string, rate: number = 0.6): void {
  speak(word, rate, DEFAULT_PITCH);
}

/**
 * Ensure voices are loaded (Chrome loads them async).
 * Call this early, e.g., in a useEffect on mount.
 */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTtsSupported()) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}
