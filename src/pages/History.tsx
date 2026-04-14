import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { format, subDays } from 'date-fns';
import { FoodList } from '../components/FoodList';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DailyRecord } from '../types';

export const History: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const { getRecordForDate, targets, removeFood } = useData();
  const { t, lang } = useLanguage();

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await getRecordForDate(dateStr);
      setRecord(data);
      setLoading(false);
    };
    fetchRecord();
  }, [selectedDate, getRecordForDate]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('historyTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('historySubtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100" dir="ltr">
          <button onClick={handlePrevDay} className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 font-medium text-gray-900 min-w-[120px] justify-center">
            <Calendar size={16} className="text-emerald-500" />
            {isToday ? t('today') : format(selectedDate, 'MMM d, yyyy')}
          </div>
          <button 
            onClick={handleNextDay} 
            disabled={isToday}
            className="p-1 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : record ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={format(selectedDate, 'yyyy-MM-dd')}
          className="space-y-6"
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-500 font-medium mb-1">{t('caloriesRemaining').split(' ')[0]}</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(record.totals.calories)}</p>
              <p className="text-xs text-gray-400 mt-1">/ {targets.calories} {t('kcal')}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <p className="text-sm text-emerald-600 font-medium mb-1">{t('protein')}</p>
              <p className="text-2xl font-bold text-emerald-900">{Math.round(record.totals.protein)}{t('g')}</p>
              <p className="text-xs text-emerald-600/70 mt-1">/ {targets.protein}{t('g')}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl">
              <p className="text-sm text-blue-600 font-medium mb-1">{t('carbs')}</p>
              <p className="text-2xl font-bold text-blue-900">{Math.round(record.totals.carbs)}{t('g')}</p>
              <p className="text-xs text-blue-600/70 mt-1">/ {targets.carbs}{t('g')}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl">
              <p className="text-sm text-amber-600 font-medium mb-1">{t('fat')}</p>
              <p className="text-2xl font-bold text-amber-900">{Math.round(record.totals.fat)}{t('g')}</p>
              <p className="text-xs text-amber-600/70 mt-1">/ {targets.fat}{t('g')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('foodLog')}</h3>
            <FoodList foods={record.foods} currentDate={record.date} onRemove={(id) => removeFood(id, record.date)} />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">{t('noRecords')}</h3>
          <p className="text-gray-500 mt-1">{t('noRecordsDesc')}</p>
        </motion.div>
      )}
    </div>
  );
};
