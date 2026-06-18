import { useRef, useState, useCallback, useEffect } from 'react';
import { preferredAudioFormat } from '@/lib/utils';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((src: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const format = preferredAudioFormat();
    const srcWithExt = src.includes('.') ? src : `${src}.${format}`;
    if (audio.src !== srcWithExt) {
      audio.src = srcWithExt;
    }
    audio.playbackRate = speed;
    audio.play().catch(() => {
      // Fallback: try MP3 if WebM fails
      if (format === 'webm') {
        audio.src = `${src}.mp3`;
        audio.play().catch(() => {});
      }
    });
  }, [speed]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setSpeed = useCallback((s: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = s;
    }
    setSpeedState(s);
  }, []);

  const playSegment = useCallback((src: string, start: number, end: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const format = preferredAudioFormat();
    const srcWithExt = src.includes('.') ? src : `${src}.${format}`;
    if (audio.src !== srcWithExt) {
      audio.src = srcWithExt;
    }
    audio.currentTime = start;
    audio.playbackRate = speed;
    audio.play().catch(() => {});

    const onTimeUpdate = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
  }, [speed]);

  return { play, pause, seek, setSpeed, playSegment, playing, currentTime, duration, speed, audioRef };
}
