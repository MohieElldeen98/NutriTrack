import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Plus, Ruler, TrendingDown, Info, Sparkles, Scale, Crown, Loader2, Target } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const Progress: React.FC = () => {
  const { user, isVIP } = useData();
  const { t, lang } = useLanguage();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  // AI Analysis
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchMeasurements = async () => {
    if (!user?.id) return;
    try {
      const q = query(
        collection(db, 'users', user.id, 'measurements'),
        orderBy('date', 'desc'),
        limit(12)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse(); // Reverse for chron chart
      setMeasurements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const newData = {
        date: new Date().toISOString(),
        weight: parseFloat(weight) || 0,
        bodyFat: parseFloat(bodyFat) || 0,
        waist: parseFloat(waist) || 0,
        chest: parseFloat(chest) || 0,
        hips: parseFloat(hips) || 0,
        arms: parseFloat(arms) || 0,
        thighs: parseFloat(thighs) || 0,
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'users', user.id, 'measurements'), newData);
      
      // Update local state
      setMeasurements([...measurements, newData]);
      
      // Reset form
      setWeight(''); setBodyFat(''); setWaist(''); setChest(''); setHips(''); setArms(''); setThighs('');
      setShowAddForm(false);

      // Prevent auto-generation to save tokens, let user click the button if needed
      // if (isVIP) {
      //   generateAnalysis([...measurements, newData]);
      // }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const generateAnalysis = async (data: any[]) => {
    if (data.length === 0) return;
    setAnalyzing(true);
    
    try {
      const latest = data[data.length - 1];
      const previous = data.length > 1 ? data[data.length - 2] : null;

      let prompt = `You are an expert clinical nutritionist and personal trainer. Write in ${lang === 'ar' ? 'Arabic (friendly Egyptian tone)' : 'English'}.
User Profile: Gender ${user?.gender}, Age ${user?.age}, Height ${user?.height}cm, Activity: ${user?.activityLevel}.
Latest Measurements: Weight ${latest.weight}kg, Body Fat ${latest.bodyFat}%, Waist ${latest.waist}cm, Chest ${latest.chest}cm, Hips ${latest.hips}cm.
`;

      if (previous) {
        prompt += `Previous Measurements (from before): Weight ${previous.weight}kg, Body Fat ${previous.bodyFat}%.
`;
      }

      prompt += `
Based on these anthropometric measurements, provide:
1. A brief 2-sentence assessment of their current state and progress.
2. Specific science-backed recommendations to improve their metabolism, fat loss, or muscle gain (mention specific safe herbs like green tea, ashwagandha, matcha, or supplements if applicable, or specific foods).
Format beautifully. No long intros.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setAnalysis(response.text || '');
    } catch (err) {
      console.error(err);
      setAnalysis(lang === 'ar' ? 'حدث خطأ أثناء تحليل البيانات. حاول مرة أخرى.' : 'Error analyzing data. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const gender = user?.gender || 'male';

  const InputHelper = ({ how, normalMale, normalFemale }: { how: string, normalMale: string, normalFemale: string }) => (
    <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-gray-500">
      <span className="flex items-start gap-1"><Info size={12} className="shrink-0 mt-0.5 text-gray-400" /> {how}</span>
      <span className="flex items-start gap-1 text-emerald-600/70">
        <Target size={12} className="shrink-0 mt-0.5" /> 
        {t('normalRange')} <span className="font-medium">{gender === 'male' ? normalMale : normalFemale}</span>
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('progress')}</h1>
          <p className="text-gray-500 mt-1">{t('trackProgress')}</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            {t('newMeasurement')}
          </button>
        )}
      </header>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('weight')}</label>
                <input type="number" step="0.1" required value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureWeightHow')} normalMale="BMI 18.5 - 24.9" normalFemale="BMI 18.5 - 24.9" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('bodyFat')}</label>
                <input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureBodyFatHow')} normalMale="10% - 20%" normalFemale="20% - 30%" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('waist')}</label>
                <input type="number" step="0.5" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureWaistHow')} normalMale="< 94 cm" normalFemale="< 80 cm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('chest')}</label>
                <input type="number" step="0.5" value={chest} onChange={(e) => setChest(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureChestHow')} normalMale="Varies by build" normalFemale="Varies by build" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('hips')}</label>
                <input type="number" step="0.5" value={hips} onChange={(e) => setHips(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureHipsHow')} normalMale="WHR < 0.90" normalFemale="WHR < 0.85" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('arms')}</label>
                <input type="number" step="0.5" value={arms} onChange={(e) => setArms(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureArmsHow')} normalMale="Varies by build" normalFemale="Varies by build" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('thighs')}</label>
                <input type="number" step="0.5" value={thighs} onChange={(e) => setThighs(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" />
                <InputHelper how={t('measureThighsHow')} normalMale="Varies by build" normalFemale="Varies by build" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {t('saveMeasurement')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>
      ) : measurements.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
          <Scale size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{t('noMeasurements')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingDown className="text-emerald-500" /> Chart Trends
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={measurements} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <Line yAxisId="left" type="monotone" name={t('weight')} dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" /> {t('aiAnalysis')}
              </h3>
              {isVIP && (
                <button onClick={() => generateAnalysis(measurements)} disabled={analyzing} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg transition-colors">
                  Refresh
                </button>
              )}
            </div>
            
            {!isVIP ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center flex-1 flex flex-col justify-center items-center">
                <Crown size={48} className="text-amber-400 mb-4" />
                <p className="text-amber-800 font-medium leading-relaxed">{t('upgradeForAnalysis')}</p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center opacity-70">
                  <span className="text-xs bg-white text-amber-600 px-2 py-1 rounded-md font-bold">L-Carnitine</span>
                  <span className="text-xs bg-white text-amber-600 px-2 py-1 rounded-md font-bold">Green Tea</span>
                  <span className="text-xs bg-white text-amber-600 px-2 py-1 rounded-md font-bold">Maca Root</span>
                </div>
              </div>
            ) : analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-emerald-600">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm font-medium animate-pulse">{t('generatingAnalysis')}</span>
              </div>
            ) : analysis ? (
              <div className="flex-1 bg-gray-50 rounded-2xl p-5 text-sm my-prose overflow-y-auto">
                <div className="markdown-body text-gray-700 leading-relaxed max-w-none prose prose-sm prose-emerald">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <button onClick={() => generateAnalysis(measurements)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors">
                  Generate Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
