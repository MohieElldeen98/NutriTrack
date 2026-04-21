import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { DailyRecord, FoodItem, UserTargets } from '../types';
import { format } from 'date-fns';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId || undefined,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  targets: UserTargets;
  todayRecord: DailyRecord | null;
  history: Record<string, DailyRecord>;
  isVIP: boolean;
  user: any; // We'll add user directly mostly for profile access
  updateTargets: (targets: UserTargets) => Promise<void>;
  addFood: (food: Omit<FoodItem, 'id' | 'timestamp'>, targetDate?: string) => Promise<void>;
  addFoods: (foods: Omit<FoodItem, 'id' | 'timestamp'>[], targetDate?: string) => Promise<void>;
  updateFood: (oldFood: FoodItem, newFood: Omit<FoodItem, 'id' | 'timestamp'>, oldDate: string, newDate: string) => Promise<void>;
  removeFood: (foodId: string, targetDate?: string) => Promise<void>;
  getRecordForDate: (dateStr: string) => Promise<DailyRecord | null>;
}

const defaultTargets: UserTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [targets, setTargets] = useState<UserTargets>(defaultTargets);
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [history, setHistory] = useState<Record<string, DailyRecord>>({});
  const [isVIP, setIsVIP] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!authUser) return;

    if (authUser.email === 'pt.mohie@gmail.com') {
      setIsVIP(true);
    }

    const userRef = doc(db, 'users', authUser.uid);
    
    // Ensure email is stored in Firestore so Admin Panel can read it
    setDoc(userRef, { 
      email: authUser.email,
    }, { merge: true }).catch(err => console.error("Failed to sync email", err));
    
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let effectivePlan = data.plan;
        
        if (authUser.email === 'pt.mohie@gmail.com') {
          effectivePlan = 'vip'; // Force master to be VIP in UI globally
          setIsVIP(true);
        } else {
          setIsVIP(data.plan === 'vip' || data.plan === 'vip_monthly');
        }

        setUser({ id: authUser.uid, email: authUser.email, ...data, plan: effectivePlan });
        
        if (data.targets) {
          setTargets(data.targets);
        }
      } else {
        // Initialize targets
        const initialUser = { id: authUser.uid, email: authUser.email };
        setUser({ ...initialUser, targets: defaultTargets });
        setDoc(userRef, { targets: defaultTargets }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`);
    });

    const todayRef = doc(db, 'users', authUser.uid, 'days', todayStr);
    const unsubscribeToday = onSnapshot(todayRef, (docSnap) => {
      if (docSnap.exists()) {
        setTodayRecord(docSnap.data() as DailyRecord);
      } else {
        setTodayRecord({
          date: todayStr,
          foods: [],
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}/days/${todayStr}`);
    });

    return () => {
      unsubscribeUser();
      unsubscribeToday();
    };
  }, [authUser, todayStr]);

  const updateTargets = async (newTargets: UserTargets) => {
    if (!authUser) return;
    try {
      await setDoc(doc(db, 'users', authUser.uid), { targets: newTargets }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${authUser.uid}`);
    }
  };

  const addFood = async (foodData: Omit<FoodItem, 'id' | 'timestamp'>, targetDate: string = todayStr) => {
    if (!authUser) return;
    const food: FoodItem = {
      ...foodData,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };

    const dayRef = doc(db, 'users', authUser.uid, 'days', targetDate);
    try {
      const docSnap = await getDoc(dayRef);

      if (!docSnap.exists()) {
        await setDoc(dayRef, {
          date: targetDate,
          foods: [food],
          totals: {
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
          }
        });
      } else {
        const currentData = docSnap.data() as DailyRecord;
        await updateDoc(dayRef, {
          foods: arrayUnion(food),
          totals: {
            calories: currentData.totals.calories + food.calories,
            protein: currentData.totals.protein + food.protein,
            carbs: currentData.totals.carbs + food.carbs,
            fat: currentData.totals.fat + food.fat,
          }
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${authUser.uid}/days/${targetDate}`);
    }
  };

  const addFoods = async (foodsData: Omit<FoodItem, 'id' | 'timestamp'>[], targetDate: string = todayStr) => {
    if (!authUser) return;
    
    const newFoods: FoodItem[] = foodsData.map(food => ({
      ...food,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    }));

    const dayRef = doc(db, 'users', authUser.uid, 'days', targetDate);
    try {
      const docSnap = await getDoc(dayRef);

      const totalCalories = newFoods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = newFoods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = newFoods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFat = newFoods.reduce((sum, f) => sum + f.fat, 0);

      if (!docSnap.exists()) {
        await setDoc(dayRef, {
          date: targetDate,
          foods: newFoods,
          totals: {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
          }
        });
      } else {
        const currentData = docSnap.data() as DailyRecord;
        await updateDoc(dayRef, {
          foods: arrayUnion(...newFoods),
          totals: {
            calories: currentData.totals.calories + totalCalories,
            protein: currentData.totals.protein + totalProtein,
            carbs: currentData.totals.carbs + totalCarbs,
            fat: currentData.totals.fat + totalFat,
          }
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${authUser.uid}/days/${targetDate}`);
    }
  };

  const updateFood = async (oldFood: FoodItem, newFoodData: Omit<FoodItem, 'id' | 'timestamp'>, oldDate: string, newDate: string) => {
    if (!authUser) return;

    const newFood: FoodItem = {
      ...newFoodData,
      id: oldFood.id, // Keep the same ID
      timestamp: oldFood.timestamp, // Keep original timestamp or update? Let's keep it.
    };

    try {
      if (oldDate === newDate) {
        // Update in the same day
        const dayRef = doc(db, 'users', authUser.uid, 'days', oldDate);
        const docSnap = await getDoc(dayRef);
        if (!docSnap.exists()) return;

        const dayRecord = docSnap.data() as DailyRecord;
        const updatedFoods = dayRecord.foods.map(f => f.id === oldFood.id ? newFood : f);
        
        await updateDoc(dayRef, {
          foods: updatedFoods,
          totals: {
            calories: Math.max(0, dayRecord.totals.calories - oldFood.calories + newFood.calories),
            protein: Math.max(0, dayRecord.totals.protein - oldFood.protein + newFood.protein),
            carbs: Math.max(0, dayRecord.totals.carbs - oldFood.carbs + newFood.carbs),
            fat: Math.max(0, dayRecord.totals.fat - oldFood.fat + newFood.fat),
          }
        });
      } else {
        // Move to a different day
        await removeFood(oldFood.id, oldDate);
        
        const newDayRef = doc(db, 'users', authUser.uid, 'days', newDate);
        const newDocSnap = await getDoc(newDayRef);
        
        if (!newDocSnap.exists()) {
          await setDoc(newDayRef, {
            date: newDate,
            foods: [newFood],
            totals: {
              calories: newFood.calories,
              protein: newFood.protein,
              carbs: newFood.carbs,
              fat: newFood.fat,
            }
          });
        } else {
          const newDayRecord = newDocSnap.data() as DailyRecord;
          await updateDoc(newDayRef, {
            foods: arrayUnion(newFood),
            totals: {
              calories: newDayRecord.totals.calories + newFood.calories,
              protein: newDayRecord.totals.protein + newFood.protein,
              carbs: newDayRecord.totals.carbs + newFood.carbs,
              fat: newDayRecord.totals.fat + newFood.fat,
            }
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${authUser.uid}/days/${oldDate}`);
    }
  };

  const removeFood = async (foodId: string, targetDate: string = todayStr) => {
    if (!authUser) return;
    
    const dayRef = doc(db, 'users', authUser.uid, 'days', targetDate);
    try {
      const docSnap = await getDoc(dayRef);
      if (!docSnap.exists()) return;
      
      const dayRecord = docSnap.data() as DailyRecord;
      const foodToRemove = dayRecord.foods.find(f => f.id === foodId);
      if (!foodToRemove) return;

      await updateDoc(dayRef, {
        foods: arrayRemove(foodToRemove),
        totals: {
          calories: Math.max(0, dayRecord.totals.calories - foodToRemove.calories),
          protein: Math.max(0, dayRecord.totals.protein - foodToRemove.protein),
          carbs: Math.max(0, dayRecord.totals.carbs - foodToRemove.carbs),
          fat: Math.max(0, dayRecord.totals.fat - foodToRemove.fat),
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${authUser.uid}/days/${targetDate}`);
    }
  };

  const getRecordForDate = async (dateStr: string) => {
    if (!authUser) return null;
    const dayRef = doc(db, 'users', authUser.uid, 'days', dateStr);
    try {
      const docSnap = await getDoc(dayRef);
      if (docSnap.exists()) {
        return docSnap.data() as DailyRecord;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}/days/${dateStr}`);
      return null;
    }
  };

  return (
    <DataContext.Provider value={{ targets, todayRecord, history, isVIP, user, updateTargets, addFood, addFoods, updateFood, removeFood, getRecordForDate }}>
      {children}
    </DataContext.Provider>
  );
};
