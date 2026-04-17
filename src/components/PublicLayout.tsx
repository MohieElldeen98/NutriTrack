import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, HeartPulse } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const PublicLayout: React.FC = () => {
  const { t, toggleLang, lang } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2">
          <HeartPulse className="text-emerald-600" size={28} />
          <h1 className="text-xl md:text-2xl font-bold text-emerald-600 tracking-tight">NutriTrack</h1>
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">{t('home')}</Link>
            <Link to="/pricing" className="hover:text-emerald-600 transition-colors">{t('pricing')}</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              <Globe size={18} />
              <span className="hidden md:inline">{t('language')}</span>
            </button>
            {user ? (
              <Link to="/app" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                {t('dashboard')}
              </Link>
            ) : (
              <Link to="/login" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                 {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-emerald-500" size={18} />
            <span>{t('copyright')}</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <Link to="/terms" className="hover:text-emerald-600 transition-colors">{t('terms')}</Link>
            <Link to="/privacy" className="hover:text-emerald-600 transition-colors">{t('privacy')}</Link>
            <Link to="/refund-policy" className="hover:text-emerald-600 transition-colors">{t('refundPolicy')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
