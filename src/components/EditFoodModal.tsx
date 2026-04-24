import React, { useState } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { FoodItem } from '../types';
import { GoogleGenAI } from '@google/genai';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function normalizeCacheKey(foodName: string): string {
  let combined = foodName.toLowerCase().trim();
  combined = combined.replace(/[أإآا]/g, 'ا');
  combined = combined.replace(/ة/g, 'ه');
  combined = combined.replace(/ى/g, 'ي');
  combined = combined.replace(/\bال/g, '');
  combined = combined.replace(/[^a-z0-9\u0600-\u06FF]/g, '');
  return combined;
}

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem;
  currentDate: string;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({ isOpen, onClose, food, currentDate }) => {
  const { t, lang } = useLanguage();
  const { updateFood } = useData();
  
  const [foodName, setFoodName] = useState(food.name);
  const [mealType, setMealType] = useState(food.mealType || 'breakfast');
  const [time, setTime] = useState(food.time || '12:00');
  const [date, setDate] = useState(currentDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Check if food name changed. If yes, recalculate macros.
      if (foodName.trim() !== food.name.trim()) {
        const cacheKey = normalizeCacheKey(foodName);
        const cacheRef = doc(db, 'foodCache', cacheKey);
        let foodData: any = null;

        try {
          const cacheSnap = await getDoc(cacheRef);
          if (cacheSnap.exists()) {
            foodData = cacheSnap.data();
          }
        } catch (err) {
          // ignore cache read error
        }

        if (!foodData) {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `As an expert nutritionist, analyze the following food consumed for a single meal and provide highly accurate, professional-grade nutritional data.
  
            CRITICAL RULES FOR ANALYSIS:
            1. Data Sources Priority: 1st: Egyptian local food composition tables -> 2nd: FAO/INFOODS -> 3rd: USDA FoodData Central -> 4th: Other reliable databases.
            2. Accuracy & Mapping: Use Egyptian data first. If an exact match isn't found, map to the closest equivalent (e.g., "homemade ful medames" -> "ful medames - average 200g plate").
            3. Units & Inputs: Automatically understand units (grams, cups, tablespoons, medium piece, plate, etc.). If the quantity is missing or unclear, assume a standard Egyptian portion size and state the assumption. Do not ask the user for clarification; always provide a best-effort assumption.
            4. Rounding: Round calories to the nearest 1 kcal. Round macronutrients (protein, carbs, fat) to the nearest 0.1 gram. Do not use high-precision decimals unnecessarily.
            5. Language: The "name" and "assumption" fields MUST be in ${lang === 'ar' ? 'Arabic (Egyptian dialect preferred)' : 'English'}, matching the user's language.
            
            Food:
            - ${foodName}
            
            Return ONLY a JSON object with the following structure, no markdown formatting:
            {
              "name": "Combined name with quantity (e.g., ${lang === 'ar' ? '200 جرام فول مدمس' : '200g Ful Medames'})",
              "calories": number (rounded to nearest 1),
              "protein": number (rounded to nearest 0.1),
              "carbs": number (rounded to nearest 0.1),
              "fat": number (rounded to nearest 0.1),
              "assumption": "String. If you made any assumptions about portion size or mapped the food to an equivalent, explain it here starting with '${lang === 'ar' ? 'افتراض:' : 'Assumption:'}'. Leave empty string if no assumptions were made."
            }`,
          });
  
          const text = response.text;
          if (!text) throw new Error("No response from AI");
          
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          foodData = JSON.parse(cleanText);

          setDoc(cacheRef, foodData).catch(() => {});
        }

        await updateFood(food, {
          name: foodData.name,
          calories: foodData.calories,
          protein: foodData.protein,
          carbs: foodData.carbs,
          fat: foodData.fat,
          assumption: foodData.assumption || '',
          mealType,
          time
        }, currentDate, date);

      } else {
        // Just update metadata
        await updateFood(food, {
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          assumption: food.assumption,
          mealType,
          time
        }, currentDate, date);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{t('editFood')}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('date')}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('mealType')}
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="breakfast">{t('breakfast')}</option>
                  <option value="lunch">{t('lunch')}</option>
                  <option value="dinner">{t('dinner')}</option>
                  <option value="snack">{t('snack')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('time')}
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('foodNameAndQuantity')}
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder={lang === 'ar' ? 'أمثلة: 200 جرام فراخ' : 'e.g., 200g chicken'}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {foodName !== food.name ? t('recalculate') : ''}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !foodName.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{foodName !== food.name ? t('calculating') : t('saving')}</span>
                </>
              ) : (
                <>
                  {foodName !== food.name ? <RefreshCw className="w-5 h-5" /> : null}
                  <span>{t('saveChanges')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
