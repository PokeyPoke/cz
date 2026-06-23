import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle2, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULE_LIST } from '@/lib/constants';
import { useProgress } from '@/context/ProgressContext';
import { getDifficultyColor } from '@/hooks/useStoryProgress';
import storiesData from '@/data/stories.json';
import type { Story } from '@/types/story';

const stories: Story[] = storiesData.stories as Story[];

export default function StoriesPage() {
  const { progress } = useProgress();
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredStories = useMemo(() => {
    if (moduleFilter === 'all') return stories;
    return stories.filter((s) => s.moduleId === moduleFilter);
  }, [moduleFilter]);

  const totalStories = stories.length;
  const completedCount = Object.values(progress.stories).filter(
    (s) => s.status === 'completed',
  ).length;

  // Get module titles for filter labels
  const moduleLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const mod of MODULE_LIST) {
      map[mod.id] = mod.title;
    }
    return map;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📖 Stories
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Learn by reading — click words to see definitions, tap 🔊 to hear
          pronunciation
        </p>
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-full px-3 py-1">
            <BookOpen className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {completedCount}/{totalStories} read
            </span>
          </div>
        </div>
      </div>

      {/* Module filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <button
          onClick={() => setModuleFilter('all')}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            moduleFilter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
          )}
        >
          All Stories
        </button>
        {MODULE_LIST.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setModuleFilter(mod.id)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              moduleFilter === mod.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
            )}
          >
            {mod.title}
          </button>
        ))}
      </div>

      {/* Story grid */}
      <div className="grid gap-3">
        {filteredStories.map((story) => {
          const storyProgress = progress.stories[story.id];
          const isCompleted = storyProgress?.status === 'completed';
          const difficulty = getDifficultyColor(story.difficulty);
          const moduleName = moduleLabels[story.moduleId] || story.moduleId;

          return (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className={cn(
                'block p-4 rounded-2xl border transition-all hover:shadow-md',
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700',
              )}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {story.title}
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {story.titleEn}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {story.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Difficulty badge */}
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                        difficulty.bg,
                        difficulty.text,
                      )}
                    >
                      {difficulty.label}
                    </span>

                    {/* Time */}
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      {story.estimatedMinutes} min
                    </span>

                    {/* Word count */}
                    <span className="text-[10px] text-gray-400">
                      {story.estimatedWords} words
                    </span>

                    {/* Module */}
                    <span className="text-[10px] text-gray-400">
                      Module: {moduleName}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            No stories found for this module.
          </p>
        </div>
      )}
    </div>
  );
}
