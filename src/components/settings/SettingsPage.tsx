import { useProgress } from '@/context/ProgressContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Volume2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { getLevel, getXpForNextLevel } from '@/types/gamification';

export default function SettingsPage() {
  const { progress, dispatch } = useProgress();
  const { dark, toggle } = useTheme();
  const level = getLevel(progress.xp);
  const { progress: xpProgress } = getXpForNextLevel(progress.xp);

  const updateSetting = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: value } });
    if (key === 'darkMode') {
      toggle();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
            Č
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Czech Learner</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Level {level} · {progress.xp} XP</p>
            <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
        {/* Audio speed */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Audio Speed</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Default playback rate</p>
            </div>
          </div>
          <select
            value={progress.settings.audioSpeed}
            onChange={(e) => updateSetting('audioSpeed', parseFloat(e.target.value))}
            className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300"
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
          </select>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Toggle theme</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('darkMode', !progress.settings.darkMode)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              dark ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                dark ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        {/* Transliteration */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {progress.settings.showTransliteration ? (
              <Eye className="w-5 h-5 text-gray-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Pronunciation Hints</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Show transliteration guides</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('showTransliteration', !progress.settings.showTransliteration)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              progress.settings.showTransliteration ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                progress.settings.showTransliteration ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* GitHub Sync */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <ExternalLink className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">GitHub Sync</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Save progress across devices</p>
          </div>
        </div>
        {progress.githubConnected ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Connected · Last synced: {progress.lastSyncedAt || 'Never'}
          </div>
        ) : (
          <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Connect GitHub Account
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4">
        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Reset Progress</p>
        <p className="text-xs text-red-500 dark:text-red-400 mb-3">
          This will erase all your progress, XP, and streaks. This cannot be undone.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all progress?')) {
              localStorage.removeItem('cz-learning-progress');
              window.location.reload();
            }
          }}
          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Reset Everything
        </button>
      </div>
    </div>
  );
}
