import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutDashboard, History as HistoryIcon, Settings, LogOut, Globe, Activity, ShieldAlert, UserCircle, Scale } from 'lucide-react';
import { cn } from '../lib/utils';
import { InstallPWA } from './InstallPWA';

export const Layout: React.FC = () => {
  const { logout, user: authUser } = useAuth();
  const { user } = useData();
  const { t, toggleLang, lang } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/app', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/app/history', icon: HistoryIcon, label: t('history') },
    { path: '/app/analytics', icon: Activity, label: t('analytics') },
    { path: '/app/progress', icon: Scale, label: t('progress') },
    { path: '/app/settings', icon: Settings, label: t('settings') },
  ];

  if (authUser?.email === 'pt.mohie@gmail.com') {
    navItems.push({ path: '/app/admin', icon: ShieldAlert, label: t('adminPanel') });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col md:flex-row" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {user?.photoData ? (
            <Link to="/app/profile">
              <img src={user.photoData} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100" />
            </Link>
          ) : (
            <h1 className="text-xl font-semibold text-emerald-600">NutriTrack</h1>
          )}
        </div>
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
        <div className="p-6 pb-2 border-b border-gray-100 flex flex-col items-center text-center">
          <Link to="/app/profile" className="relative group block cursor-pointer mb-3">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              {user?.photoData ? (
                <img src={user.photoData} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={40} className="text-emerald-300" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-white text-xs font-medium">Edit</span>
            </div>
          </Link>
          <Link to="/app/profile">
            <h2 className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : t('profile')}
            </h2>
          </Link>
          <span className={cn(
            "inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            (user?.plan === 'vip' || user?.plan === 'vip_monthly') ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
          )}>
            {(user?.plan === 'vip' || user?.plan === 'vip_monthly') ? 'VIP' : 'Free Plan'}
          </span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
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
          <div className="pt-2">
            <InstallPWA />
          </div>
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
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8 flex flex-col min-h-screen">
        <div className="md:hidden mb-4">
          <InstallPWA />
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-12 py-6 text-center text-sm text-gray-400 border-t border-gray-200/60">
          {t('copyright')}
        </footer>
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
