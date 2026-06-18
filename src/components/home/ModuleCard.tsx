import { Link } from 'react-router-dom';
import { Lock, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completedLessons: number;
}

export default function ModuleCard({
  id,
  title,
  titleEn,
  description,
  icon,
  estimatedMinutes,
  status,
}: ModuleCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const content = (
    <div
      className={cn(
        'relative flex items-center gap-3 p-4 rounded-2xl border transition-all',
        isLocked
          ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
          : isCompleted
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:shadow-md cursor-pointer'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer',
      )}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {title}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
            {titleEn}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
          {description}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">{estimatedMinutes} min</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : status === 'in_progress' ? (
          <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        ) : null}
      </div>
    </div>
  );

  if (isLocked) return content;
  return <Link to={`/module/${id}`}>{content}</Link>;
}
