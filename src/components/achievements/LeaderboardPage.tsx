import { useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { getLevel } from '@/types/gamification';

// Mock leaderboard data - in a real app, this would come from GitHub sync
const MOCK_PLAYERS = [
  { name: 'You', isYou: true, key: 'you' },
  { name: 'CzechMate42', key: 'p2' },
  { name: 'PrahaFan', key: 'p3' },
  { name: 'BohemiaBound', key: 'p4' },
  { name: 'LearningCZ', key: 'p5' },
];

export default function LeaderboardPage() {
  const { progress } = useProgress();

  const entries = useMemo(() => {
    const level = getLevel(progress.xp);
    return MOCK_PLAYERS.map((p, idx) => ({
      ...p,
      xp: p.isYou ? progress.xp : Math.max(0, progress.xp - (idx * 150) + Math.floor(Math.random() * 200)),
      level: p.isYou ? level : Math.max(1, level - (idx > 0 ? idx : 0)),
      rank: p.isYou ? (idx === 0 ? 1 : idx) : idx + 1,
    })).sort((a, b) => b.xp - a.xp);
  }, [progress.xp]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Connect with GitHub to compete with other learners. For now, here's a local preview.
      </p>

      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div
            key={entry.key}
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              entry.isYou
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            }`}
          >
            <span className="w-7 text-center font-bold text-sm text-gray-400 dark:text-gray-500">
              {idx + 1}
            </span>
            <span className="text-lg">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  '}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry.name} {entry.isYou && '(You)'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Lv.{entry.level}</p>
            </div>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {entry.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
