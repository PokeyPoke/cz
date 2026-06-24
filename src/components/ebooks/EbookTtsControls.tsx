import { useCallback } from 'react';
import { Play, Pause, Square, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EbookTtsControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  mode: 'sentence' | 'continuous';
  onModeChange: (mode: 'sentence' | 'continuous') => void;
  elapsedTime: number; // ms
  totalDuration: number; // ms
  className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

function formatTime(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function EbookTtsControls({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  speed,
  onSpeedChange,
  mode,
  onModeChange,
  elapsedTime,
  totalDuration,
  className,
}: EbookTtsControlsProps) {
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }, [isPlaying, onPlay, onPause]);

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-bottom',
        className,
      )}
    >
      {/* Progress bar */}
      {totalDuration > 0 && (
        <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-primary-500 transition-all duration-100"
            style={{ width: `${Math.min(100, (elapsedTime / totalDuration) * 100)}%` }}
          />
        </div>
      )}

      <div className="px-4 py-3 space-y-3">
        {/* Time display */}
        {isPlaying && totalDuration > 0 && (
          <div className="text-center">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {formatTime(elapsedTime)} / {formatTime(totalDuration)}
            </span>
          </div>
        )}

        {/* Play controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onStop}
            disabled={!isPlaying}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
            title="Stop"
          >
            <Square className="w-5 h-5" fill="currentColor" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center justify-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium transition-colors',
                speed === s
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
              )}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onModeChange('sentence')}
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-medium transition-colors',
              mode === 'sentence'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            )}
          >
            Tap to hear
          </button>
          <button
            onClick={() => onModeChange('continuous')}
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-medium transition-colors',
              mode === 'continuous'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            )}
          >
            Continuous
          </button>
        </div>
      </div>
    </div>
  );
}
