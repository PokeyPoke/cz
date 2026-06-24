export interface Achievement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'mastery' | 'social';
  condition: AchievementCondition;
  xpReward: number;
  hidden?: boolean;
}

export type AchievementCondition =
  | { type: 'complete_lessons'; count: number }
  | { type: 'streak_days'; count: number }
  | { type: 'total_xp'; amount: number }
  | { type: 'complete_module'; moduleId: string }
  | { type: 'perfect_lesson'; count: number }
  | { type: 'total_practice_time'; minutes: number }
  | { type: 'complete_all_stories'; count: number }
  | { type: 'total_story_reads'; count: number }
  | { type: 'high_comprehension_count'; count: number }
  | { type: 'complete_all_ebooks'; count: number }
  | { type: 'total_ebook_words'; count: number };

export const LEVEL_THRESHOLDS: number[] = [
  0,
  100,
  250,
  500,
  1000,
  1750,
  2750,
  4000,
  5500,
  7500,
  10000,
  13000,
  16500,
  20500,
  25000,
];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getXpForNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
  const nextThreshold = level < LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[level]
    : currentThreshold + 2500;
  const progress = Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  return { current: xp - currentThreshold, next: nextThreshold - currentThreshold, progress };
}
