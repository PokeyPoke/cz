import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Mic } from 'lucide-react';
import { preferredAudioFormat } from '@/lib/utils';
import type { ShadowingSegment } from '@/types/module';

interface ShadowingStepProps {
  segment: ShadowingSegment;
  onComplete: () => void;
}

export default function ShadowingStep({ segment, onComplete }: ShadowingStepProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'paused' | 'recording' | 'idle'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentPhrase = segment.phrases[currentIdx];

  const playCurrent = useCallback(() => {
    if (!currentPhrase) return;
    setPhase('playing');

    const audio = new Audio(`${currentPhrase.audioSrc}.${preferredAudioFormat()}`);
    audioRef.current = audio;

    audio.play().catch(() => {});
    audio.onended = () => {
      // Pause for user to repeat
      setPhase('recording');
      timerRef.current = setTimeout(() => {
        if (currentIdx < segment.phrases.length - 1) {
          setCurrentIdx((i) => i + 1);
          setPhase('idle');
        } else {
          setPhase('idle');
          onComplete();
        }
      }, currentPhrase.pauseAfterMs);
    };
  }, [currentPhrase, currentIdx, segment.phrases.length, onComplete]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPhase('idle');
    // Small delay before replay
    setTimeout(playCurrent, 200);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {segment.title || 'Listen & Repeat'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Listen to each phrase, then repeat it during the pause
        </p>
      </div>

      {/* Current phrase display */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
        <div className="text-3xl font-semibold text-gray-900 dark:text-white min-h-[60px] flex items-center justify-center">
          {currentPhrase?.czech || 'Complete!'}
        </div>
        {currentPhrase?.english && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentPhrase.english}
          </p>
        )}

        {/* Phase indicator */}
        <div className="flex items-center justify-center gap-2">
          {phase === 'playing' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
              <Play className="w-3 h-3" /> Listening...
            </span>
          )}
          {phase === 'recording' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full animate-pulse">
              <Mic className="w-3 h-3" /> Your turn! Repeat aloud
            </span>
          )}
          {phase === 'idle' && currentPhrase && (
            <span className="text-xs text-gray-400">Ready</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={replay}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={playCurrent}
            disabled={phase === 'playing' || !currentPhrase}
            className="p-4 rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors disabled:cursor-not-allowed"
          >
            {phase === 'playing' ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={replay}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1">
          {segment.phrases.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx < currentIdx
                  ? 'bg-green-500'
                  : idx === currentIdx
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
