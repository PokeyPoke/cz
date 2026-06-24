import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { STORAGE_KEY, XP_REWARDS } from '@/lib/constants';
import { todayStr } from '@/lib/utils';
import type { UserProgress, ModuleProgress } from '@/types/progress';

// -- Default State --
function getDefaultProgress(): UserProgress {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    xp: 0,
    level: 1,
    streakStart: null,
    lastActivityDate: todayStr(),
    dailyGoalComplete: false,
    currentModuleId: null,
    currentLessonId: null,
    modules: {},
    lessons: {},
    stories: {},
    ebooks: {},
    flashcards: {},
    badges: [],
    settings: {
      audioSpeed: 1,
      darkMode: false,
      showTransliteration: true,
      dailyGoalMinutes: 10,
      notifications: false,
    },
  };
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultProgress(), ...JSON.parse(raw) };
  } catch {}
  return getDefaultProgress();
}

function saveProgress(p: UserProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, lastUpdated: new Date().toISOString() }));
}

// -- Actions --
type ProgressAction =
  | { type: 'LOAD'; progress: UserProgress }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'COMPLETE_STEP'; lessonId: string; moduleId: string; stepIndex: number }
  | { type: 'COMPLETE_LESSON'; lessonId: string; moduleId: string; score: number }
  | { type: 'COMPLETE_MODULE'; moduleId: string }
  | { type: 'SET_CURRENT'; moduleId: string | null; lessonId: string | null }
  | { type: 'DAILY_LOGIN' }
  | { type: 'DAILY_GOAL_COMPLETE' }
  | { type: 'START_STORY'; storyId: string }
  | { type: 'COMPLETE_STORY'; storyId: string; comprehensionScore: number }
  | { type: 'ADD_EBOOK'; bookId: string; title: string; wordCount: number }
  | { type: 'UPDATE_EBOOK_PROGRESS'; bookId: string; progressPercent: number }
  | { type: 'COMPLETE_EBOOK'; bookId: string; wordCount: number }
  | { type: 'DELETE_EBOOK'; bookId: string }
  | { type: 'UPDATE_FLASHCARD'; cardId: string; moduleId: string; quality: number }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserProgress['settings']> }
  | { type: 'SYNC_FROM_REMOTE'; progress: UserProgress };

function reducer(state: UserProgress, action: ProgressAction): UserProgress {
  switch (action.type) {
    case 'LOAD':
      return action.progress;
    case 'ADD_XP':
      return { ...state, xp: state.xp + action.amount };
    case 'COMPLETE_STEP': {
      const lesson = state.lessons[action.lessonId] || {
        lessonId: action.lessonId,
        moduleId: action.moduleId,
        status: 'available' as const,
        completedSteps: 0,
        totalSteps: 6,
        score: 0,
        attempts: 0,
        completedAt: null,
        xpEarned: 0,
      };
      const newCompletedSteps = Math.max(lesson.completedSteps, action.stepIndex + 1);
      return {
        ...state,
        currentModuleId: action.moduleId,
        currentLessonId: action.lessonId,
        xp: state.xp + XP_REWARDS.stepComplete,
        lessons: {
          ...state.lessons,
          [action.lessonId]: {
            ...lesson,
            status: 'in_progress',
            completedSteps: newCompletedSteps,
            xpEarned: lesson.xpEarned + XP_REWARDS.stepComplete,
          },
        },
      };
    }
    case 'COMPLETE_LESSON': {
      const lesson = state.lessons[action.lessonId];
      const bonus = action.score === 100 ? XP_REWARDS.fillBlanksPerfect : 0;
      return {
        ...state,
        xp: state.xp + XP_REWARDS.lessonComplete + bonus,
        lessons: {
          ...state.lessons,
          [action.lessonId]: {
            ...(lesson || { lessonId: action.lessonId, moduleId: action.moduleId, completedSteps: 6, totalSteps: 6, xpEarned: 0 }),
            status: 'completed',
            completedSteps: 6,
            score: action.score,
            attempts: (lesson?.attempts ?? 0) + 1,
            completedAt: new Date().toISOString(),
            xpEarned: (lesson?.xpEarned ?? 0) + XP_REWARDS.lessonComplete + bonus,
          },
        },
      };
    }
    case 'COMPLETE_MODULE': {
      const mod = state.modules[action.moduleId] || {
        moduleId: action.moduleId,
        status: 'available' as const,
        completedLessons: 0,
        startedAt: null,
        completedAt: null,
        lastLessonId: null,
      };
      return {
        ...state,
        xp: state.xp + XP_REWARDS.moduleComplete,
        modules: {
          ...state.modules,
          [action.moduleId]: {
            ...mod,
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
        },
      };
    }
    case 'SET_CURRENT':
      return {
        ...state,
        currentModuleId: action.moduleId,
        currentLessonId: action.lessonId,
      };
    case 'DAILY_LOGIN': {
      const today = todayStr();
      if (state.lastActivityDate === today) return state;
      return {
        ...state,
        lastActivityDate: today,
        dailyGoalComplete: false,
        xp: state.xp + XP_REWARDS.dailyLogin,
      };
    }
    case 'DAILY_GOAL_COMPLETE':
      return {
        ...state,
        dailyGoalComplete: true,
        xp: state.xp + XP_REWARDS.dailyGoalMet,
      };
    case 'START_STORY': {
      const story = state.stories[action.storyId];
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.storyId]: {
            storyId: action.storyId,
            status: 'reading' as const,
            lastReadAt: new Date().toISOString(),
            comprehensionScore: story?.comprehensionScore ?? 0,
            readCount: (story?.readCount ?? 0) + 1,
          },
        },
      };
    }
    case 'COMPLETE_STORY': {
      const story = state.stories[action.storyId];
      const comprehensionBonus = action.comprehensionScore >= 80 ? XP_REWARDS.storyComprehensionBonus : 0;
      const totalXp = XP_REWARDS.storyComplete + comprehensionBonus;
      return {
        ...state,
        xp: state.xp + totalXp,
        stories: {
          ...state.stories,
          [action.storyId]: {
            storyId: action.storyId,
            status: 'completed' as const,
            lastReadAt: new Date().toISOString(),
            comprehensionScore: Math.max(story?.comprehensionScore ?? 0, action.comprehensionScore),
            readCount: story?.readCount ?? 1,
          },
        },
      };
    }
    case 'ADD_EBOOK':
      return {
        ...state,
        ebooks: {
          ...state.ebooks,
          [action.bookId]: {
            bookId: action.bookId,
            title: action.title,
            progressPercent: 0,
            currentWordIndex: 0,
            wordsRead: 0,
            lastReadAt: new Date().toISOString(),
            completed: false,
            completedAt: null,
          },
        },
      };
    case 'UPDATE_EBOOK_PROGRESS': {
      const ebook = state.ebooks[action.bookId];
      return {
        ...state,
        ebooks: {
          ...state.ebooks,
          [action.bookId]: {
            bookId: action.bookId,
            title: ebook?.title ?? '',
            progressPercent: action.progressPercent,
            currentWordIndex: ebook?.currentWordIndex ?? 0,
            wordsRead: ebook?.wordsRead ?? 0,
            lastReadAt: new Date().toISOString(),
            completed: action.progressPercent >= 100,
            completedAt: action.progressPercent >= 100 ? new Date().toISOString() : ebook?.completedAt ?? null,
          },
        },
      };
    }
    case 'COMPLETE_EBOOK': {
      const ebook = state.ebooks[action.bookId];
      return {
        ...state,
        xp: state.xp + XP_REWARDS.ebookComplete,
        ebooks: {
          ...state.ebooks,
          [action.bookId]: {
            bookId: action.bookId,
            title: ebook?.title ?? '',
            progressPercent: 100,
            currentWordIndex: ebook?.currentWordIndex ?? 0,
            wordsRead: action.wordCount,
            lastReadAt: new Date().toISOString(),
            completed: true,
            completedAt: new Date().toISOString(),
          },
        },
      };
    }
    case 'DELETE_EBOOK': {
      const { [action.bookId]: _, ...restEbooks } = state.ebooks;
      return { ...state, ebooks: restEbooks };
    }
    case 'UPDATE_FLASHCARD': {
      const card = state.flashcards[action.cardId];
      let easeFactor = 2.5;
      let interval = 1;
      let repetitions = 0;
      if (card) {
        easeFactor = card.easeFactor;
        interval = card.interval;
        repetitions = card.repetitions;
      }
      // SM-2 algorithm
      if (action.quality >= 3) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions += 1;
      } else {
        repetitions = 0;
        interval = 1;
      }
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - action.quality) * (0.08 + (5 - action.quality) * 0.02)));
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);
      return {
        ...state,
        flashcards: {
          ...state.flashcards,
          [action.cardId]: {
            cardId: action.cardId,
            moduleId: action.moduleId,
            easeFactor,
            interval,
            repetitions,
            nextReviewDate: nextDate.toISOString().split('T')[0],
            lastReviewDate: todayStr(),
          },
        },
      };
    }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    case 'SYNC_FROM_REMOTE':
      return { ...action.progress, lastUpdated: new Date().toISOString() };
    default:
      return state;
  }
}

// -- Context --
interface ProgressContextType {
  progress: UserProgress;
  dispatch: React.Dispatch<ProgressAction>;
  completeStep: (lessonId: string, moduleId: string, stepIndex: number) => void;
  completeLesson: (lessonId: string, moduleId: string, score: number) => void;
  isStepCompleted: (lessonId: string, stepIndex: number) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string) => ModuleProgress | null;
  startStory: (storyId: string) => void;
  completeStory: (storyId: string, comprehensionScore: number) => void;
  getStoryProgress: (storyId: string) => import('@/types/progress').StoryProgressState | null;
  isStoryCompleted: (storyId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(reducer, null, loadProgress);

  // Persist on every change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => saveProgress(progress), 500);
    return () => clearTimeout(timer);
  }, [progress]);

  // Check for SPA redirect from 404.html
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      const url = new URL(redirect, window.location.origin);
      if (url.pathname.startsWith('/cz/')) {
        const newPath = url.pathname.replace('/cz', '') + url.search + url.hash;
        window.history.replaceState(null, '', newPath || '/');
      }
    }
  }, []);

  // Daily login check
  useEffect(() => {
    const today = todayStr();
    if (progress.lastActivityDate !== today) {
      dispatch({ type: 'DAILY_LOGIN' });
      // Load theme setting
      document.documentElement.classList.toggle('dark', progress.settings.darkMode);
    }
  }, []);

  const completeStep = useCallback((lessonId: string, moduleId: string, stepIndex: number) => {
    dispatch({ type: 'COMPLETE_STEP', lessonId, moduleId, stepIndex });
  }, []);

  const completeLesson = useCallback((lessonId: string, moduleId: string, score: number) => {
    dispatch({ type: 'COMPLETE_LESSON', lessonId, moduleId, score });
  }, []);

  const isStepCompleted = useCallback(
    (lessonId: string, stepIndex: number) => {
      const lesson = progress.lessons[lessonId];
      if (!lesson) return false;
      return lesson.completedSteps > stepIndex;
    },
    [progress.lessons],
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return progress.lessons[lessonId]?.status === 'completed';
    },
    [progress.lessons],
  );

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      return progress.modules[moduleId] || null;
    },
    [progress.modules],
  );

  const startStory = useCallback((storyId: string) => {
    dispatch({ type: 'START_STORY', storyId });
  }, []);

  const completeStory = useCallback((storyId: string, comprehensionScore: number) => {
    dispatch({ type: 'COMPLETE_STORY', storyId, comprehensionScore });
  }, []);

  const getStoryProgress = useCallback(
    (storyId: string) => {
      return progress.stories[storyId] || null;
    },
    [progress.stories],
  );

  const isStoryCompleted = useCallback(
    (storyId: string) => {
      return progress.stories[storyId]?.status === 'completed';
    },
    [progress.stories],
  );

  return (
    <ProgressContext.Provider
      value={{
        progress,
        dispatch,
        completeStep,
        completeLesson,
        isStepCompleted,
        isLessonCompleted,
        getModuleProgress,
        startStory,
        completeStory,
        getStoryProgress,
        isStoryCompleted,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
