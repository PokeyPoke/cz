import { useState, useMemo, useCallback } from 'react';
import { RotateCw, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { cn, todayStr } from '@/lib/utils';

export default function FlashcardsPage() {
  const { progress, dispatch } = useProgress();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState(0);

  // Get all flashcards from completed lessons
  const allCards = useMemo(() => {
    const cards: { id: string; front: string; back: string; moduleId: string; exampleSentence?: string }[] = [];
    // Collect from progress's flashcard registry
    for (const [cardId, state] of Object.entries(progress.flashcards)) {
      if (state.nextReviewDate <= todayStr()) {
        cards.push({
          id: cardId,
          front: cardId,
          back: '',
          moduleId: state.moduleId,
        });
      }
    }
    return cards;
  }, [progress.flashcards]);

  const currentCard = allCards[currentIdx];

  const flip = () => setFlipped(!flipped);

  const reviewCard = useCallback((quality: number) => {
    if (!currentCard) return;
    dispatch({ type: 'UPDATE_FLASHCARD', cardId: currentCard.id, moduleId: currentCard.moduleId, quality });
    setSessionCards((s) => s + 1);
    setFlipped(false);
    if (currentIdx < allCards.length - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 200);
    }
  }, [currentCard, currentIdx, allCards.length, dispatch]);

  if (allCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-5xl">🃏</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Flashcard Review</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete lessons to unlock flashcards for spaced repetition review.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Cards you've reviewed will appear here when they're due for review.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Flashcard Review</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {currentIdx + 1} of {allCards.length} due · {sessionCards} reviewed this session
        </p>
      </div>

      {/* Card */}
      <div onClick={flip} className="perspective-800 cursor-pointer" style={{ minHeight: '220px' }}>
        <div
          className={cn(
            'relative w-full h-[220px] transition-transform duration-500',
            flipped ? 'rotate-y-180' : '',
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 backface-hidden bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
              {currentCard?.front}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to reveal →</p>
          </div>
          <div
            className="absolute inset-0 backface-hidden bg-primary-50 dark:bg-primary-900/20 rounded-2xl border-2 border-primary-200 dark:border-primary-800 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl font-semibold text-primary-700 dark:text-primary-300 text-center">
              {currentCard?.back}
            </p>
            {currentCard?.exampleSentence && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center italic">
                &ldquo;{currentCard.exampleSentence}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => { setFlipped(false); setCurrentIdx((i) => Math.max(0, i - 1)); }}
          disabled={currentIdx === 0}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button onClick={() => reviewCard(2)} className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 hover:bg-red-200 text-red-500">
          <X className="w-5 h-5" />
        </button>

        <button onClick={flip} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">
          <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button onClick={() => reviewCard(4)} className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 hover:bg-green-200 text-green-500">
          <Check className="w-5 h-5" />
        </button>

        <button
          onClick={() => { setFlipped(false); setCurrentIdx((i) => Math.min(allCards.length - 1, i + 1)); }}
          disabled={currentIdx === allCards.length - 1}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
}
