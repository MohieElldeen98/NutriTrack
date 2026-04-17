import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Save, Loader2, User as UserIcon } from 'lucide-react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import imageCompression from 'browser-image-compression';

export const Profile: React.FC = () => {
  const { user } = useData();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'sedentary');
  const [chronicDiseases, setChronicDiseases] = useState(user?.chronicDiseases || '');
  const [photoData, setPhotoData] = useState(user?.photoData || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        // Compression Options
        const options = {
          maxSizeMB: 0.5, // 500 KB max
          maxWidthOrHeight: 800, // Reasonable size for profile pic
          useWebWorker: true,
        };
        
        const compressedFile = await imageCompression(file, options);
        setSelectedFile(compressedFile);
        setPhotoData(URL.createObjectURL(compressedFile)); // Local preview
      } catch (error) {
        console.error("Error compressing image:", error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    setSuccess(false);

    try {
      let finalPhotoUrl = user.photoData || '';

      if (selectedFile) {
        // Upload to Firebase Storage
        const fileRef = ref(storage, `users/${user.id}/profile_${Date.now()}`);
        const uploadResult = await uploadBytes(fileRef, selectedFile);
        finalPhotoUrl = await getDownloadURL(uploadResult.ref);
      }

      await setDoc(doc(db, 'users', user.id), {
        firstName,
        lastName,
        age: parseInt(age) || 0,
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,
        gender,
        activityLevel,
        chronicDiseases,
        photoData: finalPhotoUrl,
      }, { merge: true });
      
      setSelectedFile(null); // Clear selected file after successful save
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('profile')}</h1>
        <p className="text-gray-500 mt-1">{t('editProfileDesc')}</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          {success && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-sm font-medium z-10">
              {t('saved')}
            </motion.div>
          )}

          <div className="flex flex-col items-center mb-8 pt-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-emerald-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {isCompressing ? (
                  <Loader2 size={32} className="animate-spin text-emerald-500" />
                ) : photoData ? (
                  <img src={photoData} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-emerald-300" />
                )}
              </div>
              <button
                type="button"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')}</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')}</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('age')}</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('weight')}</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('height')}</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('gender')}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('activityLevel')}</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                <option value="sedentary">{t('sedentary')}</option>
                <option value="light">{t('light')}</option>
                <option value="moderate">{t('moderate')}</option>
                <option value="active">{t('active')}</option>
                <option value="veryActive">{t('veryActive')}</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('chronicDiseases')} <span className="text-gray-400 text-xs font-normal">({t('optional')})</span>
            </label>
            <textarea 
              value={chronicDiseases} 
              onChange={(e) => setChronicDiseases(e.target.value)} 
              placeholder={t('chronicDesc')}
              rows={3} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none" 
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {t('saveProfile')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
