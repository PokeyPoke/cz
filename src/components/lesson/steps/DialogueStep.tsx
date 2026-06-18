import { useState, useCallback } from 'react';
import AudioPlayer from '../AudioPlayer';
import type { DialogueSegment } from '@/types/module';

interface DialogueStepProps {
  segment: DialogueSegment;
  onComplete: () => void;
}

export default function DialogueStep({ segment, onComplete }: DialogueStepProps) {
  const [activeLine, setActiveLine] = useState(-1);
  const [showTranslation, setShowTranslation] = useState(true);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      const idx = segment.lines.findIndex(
        (line) => time >= line.startTime && time < line.endTime,
      );
      if (idx !== activeLine) setActiveLine(idx);
    },
    [segment.lines, activeLine],
  );

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {segment.title || 'Listen to the Dialogue'}
        </h2>
        {segment.context && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{segment.context}</p>
        )}
      </div>

      <AudioPlayer
        src={segment.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onComplete}
      />

      <div className="flex justify-end">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-xs text-primary-500 hover:underline"
        >
          {showTranslation ? 'Hide' : 'Show'} translations
        </button>
      </div>

      <div className="space-y-2">
        {segment.lines.map((line, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl transition-all ${
              idx === activeLine
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 scale-[1.02]'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {line.speaker}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {line.czech}
            </p>
            {showTranslation && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                {line.english}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
