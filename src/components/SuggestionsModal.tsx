import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, Plus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { targets, todayRecord, addFood } = useData();
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      generateSuggestions();
    }
  }, [isOpen]);

  const generateSuggestions = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    const remainingCalories = Math.max(0, targets.calories - (todayRecord?.totals.calories || 0));
    const remainingProtein = Math.max(0, targets.protein - (todayRecord?.totals.protein || 0));
    const remainingCarbs = Math.max(0, targets.carbs - (todayRecord?.totals.carbs || 0));
    const remainingFat = Math.max(0, targets.fat - (todayRecord?.totals.fat || 0));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I need food suggestions to hit my daily macros.
        Remaining Targets:
        Calories: ${remainingCalories} kcal
        Protein: ${remainingProtein}g
        Carbs: ${remainingCarbs}g
        Fat: ${remainingFat}g

        Suggest 3 different single food items or simple meals that would help me get closer to these targets without going over too much.
        
        IMPORTANT: The "name" and "description" fields in the JSON response MUST be in ${lang === 'ar' ? 'Arabic (Egyptian dialect preferred)' : 'English'}.
        
        Return ONLY a JSON array of objects with this structure, no markdown formatting:
        [
          {
            "name": "Food name (e.g., ${lang === 'ar' ? 'سلطة فراخ مشوية' : 'Grilled Chicken Salad'})",
            "description": "Brief reason why it fits",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        ]`,
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);
      setSuggestions(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not generate suggestions. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (food: any) => {
    await addFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-emerald-500" size={20} />
                {t('smartSuggestions')}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Loader2 size={32} className="animate-spin text-emerald-500 mb-4" />
                  <p>{t('analyzing')}</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-emerald-50/50 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                        <button 
                          onClick={() => handleAdd(item)}
                          className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600 hover:text-white"
                          title={t('addFood')}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex gap-4 text-sm mt-3">
                        <span className="text-gray-700 font-medium">{item.calories} <span className="text-gray-400 font-normal">{t('kcal')}</span></span>
                        <span className="text-gray-700 font-medium">{item.protein}{t('g')} <span className="text-gray-400 font-normal">{t('protein')}</span></span>
                        <span className="text-gray-700 font-medium">{item.carbs}{t('g')} <span className="text-gray-400 font-normal">{t('carbs')}</span></span>
                        <span className="text-gray-700 font-medium">{item.fat}{t('g')} <span className="text-gray-400 font-normal">{t('fat')}</span></span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
