import { useState, useRef } from 'react';
import { Play, Volume2 } from 'lucide-react';
import { preferredAudioFormat } from '@/lib/utils';
import type { PhrasesSegment } from '@/types/module';

interface PhrasesStepProps {
  segment: PhrasesSegment;
}

export default function PhrasesStep({ segment }: PhrasesStepProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playPhrase = (phraseId: string, src?: string) => {
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(`${src}.${preferredAudioFormat()}`);
    audioRef.current = audio;
    setPlayingId(phraseId);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {segment.title || 'Key Phrases'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tap any phrase to hear it pronounced
        </p>
      </div>

      <div className="space-y-2">
        {segment.phrases.map((phrase) => (
          <div
            key={phrase.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {phrase.czech}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {phrase.english}
                </p>
                {phrase.notes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                    {phrase.notes}
                  </p>
                )}
              </div>
              {phrase.audioSrc && (
                <button
                  onClick={() => playPhrase(phrase.id, phrase.audioSrc)}
                  className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                    playingId === phrase.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                  }`}
                >
                  {playingId === phrase.id ? (
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              )}
            </div>
            {phrase.transliteration && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                [{phrase.transliteration}]
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
