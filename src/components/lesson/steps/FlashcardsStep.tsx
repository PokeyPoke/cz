import { useState, useCallback } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashcardsSegment } from '@/types/module';

interface FlashcardsStepProps {
  segment: FlashcardsSegment;
  onComplete: () => void;
}

export default function FlashcardsStep({ segment, onComplete }: FlashcardsStepProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  const currentCard = segment.cards[currentIdx];
  const allReviewed = reviewed.size >= segment.cards.length;

  const flip = () => setFlipped(!flipped);

  const markCard = useCallback((_known: boolean) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      next.add(currentIdx);
      if (next.size >= segment.cards.length) {
        setTimeout(onComplete, 500);
      }
      return next;
    });

    if (currentIdx < segment.cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCurrentIdx((i) => i + 1), 300);
    }
  }, [currentIdx, segment.cards.length, onComplete]);

  const prev = () => {
    setFlipped(false);
    setCurrentIdx((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setFlipped(false);
    setCurrentIdx((i) => Math.min(segment.cards.length - 1, i + 1));
  };

  if (!currentCard) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No flashcards in this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {segment.title || 'Flashcard Review'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tap to flip · {currentIdx + 1} of {segment.cards.length}
        </p>
      </div>

      {/* Card */}
      <div
        onClick={flip}
        className="perspective-800 cursor-pointer"
        style={{ minHeight: '200px' }}
      >
        <div
          className={cn(
            'relative w-full h-[200px] transition-transform duration-500',
            flipped ? 'rotate-y-180' : '',
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
              {currentCard.front}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to reveal →</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border-2 border-primary-200 dark:border-primary-800 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl font-semibold text-primary-700 dark:text-primary-300 text-center">
              {currentCard.back}
            </p>
            {currentCard.exampleSentence && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center italic">
                &ldquo;{currentCard.exampleSentence}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Response buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prev}
          disabled={currentIdx === 0}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={() => markCard(false)}
          className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={flip}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={() => markCard(true)}
          className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-500 transition-colors"
        >
          <Check className="w-5 h-5" />
        </button>

        <button
          onClick={next}
          disabled={currentIdx === segment.cards.length - 1}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1">
        {segment.cards.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              reviewed.has(idx)
                ? 'bg-green-500'
                : idx === currentIdx
                ? 'bg-primary-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {allReviewed && (
        <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
          All cards reviewed! 🎉
        </p>
      )}
    </div>
  );
}
