import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Terms: React.FC = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto flex-1 w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('terms')}</h1>
      
      <div className="prose prose-emerald max-w-none text-gray-700 leading-8">
        <p className="text-lg font-medium mb-8 text-gray-600">{t('termsIntro')}</p>
        
        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. الغرض من التطبيق</h3>
        <p>
          التطبيق يوفر أدوات تتبع ومراقبة السعرات الحرارية والمغذيات باستخدام تقنيات الذكاء الاصطناعي لتسهيل تجربة المستخدم. 
          التطبيق ليس بديلاً عن الطبيب المختص أو التحاليل الدورية المعملية.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. سياسة الدفع والاسترداد</h3>
        <p>
          عبر اشتراكك في باقة الـ VIP، يتم خصم القيمة الموضحة بناءً على دورة الفوترة المختارة (شهري/سنوي) ومزود خدمة الدفع المستقل (Paymob/Stripe).
          لا يمكن استرداد الأموال للشهور التي تم استهلاكها، ولكن يمكنك إلغاء الاشتراك في أي وقت وسيظل حسابك نشطاً حتى نهاية الفترة المدفوعة.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. الملكية الفكرية والبيانات</h3>
        <p>
          جميع محتويات التطبيق، والعلامات التجارية المرتبطة به، والبرمجيات هي ملكية خاصة لمطوري NutriTrack ولا يجوز استنساخها أو إعادة بيعها لأي أغراض تجارية.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. التعديل على الشروط</h3>
        <p>
          يحق لنا تعديل هذه الشروط في أي وقت مع إشعار المستخدمين عبر البريد الإلكتروني أو من خلال التطبيق نفسه. استمرارك في استخدام التطبيق يعتبر موافقة على الشروط المعدلة.
        </p>
      </div>
    </div>
  );
};
