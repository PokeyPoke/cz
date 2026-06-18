import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { ACHIEVEMENTS } from '@/lib/constants';
import { todayStr } from '@/lib/utils';
import { useProgress } from './ProgressContext';
import type { Achievement } from '@/types/gamification';

interface GamificationContextType {
  streak: number;
  newlyUnlocked: Achievement[];
  dismissNewUnlock: (id: string) => void;
  checkAchievements: () => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { progress, dispatch } = useProgress();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Calculate streak from progress
  const streak = (() => {
    if (!progress.streakStart) {
      const today = todayStr();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (progress.lastActivityDate === today || progress.lastActivityDate === yesterdayStr) {
        if (progress.lastActivityDate === yesterdayStr) {
          // Started yesterday
          dispatch({ type: 'DAILY_LOGIN' });
        }
        return progress.lastActivityDate === today ? 1 : 0;
      }
      return 0;
    }
    const start = new Date(progress.streakStart);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff + 1);
  })();

  const checkAchievements = useCallback((): Achievement[] => {
    const unlocked: Achievement[] = [];
    for (const achievement of ACHIEVEMENTS) {
      if (progress.badges.includes(achievement.id)) continue;
      const c = achievement.condition;
      let met = false;
      switch (c.type) {
        case 'complete_lessons': {
          const completed = Object.values(progress.lessons).filter((l) => l.status === 'completed').length;
          met = completed >= c.count;
          break;
        }
        case 'streak_days':
          met = streak >= c.count;
          break;
        case 'total_xp':
          met = progress.xp >= c.amount;
          break;
        case 'complete_module':
          met = progress.modules[c.moduleId]?.status === 'completed';
          break;
        case 'perfect_lesson': {
          const perfect = Object.values(progress.lessons).filter((l) => l.score === 100).length;
          met = perfect >= c.count;
          break;
        }
        case 'total_practice_time':
          met = false; // Not tracking time yet
          break;
      }
      if (met) {
        unlocked.push(achievement);
        dispatch({ type: 'ADD_XP', amount: achievement.xpReward });
        // Add badge to progress
        progress.badges.push(achievement.id);
      }
    }
    if (unlocked.length > 0) {
      setNewlyUnlocked((prev) => [...prev, ...unlocked]);
    }
    return unlocked;
  }, [progress, streak, dispatch]);

  // Check achievements on progress change
  useEffect(() => {
    checkAchievements();
  }, [progress.xp, progress.lessons, progress.modules]);

  const dismissNewUnlock = useCallback((id: string) => {
    setNewlyUnlocked((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getUnlockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter((a) => progress.badges.includes(a.id));
  }, [progress.badges]);

  const getLockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter((a) => !progress.badges.includes(a.id));
  }, [progress.badges]);

  return (
    <GamificationContext.Provider
      value={{ streak, newlyUnlocked, dismissNewUnlock, checkAchievements, getUnlockedAchievements, getLockedAchievements }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
