import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Target, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { targets, updateTargets } = useData();
  const { t } = useLanguage();
  const [localTargets, setLocalTargets] = useState(targets);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('settings')}</h1>
        <p className="text-gray-500 mt-1">{t('settingsSubtitle')}</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
