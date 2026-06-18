import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { GamificationProvider } from './context/GamificationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ProgressProvider>
        <GamificationProvider>
          <RouterProvider router={router} />
        </GamificationProvider>
      </ProgressProvider>
    </ThemeProvider>
  </StrictMode>,
);
