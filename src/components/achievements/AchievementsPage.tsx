import { useGamification } from '@/context/GamificationContext';
import { useProgress } from '@/context/ProgressContext';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { getUnlockedAchievements, getLockedAchievements, newlyUnlocked, dismissNewUnlock } = useGamification();
  const { progress } = useProgress();

  const unlocked = getUnlockedAchievements();
  const locked = getLockedAchievements();

  const categoryLabels: Record<string, string> = {
    milestone: 'Milestones',
    streak: 'Streaks',
    mastery: 'Mastery',
    social: 'Social',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h1>

      {/* Newly unlocked */}
      {newlyUnlocked.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-green-700 dark:text-green-400">🎉 Just Unlocked!</h2>
          {newlyUnlocked.map((a) => (
            <div key={a.id} className="flex items-center gap-3 animate-badge-pop">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{a.description}</p>
              </div>
              <button
                onClick={() => dismissNewUnlock(a.id)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{unlocked.length}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Unlocked</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{locked.length}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Remaining</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-bold text-gold-500">{progress.xp}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Total XP</p>
        </div>
      </div>

      {/* Badge grid */}
      <div className="space-y-4">
        {Object.entries(categoryLabels).map(([cat, label]) => {
          const catUnlocked = unlocked.filter((a) => a.category === cat);
          const catLocked = locked.filter((a) => a.category === cat);
          if (catUnlocked.length === 0 && catLocked.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{label}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[...catUnlocked, ...catLocked].map((a) => {
                  const isUnlocked = unlocked.some((u) => u.id === a.id);
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all',
                        isUnlocked
                          ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                          : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 opacity-50',
                      )}
                    >
                      <span className={cn('text-2xl', !isUnlocked && 'grayscale')}>
                        {a.hidden && !isUnlocked ? '❓' : a.icon}
                      </span>
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
                        {a.hidden && !isUnlocked ? '???' : a.title}
                      </span>
                      {isUnlocked && (
                        <span className="text-[9px] text-gold-500">+{a.xpReward} XP</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
