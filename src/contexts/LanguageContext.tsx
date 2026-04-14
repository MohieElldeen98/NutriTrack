import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'ar' | 'en';

export const translations = {
  ar: {
    dashboard: 'يومياتي',
    history: 'السجل',
    settings: 'الإعدادات',
    logout: 'خروج',
    addFood: 'ضيف أكل',
    suggest: 'اقترحلي',
    today: 'النهاردة',
    trackSubtitle: 'تابع أكلك وظبط سعراتك.',
    caloriesRemaining: 'السعرات الباقية',
    protein: 'بروتين',
    carbs: 'كارب',
    fat: 'دهون',
    foodLog: 'أكل النهاردة',
    noFood: 'لسه مسجلتش أكل النهاردة.',
    addSomething: 'ضيف أكل عشان تتابع تقدمك!',
    addFoodTitle: 'سجل أكل بالذكاء الاصطناعي',
    quantity: 'الكمية',
    foodItem: 'الصنف',
    addAnother: 'ضيف صنف كمان',
    mealType: 'الوجبة',
    breakfast: 'فطار',
    lunch: 'غدا',
    dinner: 'عشا',
    snack: 'تلقيطة/سناك',
    time: 'الوقت',
    date: 'التاريخ',
    calculateAndAdd: 'احسب وضيف',
    calculating: 'بيحسب...',
    aiPowered: 'مدعوم بالذكاء الاصطناعي. بيستخدم أحدث بيانات 2026.',
    historyTitle: 'السجل',
    historySubtitle: 'راجع أكلك في الأيام اللي فاتت.',
    noRecords: 'مفيش سجلات',
    noRecordsDesc: 'مسجلتش أي أكل في اليوم ده.',
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'ظبط أهدافك اليومية.',
    dailyTargets: 'أهدافك اليومية',
    dailyCalorieGoal: 'الهدف اليومي للسعرات',
    proteinTarget: 'هدف البروتين',
    carbsTarget: 'هدف الكربوهيدرات',
    fatTarget: 'هدف الدهون',
    saveChanges: 'احفظ التغييرات',
    settingsSaved: 'تم حفظ الإعدادات بنجاح!',
    dailyCalories: 'السعرات اليومية (كالوري)',
    saveTargets: 'احفظ الأهداف',
    saving: 'بيحفظ...',
    saved: 'اتحفظ بنجاح!',
    loginTitle: 'أهلاً بيك تاني',
    createAccount: 'اعمل حساب جديد',
    email: 'البريد الإلكتروني',
    password: 'كلمة السر',
    rememberMe: 'افتكرني',
    signIn: 'دخول',
    signingIn: 'بيدخل...',
    registerTitle: 'اعمل حساب',
    haveAccount: 'عندك حساب؟',
    registering: 'بيسجل...',
    smartSuggestions: 'اقتراحات ذكية',
    analyzing: 'بيحلل الماكروز بتاعتك...',
    empty: 'فاضي',
    kcal: 'كالوري',
    g: 'جم',
    delete: 'مسح',
    language: 'English',
    mealTiming: 'توقيت الوجبة',
    edit: 'تعديل',
    recalculate: 'إعادة حساب',
    editFood: 'تعديل الأكل',
    foodNameAndQuantity: 'اسم الأكل والكمية'
  },
  en: {
    dashboard: 'Dashboard',
    history: 'History',
    settings: 'Settings',
    logout: 'Logout',
    addFood: 'Add Food',
    suggest: 'Suggest',
    today: 'Today',
    trackSubtitle: 'Track your nutrition and stay on target.',
    caloriesRemaining: 'Calories Remaining',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    foodLog: 'Food Log',
    noFood: 'No food logged yet today.',
    addSomething: 'Add something to see your progress!',
    addFoodTitle: 'Add Food with AI',
    quantity: 'Quantity',
    foodItem: 'Food Item',
    addAnother: 'Add another item',
    mealType: 'Meal',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    time: 'Time',
    date: 'Date',
    calculateAndAdd: 'Calculate & Add',
    calculating: 'Calculating...',
    aiPowered: 'Powered by Gemini AI. Uses highly accurate 2026 nutritional data.',
    historyTitle: 'History',
    historySubtitle: 'Review your past nutrition logs.',
    noRecords: 'No records found',
    noRecordsDesc: 'You didn\'t log any food on this day.',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize your daily nutrition goals.',
    dailyTargets: 'Daily Targets',
    dailyCalorieGoal: 'Daily Calorie Goal',
    proteinTarget: 'Protein Target',
    carbsTarget: 'Carbs Target',
    fatTarget: 'Fat Target',
    saveChanges: 'Save Changes',
    settingsSaved: 'Settings saved successfully!',
    dailyCalories: 'Daily Calories (kcal)',
    saveTargets: 'Save Targets',
    saving: 'Saving...',
    saved: 'Saved successfully!',
    loginTitle: 'Welcome back',
    createAccount: 'create a new account',
    email: 'Email address',
    password: 'Password',
    rememberMe: 'Remember me',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    registerTitle: 'Create an account',
    haveAccount: 'Already have an account?',
    registering: 'Creating account...',
    smartSuggestions: 'Smart Suggestions',
    analyzing: 'Analyzing your macros...',
    empty: 'Empty',
    kcal: 'kcal',
    g: 'g',
    delete: 'Delete',
    language: 'العربية',
    mealTiming: 'Meal Timing',
    edit: 'Edit',
    recalculate: 'Recalculate',
    editFood: 'Edit Food',
    foodNameAndQuantity: 'Food Name & Quantity'
  }
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('ar');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
