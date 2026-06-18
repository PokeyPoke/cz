import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Trophy, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Learn' },
  { to: '/practice/flashcards', icon: BookOpen, label: 'Practice' },
  { to: '/achievements', icon: Trophy, label: 'Badges' },
  { to: '/settings', icon: User, label: 'You' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-500 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
