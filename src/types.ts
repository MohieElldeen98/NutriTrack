export interface UserTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
  mealType?: string;
  time?: string;
  assumption?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  foods: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
