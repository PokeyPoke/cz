import { Link } from 'react-router-dom';
import { Lock, CheckCircle2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonButtonProps {
  moduleId: string;
  lessonId: string;
  title: string;
  titleEn: string;
  order: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score?: number;
}

export default function LessonButton({
  moduleId,
  lessonId,
  title,
  titleEn,
  order,
  status,
  score,
}: LessonButtonProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-all',
        isLocked
          ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-50'
          : isCompleted
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : isInProgress
          ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm cursor-pointer',
      )}
    >
      {/* Order number */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
          isCompleted
            ? 'bg-green-500 text-white'
            : isInProgress
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
        )}
      >
        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : order}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{titleEn}</p>
        {score !== undefined && isCompleted && (
          <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
            Score: {score}%
          </span>
        )}
      </div>

      <div className="flex-shrink-0">
        {isLocked ? (
          <Lock className="w-4 h-4 text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Play className="w-5 h-5 text-primary-500" />
        )}
      </div>
    </div>
  );

  if (isLocked) return content;
  return <Link to={`/module/${moduleId}/lesson/${lessonId}`}>{content}</Link>;
}
