import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn, preferredAudioFormat } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  startTime?: number;
  endTime?: number;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  className?: string;
}

export default function AudioPlayer({
  src,
  startTime,
  endTime,
  onTimeUpdate,
  onEnded,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const speeds = [0.75, 1, 1.25];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const format = preferredAudioFormat();
    const srcWithExt = src.includes('.') ? src : `${src}.${format}`;
    audio.src = srcWithExt;

    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
      if (endTime && audio.currentTime >= endTime) {
        audio.pause();
        setPlaying(false);
        onEnded?.();
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      onEnded?.();
    };
    const onError = () => {
      // Fallback to MP3
      if (!audio.src.endsWith('.mp3')) {
        audio.src = `${src}.mp3`;
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onError);
    };
  }, [src, endTime, onTimeUpdate, onEnded]);

  // Set start time when audio loads
  useEffect(() => {
    if (startTime && audioRef.current && duration > 0) {
      audioRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  }, [duration, startTime]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      if (startTime && audio.currentTime < startTime) {
        audio.currentTime = startTime;
      }
      audio.playbackRate = speed;
      audio.play().catch(() => {});
    }
  }, [playing, startTime, speed]);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  }, []);

  const cycleSpeed = useCallback(() => {
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }, [speed]);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  }, [duration]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3', className)}>
      <audio ref={audioRef} preload="auto" />

      {/* Progress bar */}
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={seek}
        className="audio-slider w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer mb-2"
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 w-10">
          {formatTime(currentTime)}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-10)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <SkipBack className="w-4 h-4 text-gray-500" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
          >
            {playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <button
          onClick={cycleSpeed}
          className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[40px]"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
