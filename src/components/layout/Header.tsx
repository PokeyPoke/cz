import { Link } from 'react-router-dom';
import { Flame, Settings } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { getLevel, getXpForNextLevel } from '@/types/gamification';

export default function Header() {
  const { progress } = useProgress();
  const level = getLevel(progress.xp);
  const { progress: xpProgress } = getXpForNextLevel(progress.xp);

  // Calculate streak from progress
  const streakDays = (() => {
    if (!progress.lastActivityDate) return 0;
    const last = new Date(progress.lastActivityDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 1 ? (progress.streakStart ? Math.max(1, Math.floor((today.getTime() - new Date(progress.streakStart).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1) : 0;
  })();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 safe-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary-500 dark:text-primary-300">Č</span>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">CzLearn</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* XP / Level */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 rounded-full px-2.5 py-1">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-300">Lv.{level}</span>
              <div className="w-16 h-1.5 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          {streakDays > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 rounded-full px-2.5 py-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{streakDays}</span>
            </div>
          )}

          <Link to="/settings" className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
