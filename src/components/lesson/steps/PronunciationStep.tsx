import { useState, useRef } from 'react';
import { Play, Volume2 } from 'lucide-react';
import { preferredAudioFormat } from '@/lib/utils';
import type { PronunciationSegment } from '@/types/module';

interface PronunciationStepProps {
  segment: PronunciationSegment;
}

export default function PronunciationStep({ segment }: PronunciationStepProps) {
  const [playingFocus, setPlayingFocus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTip = (focus: string, src?: string) => {
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(`${src}.${preferredAudioFormat()}`);
    audioRef.current = audio;
    setPlayingFocus(focus);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingFocus(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {segment.title || 'Pronunciation Guide'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Master the unique sounds of Czech
        </p>
      </div>

      <div className="space-y-3">
        {segment.tips.map((tip) => (
          <div
            key={tip.focus}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {tip.focus}
                  </span>
                  {tip.audioSrc && (
                    <button
                      onClick={() => playTip(tip.focus, tip.audioSrc)}
                      className={`p-1.5 rounded-full transition-colors ${
                        playingFocus === tip.focus
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                      }`}
                    >
                      {playingFocus === tip.focus ? (
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tip.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tip.czechExamples.map((ex, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {segment.tips.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Coming soon: Pronunciation tips for this lesson.
          </p>
        </div>
      )}
    </div>
  );
}
