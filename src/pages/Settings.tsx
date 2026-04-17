import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Target, Save, Crown, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { targets, updateTargets } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [localTargets, setLocalTargets] = useState(targets);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setLocalTargets(targets);
  }, [targets]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateTargets(localTargets);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalTargets(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setSubscribing(true);
    try {
      const res = await fetch('/api/create-paymob-iframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid, 
          email: user.email,
          displayName: user.displayName,
          plan: 'vip_monthly' 
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to payment server');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('settings')}</h1>
        <p className="text-gray-500 mt-1">{t('settingsSubtitle')}</p>
      </header>

      {searchParams.get('success') && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
          <Crown className="text-emerald-500" />
          <p className="font-medium">{t('subscribeSuccess')}</p>
        </div>
      )}
      
      {searchParams.get('canceled') && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl">
          <p className="font-medium">{t('subscribeCanceled')}</p>
        </div>
      )}

      {/* Subscription Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-6 md:p-8 shadow-sm border border-amber-200/60"
      >
        <div className="flex items-start justify-between flex-col md:flex-row gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100/50 rounded-xl text-amber-600">
                <Crown size={24} />
              </div>
              <h2 className="text-xl font-bold text-amber-900">{t('proPlan')}</h2>
            </div>
            <p className="text-amber-700/80 mt-2">{t('proPlanDesc')}</p>
          </div>
          {user?.email === 'pt.mohie@gmail.com' ? (
             <div className="px-6 py-3 bg-amber-500/20 text-amber-800 rounded-xl font-bold flex items-center gap-2">
               <Crown size={18} />
               Lifetime Access (Admin)
             </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="flex-shrink-0 flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {subscribing ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
              {subscribing ? t('subscribing') : t('subscribeNow')}
            </button>
          )}
        </div>
      </motion.div>

      {/* Targets Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{t('settings')}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
              {t('dailyCalorieGoal')} ({t('kcal')})
            </label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={localTargets.calories}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-medium"
              required
              min="500"
              max="10000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-2">
                {t('proteinTarget')} ({t('g')})
              </label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={localTargets.protein}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-2">
                {t('carbsTarget')} ({t('g')})
              </label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={localTargets.carbs}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-2">
                {t('fatTarget')} ({t('g')})
              </label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={localTargets.fat}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                required
                min="0"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            {saved && <span className="text-emerald-600 text-sm font-medium">{t('settingsSaved')}</span>}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
