import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { speak, stop, pause, resume, isSpeaking, isPaused, isTtsSupported } from '@/services/tts';
import { cn } from '@/lib/utils';

interface TextToSpeechControlsProps {
  text: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

const SPEEDS: { label: string; value: number }[] = [
  { label: '0.5×', value: 0.5 },
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
];

export default function TextToSpeechControls({
  text,
  label,
  compact = false,
  className,
}: TextToSpeechControlsProps) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(0.8);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const supported = isTtsSupported();

  // Update playing state from speech API
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaying(isSpeaking());
      setPaused(isPaused());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    setPaused(false);
    speak(text, speed);
  }, [text, speed]);

  const handlePause = useCallback(() => {
    pause();
    setPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    resume();
    setPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    stop();
    setPlaying(false);
    setPaused(false);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
  }, []);

  if (!supported) {
    return (
      <span className={cn('text-xs text-gray-400 italic', className)}>
        TTS not available
      </span>
    );
  }

  if (compact) {
    return (
      <button
        onClick={playing ? handleStop : handlePlay}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
          playing
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
          className,
        )}
        title={label ? `Play: ${label}` : 'Play pronunciation'}
      >
        <Volume2 className="w-3 h-3" />
        <span>{label || 'Play'}</span>
      </button>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {/* Play/Pause/Stop */}
      {!playing || paused ? (
        <button
          onClick={paused ? handleResume : handlePlay}
          className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
          title="Play"
        >
          <Play className="w-3.5 h-3.5" fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={handlePause}
          className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
          title="Pause"
        >
          <Pause className="w-3.5 h-3.5" fill="currentColor" />
        </button>
      )}

      {/* Stop */}
      {playing && (
        <button
          onClick={handleStop}
          className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Stop"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Speed control */}
      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {speed}×
        </button>
        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSpeedChange(s.value)}
                className={cn(
                  'block w-full text-left px-3 py-1 text-xs whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  speed === s.value
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
