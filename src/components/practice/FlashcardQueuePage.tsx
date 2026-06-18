import { useState, useMemo, useCallback } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, ThumbsDown, Meh, ThumbsUp, Star, Award } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { cn, todayStr } from '@/lib/utils';
import { XP_REWARDS } from '@/lib/constants';

const QUALITY_LABELS = [
  { quality: 1, label: 'Forgot', icon: ThumbsDown, color: 'bg-red-100 dark:bg-red-900/20 text-red-500 hover:bg-red-200' },
  { quality: 2, label: 'Hard', icon: Meh, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-200' },
  { quality: 3, label: 'OK', icon: RotateCw, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-200' },
  { quality: 4, label: 'Good', icon: ThumbsUp, color: 'bg-green-100 dark:bg-green-900/20 text-green-500 hover:bg-green-200' },
  { quality: 5, label: 'Easy', icon: Star, color: 'bg-primary-100 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-200' },
];

export default function FlashcardQueuePage() {
  const { progress, dispatch } = useProgress();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedThis, setReviewedThis] = useState(0);
  const [showQuality, setShowQuality] = useState(false);
  const [earnedBonus, setEarnedBonus] = useState(false);
  const today = todayStr();

  // Gather all due cards from all modules
  const dueCards = useMemo(() => {
    const cards: { id: string; front: string; back: string; moduleId: string }[] = [];
    for (const [cardId, state] of Object.entries(progress.flashcards)) {
      if (state.nextReviewDate <= today) {
        cards.push({
          id: cardId,
          front: cardId,
          back: '',
          moduleId: state.moduleId,
        });
      }
    }
    return cards;
  }, [progress.flashcards, today]);

  const currentCard = dueCards[currentIdx];
  const allDone = currentIdx >= dueCards.length;
  const DAILY_QUOTA = 10;

  const flip = () => {
    if (!flipped) {
      setFlipped(true);
      setShowQuality(true);
    }
  };

  const rateCard = useCallback((quality: number) => {
    if (!currentCard) return;

    dispatch({
      type: 'UPDATE_FLASHCARD',
      cardId: currentCard.id,
      moduleId: currentCard.moduleId,
      quality,
    });

    setReviewedThis((r) => {
      const next = r + 1;
      // Award XP when hitting daily quota
      if (next >= DAILY_QUOTA && !earnedBonus) {
        setEarnedBonus(true);
        dispatch({ type: 'ADD_XP', amount: XP_REWARDS.flashcardQuota });
      }
      return next;
    });

    setFlipped(false);
    setShowQuality(false);
    setTimeout(() => setCurrentIdx((i) => i + 1), 200);
  }, [currentCard, dispatch, earnedBonus]);

  const prev = () => {
    setFlipped(false);
    setShowQuality(false);
    setCurrentIdx((i) => Math.max(0, i - 1));
  };

  if (dueCards.length === 0 || allDone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-5xl">{allDone ? '🎉' : '📭'}</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {allDone ? 'All Caught Up!' : 'No Cards Due'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {allDone
            ? `Reviewed ${reviewedThis} cards. Great job!`
            : 'Complete lessons to build your flashcard deck. Cards will appear here when due for review.'}
        </p>
        {allDone && reviewedThis >= DAILY_QUOTA && (
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Award className="w-4 h-4" />
            +{XP_REWARDS.flashcardQuota} XP Daily Bonus!
          </div>
        )}
        {allDone && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            New cards will appear as you complete more lessons.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Due Today</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {currentIdx + 1} of {dueCards.length} cards · {reviewedThis} reviewed
        </p>
        {reviewedThis < DAILY_QUOTA && !earnedBonus && (
          <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">
            Review {DAILY_QUOTA - reviewedThis} more for +{XP_REWARDS.flashcardQuota} XP bonus
          </p>
        )}
        {earnedBonus && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">
            +{XP_REWARDS.flashcardQuota} XP bonus earned! 🎉
          </p>
        )}
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
            <span className="text-xs text-orange-500 font-medium mb-2 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
              Due for review
            </span>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
              {currentCard.front}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to reveal →</p>
          </div>
          <div
            className="absolute inset-0 backface-hidden bg-primary-50 dark:bg-primary-900/20 rounded-2xl border-2 border-primary-200 dark:border-primary-800 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl font-semibold text-primary-700 dark:text-primary-300 text-center">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {/* Quality rating buttons */}
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
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={prev}
          disabled={currentIdx === 0}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={flip} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">
          <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={() => { setFlipped(false); setShowQuality(false); setCurrentIdx((i) => i + 1); }}
          disabled={currentIdx >= dueCards.length - 1}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.round((currentIdx / dueCards.length) * 100)}%` }}
        />
      </div>
    </div>
  );
}
