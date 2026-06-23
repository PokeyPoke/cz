import { useCallback, useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import type { Story } from '@/types/story';

export function useStoryProgress(storyId: string) {
  const { startStory, completeStory, getStoryProgress, isStoryCompleted } =
    useProgress();

  const storyProgress = getStoryProgress(storyId);
  const completed = isStoryCompleted(storyId);

  const handleStartReading = useCallback(() => {
    if (!storyProgress || storyProgress.status === 'available') {
      startStory(storyId);
    }
  }, [storyId, storyProgress, startStory]);

  const handleCompleteReading = useCallback(
    (comprehensionScore: number) => {
      completeStory(storyId, comprehensionScore);
    },
    [storyId, completeStory],
  );

  return {
    storyProgress,
    completed,
    handleStartReading,
    handleCompleteReading,
  };
}

/**
 * Get all story IDs that have been completed.
 */
export function useCompletedStoryIds(): Set<string> {
  const { progress } = useProgress();
  return useMemo(() => {
    const completed = new Set<string>();
    for (const [id, sp] of Object.entries(progress.stories)) {
      if (sp.status === 'completed') completed.add(id);
    }
    return completed;
  }, [progress.stories]);
}

/**
 * Get filtered stories based on module filter.
 */
export function useFilteredStories(
  stories: Story[],
  moduleFilter: string | null,
): Story[] {
  return useMemo(() => {
    if (moduleFilter && moduleFilter !== 'all') {
      return stories.filter((s) => s.moduleId === moduleFilter);
    }
    return stories;
  }, [stories, moduleFilter]);
}

/**
 * Get the difficulty color for a story.
 */
export function getDifficultyColor(difficulty: Story['difficulty']): {
  bg: string;
  text: string;
  label: string;
} {
  switch (difficulty) {
    case 'beginner':
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: '🟢 Beginner' };
    case 'elementary':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: '🟡 Elementary' };
    case 'intermediate':
      return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: '🟠 Intermediate' };
    case 'upper-intermediate':
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: '🔴 Upper Intermediate' };
  }
}
