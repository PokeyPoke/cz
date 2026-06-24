export interface StoryProgressState {
  storyId: string;
  status: 'available' | 'reading' | 'completed';
  lastReadAt: string | null;
  comprehensionScore: number;
  readCount: number;
}

export interface UserProgress {
  version: number;
  lastUpdated: string;
  xp: number;
  level: number;
  streakStart: string | null;
  lastActivityDate: string;
  dailyGoalComplete: boolean;
  currentModuleId: string | null;
  currentLessonId: string | null;
  modules: Record<string, ModuleProgress>;
  lessons: Record<string, LessonProgress>;
  stories: Record<string, StoryProgressState>;
  ebooks: Record<string, EbookProgressState>;
  flashcards: Record<string, FlashcardReviewState>;
  badges: string[];
  settings: UserSettings;
  githubConnected?: boolean;
  lastSyncedAt?: string;
}

import type { EbookProgressState } from './ebook';

export type { EbookProgressState };
export interface ModuleProgress {
  moduleId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completedLessons: number;
  startedAt: string | null;
  completedAt: string | null;
  lastLessonId: string | null;
}

export interface LessonProgress {
  lessonId: string;
  moduleId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completedSteps: number;
  totalSteps: number;
  score: number;
  attempts: number;
  completedAt: string | null;
  xpEarned: number;
}

export interface FlashcardReviewState {
  cardId: string;
  moduleId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate: string | null;
}

export interface UserSettings {
  audioSpeed: number;
  darkMode: boolean;
  showTransliteration: boolean;
  dailyGoalMinutes: number;
  notifications: boolean;
}
