import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import imageCompression from 'browser-image-compression';

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
  const [activeTab, setActiveTab] = useState<'manual' | 'camera'>('manual');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `As an expert nutritionist, analyze the following list of foods consumed for a single meal and provide highly accurate, professional-grade nutritional data.

        CRITICAL RULES FOR ANALYSIS:
        1. Data Sources Priority: 1st: Egyptian local food composition tables -> 2nd: FAO/INFOODS -> 3rd: USDA FoodData Central -> 4th: Other reliable databases.
        2. Accuracy & Mapping: Use Egyptian data first. If an exact match isn't found, map to the closest equivalent (e.g., "homemade ful medames" -> "ful medames - average 200g plate").
        3. Units & Inputs: Automatically understand units (grams, cups, tablespoons, medium piece, plate, etc.). If the quantity is missing or unclear, assume a standard Egyptian portion size and state the assumption. Do not ask the user for clarification; always provide a best-effort assumption.
        4. Rounding: Round calories to the nearest 1 kcal. Round macronutrients (protein, carbs, fat) to the nearest 0.1 gram. Do not use high-precision decimals unnecessarily.
        5. Language: The "name" and "assumption" fields MUST be in ${lang === 'ar' ? 'Arabic (Egyptian dialect preferred)' : 'English'}, matching the user's language.
        
        Foods:
        ${validRows.map(r => `- ${r.quantity} ${r.foodName}`).join('\n')}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Combined name with quantity" },
                calories: { type: Type.NUMBER, description: "Calories rounded to nearest 1" },
                protein: { type: Type.NUMBER, description: "Protein rounded to nearest 0.1" },
                carbs: { type: Type.NUMBER, description: "Carbs rounded to nearest 0.1" },
                fat: { type: Type.NUMBER, description: "Fat rounded to nearest 0.1" },
                assumption: { type: Type.STRING, description: "Any assumptions made" }
              },
              required: ["name", "calories", "protein", "carbs", "fat", "assumption"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const foodDataArray = JSON.parse(text.trim());

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
      setImagePreview(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Could not understand the food. Try being more specific.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    setError('');

    try {
      // Compress the image
      const options = {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);

      // Need a base64 string without data:image... prefix for gemini.
      const base64Promise = new Promise<string>((resolve) => {
        const reader2 = new FileReader();
        reader2.onloadend = () => {
          const res = reader2.result as string;
          resolve(res.split(',')[1]);
        };
        reader2.readAsDataURL(compressedFile);
      });
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const promptStr = `Analyze this image of a meal. Act as an expert Arab nutritionist. 
      Identify all the food items visible. Estimate their quantities/portion sizes in grams, cups, or pieces.
      Provide your best expert estimation. If there are multiple items, return multiple objects in the array.
      Answer in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: compressedFile.type,
              }
            },
            {
              text: promptStr
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                foodName: {
                  type: Type.STRING,
                  description: `The isolated name of the food (e.g. ${lang === 'ar' ? 'فول مدمس بالزيت' : 'Ful Medames with oil'})`
                },
                quantity: {
                  type: Type.STRING,
                  description: `The estimated quantity (e.g. ${lang === 'ar' ? '200 جم' : '200 g'})`
                }
              },
              required: ["foodName", "quantity"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response");

      const items = JSON.parse(text.trim());

      if (items && Array.isArray(items) && items.length > 0) {
        setRows(items.map((item, idx) => ({
          id: Date.now() + idx,
          quantity: item.quantity || '',
          foodName: item.foodName || ''
        })));
        setActiveTab('manual'); // Switch to manual tab to let them review & calculate
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error(err);
      setError(t('imageError'));
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-emerald-500" size={20} />
                  {t('addFoodTitle')}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'manual' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('manualEntry')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'camera' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('snapMeal')}
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

                {activeTab === 'manual' ? (
                  <>
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
                              placeholder="اكتب الكمية"
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
                              placeholder="اكتب هنا الاكلة"
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    {!imagePreview ? (
                      <label className="relative cursor-pointer w-full max-w-sm">
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          onChange={handleImageCapture}
                          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                          className="hidden"
                        />
                        <div className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors">
                          {loading ? (
                            <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
                          ) : (
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                              <span className="text-2xl">📸</span>
                            </div>
                          )}
                          <p className="font-medium text-gray-800">
                            {loading ? t('analyzingImage') : t('uploadOrTake')}
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className="w-full max-w-sm">
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4">
                          <img src={imagePreview} alt="Meal Preview" className="w-full h-full object-cover" />
                          {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                              <Loader2 size={40} className="animate-spin text-emerald-600 mb-2" />
                              <span className="text-sm font-medium text-emerald-800">{t('analyzingImage')}</span>
                            </div>
                          )}
                        </div>
                        
                        {!loading && error && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setError('');
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-colors"
                          >
                            {lang === 'ar' ? 'تصوير مرة أخرى' : 'Try Again'}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {error && (
                      <div className="w-full max-w-sm mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
