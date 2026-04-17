import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const ReturnPolicy: React.FC = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto flex-1 w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('refundPolicy')}</h1>
      
      <div className="prose prose-emerald max-w-none text-gray-700 leading-8">
        <p className="text-lg font-medium mb-8 text-gray-600">
          توضح هذه الصفحة سياسة التعامل مع الاشتراكات المالية ورد الأموال (Refund Policy) الخاصة بتطبيق NutriTrack لضمان الشفافية لجميع المشتركين.
        </p>
        
        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. سياسة الإلغاء (Cancellation)</h3>
        <p>
          يمكن للمشتركين في باقة "VIP" إلغاء الاشتراك في أي وقت من خلال إعدادات الحساب أو بالتواصل مع الدعم الفني. عند الإلغاء، يظل الاشتراكم فعّالاً حتى نهاية فترة الفوترة الحالية (الشهر المدفوع)، ولن يتم تجديد الخصم للشهور التالية.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. سياسة استرداد الأموال (Refunds)</h3>
        <p>
          نظراً لطبيعة الخدمات الرقمية والبرمجية عبر الإنترنت، <strong>لا يتم استرداد الأموال</strong> للمدة التي تم استخدامها جزئياً من الشهر (No Prorated Refunds). مجرد نجاح عملية الدفع وتفعيل مميزات الـ VIP، يُعتبر الاشتراك قد بدأ.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. الاستثناءات والأخطاء التقنية</h3>
        <p>
          في حالة حدوث خصم مزدوج بالخطأ (Double charge) أو وجود مشكلة تقنية مثبتة منعتك بالكامل من الوصول لحساب الـ VIP خلال 48 ساعة من الدفع، يرجى التواصل معنا وسنقوم بإصدار استرداد فوري للمبلغ (Full Refund) بالتنسيق مع مزود الدفع (Paymob). الاسترداد في هذه الحالة يستغرق من 5 إلى 14 يوم عمل حسب سياسة البنك المستقل.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. التواصل لحل المشكلات</h3>
        <p>
          إذا كان لديك أي استفسار حول عملية الدفع أو واجهت مشكلة، يرجى مراسلة الدعم الفني الخاص بنا. نحن حريصون على تقديم خدمة شفافة وعادلة لجميع المستخدمين.
        </p>
      </div>
    </div>
  );
};
