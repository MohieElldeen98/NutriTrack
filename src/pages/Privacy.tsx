import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Privacy: React.FC = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto flex-1 w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('privacy')}</h1>
      
      <div className="prose prose-emerald max-w-none text-gray-700 leading-8">
        <p className="text-lg font-medium mb-8 text-gray-600">{t('privacyIntro')}</p>
        
        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. جمع البيانات</h3>
        <p>
          نحن نجمع فقط البيانات التي تُدخلها بنفسك في التطبيق (كالبريد الإلكتروني لخلق الحساب، بيانات الوزن والسعرات اليومية) لتوليد تقاريرك الخاصة. التطبيق لا يجمع بيانات من أطراف أخرى دون علمك.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. استخدام البيانات وتحليلها</h3>
        <p>
          تُستخدم بيانات التغذية الخاصة بك حصرياً لتقديم "التحليل الذكي" من خلال تقنية الذكاء الاصطناعي بغرض تحسين خطتك الغذائية. لا يتم استخدام بياناتك لأغراض الإعلانات الموجهة أو بيعها لأي جهات خارجية تحت أي ظرف.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. بوابات الدفع المستقلة والأمان (Payment Processing)</h3>
        <p>
          تتم معالجة جميع المدفوعات والبيانات المالية حصرياً عن طريق بوابات الدفع المعتمدة (مثل <strong>Paymob</strong>). 
          تطبيقنا <strong>لا يقوم على الإطلاق</strong> بجمع أو تخزين أرقام بطاقات الائتمان الخاصة بك أو أرقام المحافظ الإلكترونية، وتتم عملية الدفع عبر صفحات مشفرة بالكامل تخص Paymob.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. توافر وإتلاف البيانات</h3>
        <p>
          لك كامل الحق في طلب نسخة من بياناتك، أو طلب حذف حسابك بشكل نهائي من قاعدة البيانات. وبمجرد طلب الحذف، لا يمكن استرجاع بياناتك مرة أخرى.
        </p>
      </div>
    </div>
  );
};
