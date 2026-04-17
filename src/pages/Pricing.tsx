import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Check, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Pricing: React.FC = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  
  const basicFeatures = [
    t('basicFeature1'),
    t('basicFeature2'),
    t('basicFeature3'),
  ];

  const vipFeatures = [
    t('basicFeature1'),
    t('basicFeature2'),
    t('basicFeature3'),
    t('vipFeature1'),
    t('vipFeature2'),
    t('vipFeature3'),
    t('vipFeature4'),
  ];

  return (
    <div className="py-20 px-6 max-w-6xl mx-auto flex-1 w-full">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('pricing')}</h1>
        <p className="text-gray-600 text-lg">اختر الخطة المناسبة لهدفك مع NutriTrack. وفرنا لك خيارات مرنة بأسعار تناسب الجميع.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('basicPlan')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-900">0</span>
              <span className="text-gray-500 font-medium">{t('egpMo')}</span>
            </div>
            <p className="text-gray-500 mt-4 text-sm font-medium">{t('free')} للجميع</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {basicFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link 
            to={user ? "/app" : "/register"} 
            className="w-full py-3 px-6 rounded-xl border-2 border-emerald-600 text-emerald-600 font-bold text-center hover:bg-emerald-50 transition-colors"
          >
            {t('getStarted')}
          </Link>
        </motion.div>

        {/* Pro Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-8 border-2 border-amber-400 shadow-lg relative flex flex-col"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
            <Crown size={16} /> مميز
          </div>

          <div className="mb-8 mt-4">
            <h3 className="text-2xl font-bold text-amber-900 mb-2">{t('advancedPlan')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-900">499</span>
              <span className="text-amber-700 font-medium">{t('egpMo')}</span>
            </div>
            <p className="text-amber-700/80 mt-4 text-sm font-medium">أقوى أدوات التحليل والمتابعة الذكية</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {vipFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <span className="text-gray-800">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link 
            to={user ? "/app/settings" : "/register"} 
            className="w-full py-3 px-6 rounded-xl bg-amber-500 text-white font-bold text-center hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20"
          >
            {t('subscribePaymob')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
