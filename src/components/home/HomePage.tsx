import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { MODULE_LIST } from '@/lib/constants';
import { useProgress } from '@/context/ProgressContext';
import { getLevel, getXpForNextLevel } from '@/types/gamification';
import ModuleCard from './ModuleCard';
import StreakDisplay from './StreakDisplay';
import XpBar from './XpBar';
import { todayStr } from '@/lib/utils';
import storiesData from '@/data/stories.json';

export default function HomePage() {
  const { progress } = useProgress();
  const level = getLevel(progress.xp);
  const { progress: xpProgress } = getXpForNextLevel(progress.xp);
  const today = todayStr();
  const isTodayDone = progress.lastActivityDate === today && progress.dailyGoalComplete;

  // Count due flashcards
  const dueCount = Object.values(progress.flashcards).filter(
    (f) => f.nextReviewDate <= today,
  ).length;

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

      {/* Due Today flashcard queue */}
      {dueCount > 0 && (
        <Link
          to="/practice/due-today"
          className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 hover:shadow-md transition-all group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {dueCount} {dueCount === 1 ? 'card' : 'cards'} due for review
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Review now to keep your memory fresh
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Stories quick-access */}
      <Link
        to="/stories"
        className="flex items-center gap-3 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 hover:shadow-md transition-all group"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800/30 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            📖 Read Stories
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Object.values(progress.stories).filter((s) => s.status === 'completed').length} of {storiesData.stories.length} stories read — practice Czech through narratives
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
      </Link>

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
