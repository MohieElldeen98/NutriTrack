import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Clock, Edit2 } from 'lucide-react';
import { FoodItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { EditFoodModal } from './EditFoodModal';

interface FoodListProps {
  foods: FoodItem[];
  onRemove?: (id: string) => void;
  currentDate?: string;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onRemove, currentDate }) => {
  const { t, lang } = useLanguage();
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  if (foods.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
        <p>{t('noFood')}</p>
        <p className="text-sm mt-1">{t('addSomething')}</p>
      </div>
    );
  }

  // Group foods by mealType
  const groupedFoods = foods.reduce((acc, food) => {
    const meal = food.mealType || 'snack';
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      {mealOrder.map((meal) => {
        const mealFoods = groupedFoods[meal];
        if (!mealFoods || mealFoods.length === 0) return null;

        // Sort by time if available
        const sortedFoods = [...mealFoods].sort((a, b) => {
          if (a.time && b.time) return a.time.localeCompare(b.time);
          return a.timestamp - b.timestamp;
        });

        return (
          <div key={meal} className="space-y-3">
            <h4 className="font-semibold text-gray-900 capitalize px-1 text-sm flex items-center gap-2">
              {t(meal as any)}
            </h4>
            {sortedFoods.map((food, idx) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{food.name}</h4>
                    {food.time && (
                      <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                        <Clock size={12} />
                        {food.time}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    <span>{food.calories} {t('kcal')}</span>
                    <span>•</span>
                    <span>{food.protein}{t('g')} {t('protein')}</span>
                    <span>•</span>
                    <span>{food.carbs}{t('g')} {t('carbs')}</span>
                    <span>•</span>
                    <span>{food.fat}{t('g')} {t('fat')}</span>
                  </div>
                  {food.assumption && (
                    <div className="mt-2 text-[11px] text-amber-700 bg-amber-50/50 px-2 py-1.5 rounded-md border border-amber-100/50 leading-relaxed max-w-sm">
                      {food.assumption}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                  {currentDate && (
                    <button
                      onClick={() => setEditingFood(food)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('edit')}
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(food.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );
      })}

      {editingFood && currentDate && (
        <EditFoodModal
          isOpen={!!editingFood}
          onClose={() => setEditingFood(null)}
          food={editingFood}
          currentDate={currentDate}
        />
      )}
    </div>
  );
};
