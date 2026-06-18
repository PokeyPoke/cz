import { MODULE_LIST } from '@/lib/constants';
import { useProgress } from '@/context/ProgressContext';
import { getLevel, getXpForNextLevel } from '@/types/gamification';
import ModuleCard from './ModuleCard';
import StreakDisplay from './StreakDisplay';
import XpBar from './XpBar';
import { todayStr } from '@/lib/utils';

export default function HomePage() {
  const { progress } = useProgress();
  const level = getLevel(progress.xp);
  const { progress: xpProgress } = getXpForNextLevel(progress.xp);
  const today = todayStr();
  const isTodayDone = progress.lastActivityDate === today && progress.dailyGoalComplete;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Hero section */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ahoj! 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isTodayDone
            ? 'Great job today! Keep the streak going.'
            : 'Ready to practice some Czech?'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StreakDisplay />
        <XpBar level={level} progress={xpProgress} xp={progress.xp} />
        <div className={`flex flex-col items-center justify-center rounded-2xl p-3 ${
          isTodayDone
            ? 'bg-green-50 dark:bg-green-900/20'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <span className="text-lg">{isTodayDone ? '✅' : '🎯'}</span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {isTodayDone ? 'Done!' : 'Goal'}
          </span>
        </div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Modules
        </h2>
        <div className="grid gap-3">
          {MODULE_LIST.map((mod) => {
            const modProgress = progress.modules[mod.id];
            const isLocked = mod.prerequisite
              ? progress.modules[mod.prerequisite]?.status !== 'completed'
              : false;
            return (
              <ModuleCard
                key={mod.id}
                id={mod.id}
                title={mod.title}
                titleEn={mod.titleEn}
                description={mod.description}
                icon={mod.icon}
                estimatedMinutes={mod.estimatedMinutes}
                status={isLocked ? 'locked' : modProgress?.status || 'available'}
                completedLessons={modProgress?.completedLessons || 0}
              />
            );
          })}
        </div>
      </div>

      {/* Resume / Quick action */}
      {progress.currentLessonId && (
        <div className="text-center">
          <a
            href={`/module/${progress.currentModuleId}/lesson/${progress.currentLessonId}`}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Continue Learning →
          </a>
        </div>
      )}
    </div>
  );
}
