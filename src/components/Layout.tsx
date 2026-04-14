import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutDashboard, History, Settings, LogOut, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const { t, toggleLang, lang } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/history', icon: History, label: t('history') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col md:flex-row" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-emerald-600">NutriTrack</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleLang} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <Globe size={18} />
            {t('language')}
          </button>
          <button onClick={logout} className="text-gray-500 hover:text-gray-700">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-e border-gray-200 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-600">NutriTrack</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-colors",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-emerald-600" : "text-gray-400", lang === 'ar' ? "ms-3" : "me-3")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={toggleLang}
            className="flex items-center space-x-3 space-x-reverse px-4 py-3 w-full text-start text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
          >
            <Globe size={20} className={cn("text-gray-400", lang === 'ar' ? "ms-3" : "me-3")} />
            <span>{t('language')}</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 space-x-reverse px-4 py-3 w-full text-start text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
          >
            <LogOut size={20} className={cn("text-gray-400", lang === 'ar' ? "ms-3" : "me-3")} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-10 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                isActive ? "text-emerald-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon size={24} className={isActive ? "text-emerald-600" : "text-gray-400"} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
