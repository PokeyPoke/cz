import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getAudioSrc(basePath: string, format: 'webm' | 'mp3'): string {
  const ext = format === 'webm' ? '.webm' : '.mp3';
  return `${basePath}${ext}`;
}

export function canPlayOpus(): boolean {
  const audio = document.createElement('audio');
  return audio.canPlayType('audio/webm; codecs="opus"') !== '';
}

export function preferredAudioFormat(): 'webm' | 'mp3' {
  return canPlayOpus() ? 'webm' : 'mp3';
}
