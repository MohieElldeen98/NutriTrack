import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const Register: React.FC = () => {
  const { t, lang } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [chronicDiseases, setChronicDiseases] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Estimate targets using Mifflin-St Jeor Equation
      const w = parseFloat(weight);
      const h = parseFloat(height);
      const a = parseInt(age);
      let bmr = (10 * w) + (6.25 * h) - (5 * a) + (gender === 'male' ? 5 : -161);
      if (isNaN(bmr) || bmr < 1000) bmr = 2000;
      
      let multiplier = 1.2;
      if (activityLevel === 'light') multiplier = 1.375;
      if (activityLevel === 'moderate') multiplier = 1.55;
      if (activityLevel === 'active') multiplier = 1.725;
      if (activityLevel === 'veryActive') multiplier = 1.9;

      const tdee = bmr * multiplier;

      const targets = {
        calories: Math.round(tdee),
        protein: Math.round(w * 1.6) || 120, // 1.6g per kg
        carbs: Math.round((tdee * 0.4) / 4) || 200, // 40% of calories
        fat: Math.round((tdee * 0.3) / 9) || 65, // 30% of calories
      };

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        age: a,
        height: h,
        weight: w,
        gender,
        activityLevel,
        chronicDiseases,
        plan: 'free',
        targets,
        createdAt: new Date().toISOString()
      }, { merge: true });

      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center text-emerald-500">
          <Leaf size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('createAccount')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('haveAccount')}{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            {t('signIn')}
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('firstName')}
                </label>
                <input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('lastName')}
                </label>
                <input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  {t('age')}
                </label>
                <input id="age" type="number" required min="10" max="120" value={age} onChange={(e) => setAge(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                  {t('height')}
                </label>
                <input id="height" type="number" required min="50" max="250" value={height} onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  {t('weight')}
                </label>
                <input id="weight" type="number" required min="20" max="300" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('gender')}
                </label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('activityLevel')}
                </label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                >
                  <option value="sedentary">{t('sedentary')}</option>
                  <option value="light">{t('light')}</option>
                  <option value="moderate">{t('moderate')}</option>
                  <option value="active">{t('active')}</option>
                  <option value="veryActive">{t('veryActive')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('chronicDiseases')} <span className="text-gray-400 font-normal">({t('optional')})</span>
              </label>
              <input type="text" value={chronicDiseases} onChange={(e) => setChronicDiseases(e.target.value)} placeholder={t('chronicDesc')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1 relative">
                <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 ${lang === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-400 hover:text-gray-500`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              >
                {loading ? t('registering') : t('createAccount')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
