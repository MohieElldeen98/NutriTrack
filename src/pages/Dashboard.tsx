import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MacroProgress } from '../components/MacroProgress';
import { FoodList } from '../components/FoodList';
import { AddFoodModal } from '../components/AddFoodModal';
import { SuggestionsModal } from '../components/SuggestionsModal';
import { Plus, Sparkles, Crown, User as UserIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user, targets, todayRecord, removeFood, isVIP } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const totals = todayRecord?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  const macroData = [
    { name: t('protein'), value: totals.protein * 4, color: '#10b981' }, // emerald-500
    { name: t('carbs'), value: totals.carbs * 4, color: '#3b82f6' }, // blue-500
    { name: t('fat'), value: totals.fat * 9, color: '#f59e0b' }, // amber-500
  ].filter(d => d.value > 0);

  // If no macros, show empty gray circle
  if (macroData.length === 0) {
    macroData.push({ name: t('empty'), value: 1, color: '#f3f4f6' });
  }

  const handleSuggestClick = () => {
    if (isVIP) {
      setIsSuggestModalOpen(true);
    } else {
      navigate('/app/settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized VIP Greeting Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/app/profile" className="hidden md:flex shrink-0">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center overflow-hidden shadow-sm hover:ring-4 ring-emerald-50 transition-all hover:scale-105">
              {user?.photoData ? (
                <img src={user.photoData} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={28} className="text-emerald-300" />
              )}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t('today')}
              </h1>
              {user?.firstName && (
                <span className="text-2xl font-medium text-emerald-600">
                  , {user.firstName} 👋
                </span>
              )}
            </div>
            <p className="text-gray-500">{t('trackSubtitle')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSuggestClick}
            className={`hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
               isVIP ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
            }`}
          >
            {isVIP ? <Sparkles size={18} /> : <Crown size={18} />}
            {t('suggest')}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            {t('addFood')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">{Math.round(totals.calories)}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">{t('kcal')}</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-medium">{t('caloriesRemaining')}</span>
                  <span className="font-bold text-gray-900">{Math.max(0, targets.calories - totals.calories)} {t('kcal')}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totals.calories / targets.calories) * 100)}%` }}
                    className="h-full bg-gray-900 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <MacroProgress label={t('protein')} consumed={totals.protein} target={targets.protein} color="emerald" unit={t('g')} />
                <MacroProgress label={t('carbs')} consumed={totals.carbs} target={targets.carbs} color="blue" unit={t('g')} />
                <MacroProgress label={t('fat')} consumed={totals.fat} target={targets.fat} color="amber" unit={t('g')} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Food List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('foodLog')}</h3>
            <button
              onClick={handleSuggestClick}
              className={`md:hidden p-2 rounded-lg ${isVIP ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}
            >
              {isVIP ? <Sparkles size={18} /> : <Crown size={18} />}
            </button>
          </div>
          <FoodList foods={todayRecord?.foods || []} onRemove={removeFood} currentDate={todayRecord?.date} />
        </motion.div>
      </div>

      <AddFoodModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <SuggestionsModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />
    </div>
  );
};
