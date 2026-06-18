import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/components/home/HomePage';
import ModulePage from '@/components/module/ModulePage';
import LessonPage from '@/components/lesson/LessonPage';
import FlashcardsPage from '@/components/practice/FlashcardsPage';
import QuizPage from '@/components/practice/QuizPage';
import AchievementsPage from '@/components/achievements/AchievementsPage';
import LeaderboardPage from '@/components/achievements/LeaderboardPage';
import SettingsPage from '@/components/settings/SettingsPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'module/:moduleId', element: <ModulePage /> },
        { path: 'module/:moduleId/lesson/:lessonId', element: <LessonPage /> },
        { path: 'practice/flashcards', element: <FlashcardsPage /> },
        { path: 'practice/quiz', element: <QuizPage /> },
        { path: 'achievements', element: <AchievementsPage /> },
        { path: 'leaderboard', element: <LeaderboardPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
  { basename: '/cz' },
);
