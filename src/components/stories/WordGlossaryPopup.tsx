import { useEffect, useRef } from 'react';
import { X, Volume2 } from 'lucide-react';
import { speakWord, isTtsSupported } from '@/services/tts';
import type { StoryVocabItem } from '@/types/story';
import { cn } from '@/lib/utils';

interface WordGlossaryPopupProps {
  word: string;
  vocabItem: StoryVocabItem | undefined;
  position: { top: number; left: number } | null;
  contextCz?: string;
  contextEn?: string;
  onClose: () => void;
}

export default function WordGlossaryPopup({
  word,
  vocabItem,
  position,
  contextCz,
  contextEn,
  onClose,
}: WordGlossaryPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const ttsSupported = isTtsSupported();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!position) return null;

  const handlePlayWord = () => {
    speakWord(word);
  };

  // Adjust position to stay in viewport
  const adjustedTop = Math.min(position.top, window.innerHeight - 320);
  const adjustedLeft = Math.min(position.left, window.innerWidth - 280);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 w-72 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
      style={{ top: adjustedTop, left: Math.max(8, adjustedLeft) }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {word}
        </h3>
        <button
          onClick={onClose}
          className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {vocabItem ? (
          <>
            {/* Part of speech */}
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {vocabItem.pos}
              </span>
            </div>

            {/* English translation */}
            <div>
              <span className="text-xs text-gray-400 dark:text-gray-500">English</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {vocabItem.english}
              </p>
            </div>

            {/* TTS button */}
            {ttsSupported && (
              <button
                onClick={handlePlayWord}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
                  'hover:bg-primary-100 dark:hover:bg-primary-900/40',
                )}
              >
                <Volume2 className="w-3.5 h-3.5" />
                Hear pronunciation
              </button>
            )}

            {/* Grammar notes */}
            {vocabItem.notes && (
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500">Grammar</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {vocabItem.notes}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No definition available
            </p>
            {ttsSupported && (
              <button
                onClick={handlePlayWord}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Hear pronunciation
              </button>
            )}
          </div>
        )}

        {/* Context */}
        {contextCz && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 dark:text-gray-500">Context</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              &ldquo;{contextCz}&rdquo;
            </p>
            {contextEn && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                &ldquo;{contextEn}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
