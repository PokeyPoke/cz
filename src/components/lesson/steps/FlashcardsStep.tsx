import { useState, useCallback, useMemo } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, ThumbsDown, Meh, ThumbsUp, Star } from 'lucide-react';
import { cn, todayStr } from '@/lib/utils';
import { useProgress } from '@/context/ProgressContext';
import type { FlashcardsSegment } from '@/types/module';

interface FlashcardsStepProps {
  segment: FlashcardsSegment;
  onComplete: () => void;
}

const QUALITY_LABELS = [
  { quality: 1, label: 'Forgot', icon: ThumbsDown, color: 'bg-red-100 dark:bg-red-900/20 text-red-500 hover:bg-red-200' },
  { quality: 2, label: 'Hard', icon: Meh, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-200' },
  { quality: 3, label: 'OK', icon: RotateCw, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-200' },
  { quality: 4, label: 'Good', icon: ThumbsUp, color: 'bg-green-100 dark:bg-green-900/20 text-green-500 hover:bg-green-200' },
  { quality: 5, label: 'Easy', icon: Star, color: 'bg-primary-100 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-200' },
];

export default function FlashcardsStep({ segment, onComplete }: FlashcardsStepProps) {
  const { progress, dispatch } = useProgress();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [showQuality, setShowQuality] = useState(false);

  const today = todayStr();

  // Sort cards: due-for-review first, then unreviewed
  const sortedCards = useMemo(() => {
    return [...segment.cards].sort((a, b) => {
      const stateA = progress.flashcards[a.id];
      const stateB = progress.flashcards[b.id];
      const aDue = stateA && stateA.nextReviewDate <= today ? 0 : 1;
      const bDue = stateB && stateB.nextReviewDate <= today ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      // New cards (no state) come after due cards
      if (!stateA && stateB) return 1;
      if (stateA && !stateB) return -1;
      return 0;
    });
  }, [segment.cards, progress.flashcards, today]);

  const currentCard = sortedCards[currentIdx];
  const allReviewed = reviewed.size >= sortedCards.length;
  const cardState = currentCard ? progress.flashcards[currentCard.id] : null;
  const isDue = cardState && cardState.nextReviewDate <= today;

  const flip = () => {
    if (!flipped) {
      setFlipped(true);
      setShowQuality(true);
    }
  };

  const rateCard = useCallback((quality: number) => {
    if (!currentCard) return;

    // Dispatch SM-2 update to ProgressContext
    dispatch({
      type: 'UPDATE_FLASHCARD',
      cardId: currentCard.id,
      moduleId: '', // moduleId not needed for lesson flashcards (stored inline)
      quality,
    });

    setReviewed((prev) => {
      const next = new Set(prev);
      next.add(currentIdx);
      return next;
    });

    if (currentIdx < sortedCards.length - 1) {
      setFlipped(false);
      setShowQuality(false);
      setTimeout(() => setCurrentIdx((i) => i + 1), 250);
    } else {
      setTimeout(onComplete, 400);
    }
  }, [currentCard, currentIdx, sortedCards.length, dispatch, onComplete]);

  const prev = () => {
    setFlipped(false);
    setShowQuality(false);
    setCurrentIdx((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setFlipped(false);
    setShowQuality(false);
    setCurrentIdx((i) => Math.min(sortedCards.length - 1, i + 1));
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
          {isDue && <span className="text-orange-500 font-medium">Due for review · </span>}
          Tap to flip · {currentIdx + 1} of {sortedCards.length}
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
            {isDue && (
              <span className="text-xs text-orange-500 font-medium mb-2 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                Review
              </span>
            )}
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

      {/* Quality rating buttons (shown when flipped) */}
      {showQuality && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            How well did you know this?
          </p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {QUALITY_LABELS.map((q) => (
              <button
                key={q.quality}
                onClick={() => rateCard(q.quality)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95',
                  q.color,
                )}
              >
                <q.icon className="w-3.5 h-3.5" />
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prev}
          disabled={currentIdx === 0}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={flip}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={next}
          disabled={currentIdx === sortedCards.length - 1}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1">
        {sortedCards.map((_, idx) => (
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
        <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium animate-slide-up">
          All cards reviewed! 🎉
        </p>
      )}
    </div>
  );
}
