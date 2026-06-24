import { useState, useCallback, useRef, useEffect } from 'react';
import type { WordTiming } from '@/types/ebook';

const MS_PER_WORD_BASELINE = 400; // at 1× speed (150 wpm)
const TICK_INTERVAL = 50; // ms between highlight updates

interface UseWordHighlightingOptions {
  text: string;
  speechRate: number;
  onWordChange?: (wordIndex: number) => void;
  onComplete?: () => void;
}

interface UseWordHighlightingReturn {
  currentWordIndex: number;
  wordTimings: WordTiming[];
  isPlaying: boolean;
  startPlayback: () => void;
  stopPlayback: () => void;
  resetPlayback: () => void;
  totalDuration: number;
  elapsedTime: number;
}

export function useWordHighlighting({
  text,
  speechRate,
  onWordChange,
  onComplete,
}: UseWordHighlightingOptions): UseWordHighlightingReturn {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const wordTimingsRef = useRef<WordTiming[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  // Calculate word timings whenever text or rate changes
  useEffect(() => {
    const words = text.split(/\s+/).filter(Boolean);
    const msPerWord = MS_PER_WORD_BASELINE / speechRate;
    const timings: WordTiming[] = [];

    let charIndex = 0;
    let timeMs = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Find the actual character position in the original text
      const actualIndex = text.indexOf(word, charIndex);
      if (actualIndex === -1) continue;

      timings.push({
        word,
        startChar: actualIndex,
        endChar: actualIndex + word.length,
        startTime: timeMs,
        endTime: timeMs + msPerWord,
      });

      charIndex = actualIndex + word.length;
      timeMs += msPerWord;
    }

    wordTimingsRef.current = timings;
  }, [text, speechRate]);

  const totalDuration =
    wordTimingsRef.current.length > 0
      ? wordTimingsRef.current[wordTimingsRef.current.length - 1].endTime
      : 0;

  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsPlaying(true);
    setCurrentWordIndex(0);
    setElapsedTime(0);
    startTimeRef.current = Date.now() - pausedAtRef.current;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setElapsedTime(elapsed);

      const timings = wordTimingsRef.current;
      if (timings.length === 0) return;

      // Binary search for current word
      let lo = 0;
      let hi = timings.length - 1;
      let foundIdx = -1;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const t = timings[mid];
        if (elapsed >= t.startTime && elapsed < t.endTime) {
          foundIdx = mid;
          break;
        } else if (elapsed < t.startTime) {
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      }

      // If past the last word, complete
      if (foundIdx === -1 && elapsed >= (timings[timings.length - 1]?.endTime ?? 0)) {
        setCurrentWordIndex(-1);
        setIsPlaying(false);
        setElapsedTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete?.();
        return;
      }

      if (foundIdx >= 0) {
        setCurrentWordIndex(foundIdx);
        onWordChange?.(foundIdx);
      }
    }, TICK_INTERVAL);
  }, [onWordChange, onComplete]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setElapsedTime(0);
    pausedAtRef.current = 0;
  }, []);

  const resetPlayback = useCallback(() => {
    stopPlayback();
    setCurrentWordIndex(-1);
    setElapsedTime(0);
    pausedAtRef.current = 0;
  }, [stopPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentWordIndex,
    wordTimings: wordTimingsRef.current,
    isPlaying,
    startPlayback,
    stopPlayback,
    resetPlayback,
    totalDuration,
    elapsedTime,
  };
}
