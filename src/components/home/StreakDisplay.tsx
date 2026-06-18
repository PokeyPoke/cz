import { Flame } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';

export default function StreakDisplay() {
  const { progress } = useProgress();

  const streak = (() => {
    if (!progress.lastActivityDate) return 0;
    const last = new Date(progress.lastActivityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 1) return 0;
    if (!progress.streakStart) return 1;
    const start = new Date(progress.streakStart);
    start.setHours(0, 0, 0, 0);
    return Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  })();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 p-3">
      <div className="flex items-center gap-1">
        <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {streak}
        </span>
      </div>
      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
        day streak
      </span>
    </div>
  );
}
