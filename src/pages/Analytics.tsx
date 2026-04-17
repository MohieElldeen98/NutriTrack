import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { format, subDays } from 'date-fns';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Info, Crown } from 'lucide-react';
import { DailyRecord } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Analytics: React.FC = () => {
  const { getRecordForDate, targets, isVIP } = useData();
  const { t, lang } = useLanguage();
  
  const [weeklyData, setWeeklyData] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightText, setInsightText] = useState('');

  useEffect(() => {
    const fetchWeeklyData = async () => {
      setLoading(true);
      const data: DailyRecord[] = [];
      const today = new Date();
      // Fetch last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const record = await getRecordForDate(dateStr);
        if (record) {
          data.push(record);
        } else {
          data.push({
            date: dateStr,
            foods: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          });
        }
      }
      setWeeklyData(data);
      setLoading(false);
    };
    fetchWeeklyData();
  }, [getRecordForDate]);

  // Calculations
  const weeklyTotals = weeklyData.reduce(
    (acc, day) => {
      acc.calories += day.totals.calories;
      acc.protein += day.totals.protein;
      acc.carbs += day.totals.carbs;
      acc.fat += day.totals.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const weeklyTargets = {
    calories: targets.calories * 7,
    protein: targets.protein * 7,
    carbs: targets.carbs * 7,
    fat: targets.fat * 7,
  };

  // Preparation for Bar Chart
  const chartData = weeklyData.map(day => ({
    name: format(new Date(day.date), 'EEE'),
    consumed: Math.round(day.totals.calories),
    target: targets.calories
  }));

  // Preparation for Pie Chart
  const getMealDistribution = () => {
    const counts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    weeklyData.forEach(day => {
      day.foods.forEach(food => {
        const meal = food.mealType || 'snack';
        if (counts[meal as keyof typeof counts] !== undefined) {
          counts[meal as keyof typeof counts] += food.calories || 0;
        }
      });
    });
    return [
      { name: t('breakfast'), value: Math.round(counts.breakfast) },
      { name: t('lunch'), value: Math.round(counts.lunch) },
      { name: t('dinner'), value: Math.round(counts.dinner) },
      { name: t('snack'), value: Math.round(counts.snack) },
    ].filter(i => i.value > 0);
  };

  const pieData = getMealDistribution();
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const generateInsights = async () => {
    setInsightLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const analysisData = weeklyData.map(day => ({
        date: day.date,
        totals: day.totals,
        foods: day.foods.map(f => ({ name: f.name, calories: f.calories, time: f.time, meal: f.mealType, macros: { p: f.protein, c: f.carbs, f: f.fat } }))
      }));

      const prompt = `As an expert nutritionist, endocrinologist, and metabolic specialist (Dr. Mohie), analyze the past 7 days of eating habits.
      
      User Daily Targets: ${targets.calories} kcal, ${targets.protein}g protein, ${targets.carbs}g carbs, ${targets.fat}g fat.
      
      Data: ${JSON.stringify(analysisData)}
      
      Requirements for the Analysis (You MUST cover these specific pillars based on the actual logged foods):
      1. السعرات والتكيف الأيضي (Metabolic Adaptation): Are they undereating (risking starvation mode) or overeating?
      2. مقاومة الأنسولين والمؤشر الجلايسيمي (Insulin & Glycemic Index): Analyze foods causing high insulin spikes vs stable blood sugar.
      3. جودة الدهون وتأثيرها على القلب (Lipid Profile): Are the fats mostly healthy (unsaturated) or unhealthy (saturated/trans)?
      4. الألياف وصحة الأمعاء (Gut Microbiome): Are there enough veggies, fruits, and whole grains for gut health?
      5. مؤشر الشبع (Satiety Index): Are they eating high-volume filling foods or small empty calories?
      6. الهرمونات ومواعيد الأكل (Circadian Rhythm): Analyze late-night eating and meal timings.
      7. التنوع والفيتامينات (Micronutrients Diversity): Is the diet repetitive? What vitamins/minerals might be missing?
      8. روشتة الأسبوع الجديد: Actionable advice for the upcoming week.
      
      Language: The response MUST be in ${lang === 'ar' ? 'Arabic (Egyptian dialect, friendly, professional, simple medical terms)' : 'English'}.
      
      CRITICAL FORMATTING INSTRUCTIONS FORMATTING:
      - Use standard Markdown headings (###) for each of the pillars above.
      - Add DOUBLE clear empty lines between different sections to prevent clumping.
      - Keep paragraphs short and use bullet points where suitable.
      - DO NOT wrap the output in a markdown codeblock (no \`\`\`markdown).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsightText(response.text || '');
    } catch (err) {
      console.error(err);
      setInsightText(t('noRecordsDesc'));
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('analyticsTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('analyticsSubtitle')}</p>
      </header>

      {!isVIP ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 md:p-12 text-center border border-amber-100 shadow-sm">
          <Crown size={64} className="text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('proPlan')}</h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
            {t('lockedFeature')}
          </p>
          <Link to="/app/settings" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm">
            <Crown size={20} />
            {t('unlockNow')}
          </Link>
        </motion.div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 size={32} className="animate-spin text-emerald-500 mb-4" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">{t('weeklySummary')}</p>
              <h3 className="text-2xl font-bold text-gray-900">{Math.round(weeklyTotals.calories)}</h3>
              <p className="text-xs text-gray-400 mt-1">/ {weeklyTargets.calories} {t('kcal')}</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: `${Math.min(100, (weeklyTotals.calories / (weeklyTargets.calories || 1)) * 100)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-emerald-600 font-medium mb-1">{t('protein')}</p>
              <h3 className="text-2xl font-bold text-emerald-900">{Math.round(weeklyTotals.protein)}{t('g')}</h3>
              <p className="text-xs text-emerald-600/70 mt-1">/ {weeklyTargets.protein}{t('g')}</p>
              <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-3">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (weeklyTotals.protein / (weeklyTargets.protein || 1)) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-blue-600 font-medium mb-1">{t('carbs')}</p>
              <h3 className="text-2xl font-bold text-blue-900">{Math.round(weeklyTotals.carbs)}{t('g')}</h3>
              <p className="text-xs text-blue-600/70 mt-1">/ {weeklyTargets.carbs}{t('g')}</p>
              <div className="w-full bg-blue-100 rounded-full h-1.5 mt-3">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (weeklyTotals.carbs / (weeklyTargets.carbs || 1)) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-amber-600 font-medium mb-1">{t('fat')}</p>
              <h3 className="text-2xl font-bold text-amber-900">{Math.round(weeklyTotals.fat)}{t('g')}</h3>
              <p className="text-xs text-amber-600/70 mt-1">/ {weeklyTargets.fat}{t('g')}</p>
              <div className="w-full bg-amber-100 rounded-full h-1.5 mt-3">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (weeklyTotals.fat / (weeklyTargets.fat || 1)) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trend Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('weeklySummary')}</h3>
              <div className="flex-1 w-full relative" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="consumed" name={t('consumedWeekly')} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name={t('weeklyTarget')} fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Meal Distribution Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('mealDistribution')} (kcal)</h3>
              <div className="flex-1 w-full relative" dir="ltr">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {t('empty')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100/50 shadow-sm relative overflow-hidden">
            <div className="transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                    <Sparkles className="text-emerald-500" size={24} />
                    {t('drMohieInsights')}
                  </h3>
                  <p className="text-emerald-700/70 text-sm mt-1">{t('insulinAnalysis')}</p>
                </div>
                <button
                  onClick={generateInsights}
                  disabled={insightLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {insightLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {t('analyzeWeekly')}
                </button>
              </div>

              {insightText ? (
                <div className="bg-white/60 p-6 md:p-8 rounded-2xl border border-emerald-100 prose prose-emerald prose-sm max-w-none markdown-body prose-headings:text-red-600 prose-h3:text-red-600 prose-p:leading-8 prose-li:my-3 prose-p:my-4 space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <Markdown>{insightText}</Markdown>
                </div>
              ) : (
                <div className="bg-white/40 p-8 rounded-2xl border border-emerald-100/50 flex flex-col items-center justify-center text-center">
                  <Info className="text-emerald-300 mb-3" size={32} />
                  <p className="text-emerald-800 font-medium">اضغط على زر "حلل الأسبوع" عشان د.محي يستعرض وجباتك وتأثيرها.</p>
                  <p className="text-emerald-600/70 text-sm mt-1">هنحلل السعرات، الماكروز، وتوقيت الوجبات عشان تتجنب أي Insulin spikes.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
