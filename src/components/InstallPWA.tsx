import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstructions(true);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      <div className="px-4 mt-4">
        <button
          onClick={handleInstall}
          className="flex items-center gap-3 px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-colors w-full justify-center"
        >
          <Download size={20} />
          {t('installApp')}
        </button>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('installApp')}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t('installInstructions')}
            </p>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
