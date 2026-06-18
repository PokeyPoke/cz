import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import MobileNav from './MobileNav';

export default function RootLayout() {
  const location = useLocation();
  const showNav = !location.pathname.includes('/lesson/');

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 pb-20 safe-bottom">
        <Outlet />
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
