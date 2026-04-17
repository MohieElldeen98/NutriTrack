import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Activity, Apple, Sparkles, MoveRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  
  const linkTarget = user ? '/app' : '/login';

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 font-medium text-sm mb-6 border border-emerald-100">
            <Sparkles size={16} />
            <span>NutriTrack AI Engine</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            {t('landingHeroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t('landingHeroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={linkTarget} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg shadow-emerald-600/20"
            >
              {t('getStarted')}
              <MoveRight size={20} className={cn(lang === 'ar' ? 'rotate-180' : '')} />
            </Link>
            <Link 
              to="/pricing" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-medium transition-all"
            >
              {t('viewPricing')}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How it works Section (Required for Paymob Clarity) */}
      <section className="py-20 bg-emerald-50/50 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-12">{t('howItWorks')}</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 bg-emerald-200 -z-10"></div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-20 h-20 mx-auto bg-white border-4 border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm mb-6 z-10 relative">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step1Title')}</h3>
              <p className="text-gray-600">{t('step1Desc')}</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="w-20 h-20 mx-auto bg-white border-4 border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm mb-6 z-10 relative">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step2Title')}</h3>
              <p className="text-gray-600">{t('step2Desc')}</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="w-20 h-20 mx-auto bg-white border-4 border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm mb-6 z-10 relative">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step3Title')}</h3>
              <p className="text-gray-600">{t('step3Desc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Apple size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('basicFeature1')}</h3>
              <p className="text-gray-600 leading-relaxed">سجل فطارك وغداك وعشاك بسهولة تامة، والمحرك الذكي هيحسبلك السعرات بدقة.</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('vipFeature1')}</h3>
              <p className="text-gray-600 leading-relaxed">باقة الـ VIP بتحلل نمط أكلك الأسبوعي عشان تتجنب أي ثبات في الوزن وتسرع وصولك لهدفك.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('vipFeature2')}</h3>
              <p className="text-gray-600 leading-relaxed">تحليل خاص لتوقيت الوجبات عشان تسيطر على الأنسولين وتحافظ على حرق جسمك عالي طول اليوم.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
