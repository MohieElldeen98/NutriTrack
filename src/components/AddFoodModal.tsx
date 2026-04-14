import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLanguage();
  const [rows, setRows] = useState([{ id: Date.now(), quantity: '', foodName: '' }]);
  const [mealType, setMealType] = useState('breakfast');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addFoods } = useData();

  const addRow = () => setRows([...rows, { id: Date.now(), quantity: '', foodName: '' }]);
  const removeRow = (id: number) => setRows(rows.filter(r => r.id !== id));
  const updateRow = (id: number, field: 'quantity' | 'foodName', value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter(r => r.quantity.trim() && r.foodName.trim());
    if (validRows.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `As an expert nutritionist, analyze the following list of foods consumed for a single meal and provide highly accurate, professional-grade nutritional data.

        CRITICAL RULES FOR ANALYSIS:
        1. Data Sources Priority: 1st: Egyptian local food composition tables -> 2nd: FAO/INFOODS -> 3rd: USDA FoodData Central -> 4th: Other reliable databases.
        2. Accuracy & Mapping: Use Egyptian data first. If an exact match isn't found, map to the closest equivalent (e.g., "homemade ful medames" -> "ful medames - average 200g plate").
        3. Units & Inputs: Automatically understand units (grams, cups, tablespoons, medium piece, plate, etc.). If the quantity is missing or unclear, assume a standard Egyptian portion size and state the assumption. Do not ask the user for clarification; always provide a best-effort assumption.
        4. Rounding: Round calories to the nearest 1 kcal. Round macronutrients (protein, carbs, fat) to the nearest 0.1 gram. Do not use high-precision decimals unnecessarily.
        5. Language: The "name" and "assumption" fields MUST be in ${lang === 'ar' ? 'Arabic (Egyptian dialect preferred)' : 'English'}, matching the user's language.
        
        Foods:
        ${validRows.map(r => `- ${r.quantity} ${r.foodName}`).join('\n')}
        
        Return ONLY a JSON array of objects with the following structure, no markdown formatting:
        [
          {
            "name": "Combined name with quantity (e.g., ${lang === 'ar' ? '200 جرام فول مدمس' : '200g Ful Medames'})",
            "calories": number (rounded to nearest 1),
            "protein": number (rounded to nearest 0.1),
            "carbs": number (rounded to nearest 0.1),
            "fat": number (rounded to nearest 0.1),
            "assumption": "String. If you made any assumptions about portion size or mapped the food to an equivalent, explain it here starting with '${lang === 'ar' ? 'افتراض:' : 'Assumption:'}'. Leave empty string if no assumptions were made."
          }
        ]`,
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const foodDataArray = JSON.parse(cleanText);

      const foodsToSave = foodDataArray.map((f: any) => ({
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        assumption: f.assumption || '',
        mealType,
        time
      }));

      await addFoods(foodsToSave, date);

      setRows([{ id: Date.now(), quantity: '', foodName: '' }]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Could not understand the food. Try being more specific.');
    } finally {
      setLoading(false);
    }
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
            <div className="p-6 border-b border-gray-100 shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-emerald-500" size={20} />
                  {t('addFoodTitle')}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddFood}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('date')}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
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

                <div className="space-y-3 mb-4">
                  {rows.map((row, index) => (
                    <div key={row.id} className="flex gap-2 items-start">
                      <div className="w-1/3">
                        {index === 0 && (
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('quantity')}
                          </label>
                        )}
                        <input
                          type="text"
                          placeholder="e.g., 200g"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          autoFocus={index === 0}
                        />
                      </div>
                      <div className="flex-1">
                        {index === 0 && (
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('foodItem')}
                          </label>
                        )}
                        <input
                          type="text"
                          placeholder="e.g., White Rice"
                          value={row.foodName}
                          onChange={(e) => updateRow(row.id, 'foodName', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {rows.length > 1 && (
                        <div className={index === 0 ? "pt-7" : ""}>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-2 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors mb-6"
                >
                  <Plus size={16} />
                  {t('addAnother')}
                </button>
                
                <p className="text-xs text-gray-500 mb-6">
                  {t('aiPowered')}
                </p>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !rows.some(r => r.quantity.trim() && r.foodName.trim())}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  {loading ? t('calculating') : t('calculateAndAdd')}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
