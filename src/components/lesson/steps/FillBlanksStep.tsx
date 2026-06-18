import { useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FillBlanksSegment } from '@/types/module';

interface FillBlanksStepProps {
  segment: FillBlanksSegment;
  onComplete: (score: number) => void;
}

export default function FillBlanksStep({ segment, onComplete }: FillBlanksStepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const allBlanks = segment.lines.flatMap((line) => line.blanks);

  const handleChange = (blankId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const handleChoiceSelect = (blankId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswer = (blankId: string, correct: string, acceptable?: string[]) => {
    const answer = (answers[blankId] || '').trim().toLowerCase();
    const correctLower = correct.toLowerCase();
    if (answer === correctLower) return true;
    if (acceptable?.some((a) => a.toLowerCase() === answer)) return true;
    return false;
  };

  const handleSubmit = useCallback(() => {
    const newResults: Record<string, boolean> = {};
    allBlanks.forEach((blank) => {
      newResults[blank.id] = checkAnswer(blank.id, blank.correctAnswer, blank.acceptableAnswers);
    });
    setResults(newResults);
    setSubmitted(true);

    const correctCount = Object.values(newResults).filter(Boolean).length;
    const score = Math.round((correctCount / allBlanks.length) * 100);
    onComplete(score);
  }, [answers, allBlanks, onComplete]);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResults({});
  };

  const renderBlank = (blank: typeof allBlanks[0]) => {
    const isMultipleChoice = blank.choices && blank.choices.length > 0;

    if (isMultipleChoice) {
      return (
        <span key={blank.id} className="inline-flex items-center gap-1">
          <span className="inline-flex flex-wrap gap-1">
            {blank.choices!.map((choice) => {
              const isSelected = answers[blank.id] === choice;
              const isWrong = submitted && !results[blank.id] && isSelected;

              return (
                <button
                  key={choice}
                  onClick={() => handleChoiceSelect(blank.id, choice)}
                  disabled={submitted}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-xs font-medium border transition-all',
                    submitted
                      ? choice === blank.correctAnswer
                        ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
                        : isWrong
                        ? 'bg-red-100 border-red-400 text-red-600 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
                        : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                      : isSelected
                      ? 'bg-primary-100 border-primary-400 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-300'
                      : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer',
                  )}
                >
                  {choice}
                </button>
              );
            })}
          </span>
          {submitted && (
            <span className="ml-1">
              {results[blank.id] ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <X className="w-3.5 h-3.5 text-red-400" />
              )}
            </span>
          )}
        </span>
      );
    }

    // Text input variant (original behavior)
    return (
      <span key={blank.id} className="inline-flex items-center gap-1">
        <input
          type="text"
          value={answers[blank.id] || ''}
          onChange={(e) => handleChange(blank.id, e.target.value)}
          disabled={submitted}
          placeholder={blank.hint || '...'}
          className={cn(
            'w-24 sm:w-32 px-2 py-0.5 border-b-2 bg-transparent text-center text-sm focus:outline-none transition-colors',
            submitted
              ? results[blank.id]
                ? 'border-green-500 text-green-600'
                : 'border-red-400 text-red-500'
              : 'border-primary-300 dark:border-primary-700 focus:border-primary-500',
          )}
        />
        {submitted && (
          <span>
            {results[blank.id] ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-400" />
            )}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {segment.title || 'Fill in the Blanks'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {segment.instructions || 'Complete the Czech phrases'}
        </p>
      </div>

      <div className="space-y-4">
        {segment.lines.map((line, lineIdx) => (
          <div
            key={lineIdx}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
              {line.english}
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
              {line.czechBefore}{' '}
              {line.blanks.map((blank) => renderBlank(blank))}{' '}
              {line.czechAfter}
            </p>
            {/* Show correct answers after submission */}
            {submitted && line.blanks.some((b) => !results[b.id]) && (
              <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                {line.blanks
                  .filter((b) => !results[b.id])
                  .map((b) => (
                    <span key={b.id} className="mr-3">
                      Answer: <strong>{b.correctAnswer}</strong>
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit / Reset */}
      <div className="flex justify-center gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={allBlanks.some((b) => !answers[b.id]?.trim())}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-full transition-colors disabled:cursor-not-allowed"
          >
            Check Answers
          </button>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Score: {Object.values(results).filter(Boolean).length} / {allBlanks.length}
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-primary-500 hover:underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
