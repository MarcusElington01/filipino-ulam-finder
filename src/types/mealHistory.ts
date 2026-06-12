export type MealHistoryMealType = 'breakfast' | 'lunch' | 'dinner';
export type MealHistoryDishType =
  | 'Ulam'
  | 'Sabaw'
  | 'Fried'
  | 'Ginisa'
  | 'Gata'
  | 'Adobo'
  | 'Grilled'
  | 'Rice Meal'
  | 'Other';
export type MealHistoryCategory =
  | 'Pork'
  | 'Chicken'
  | 'Beef'
  | 'Fish'
  | 'Seafood'
  | 'Vegetable'
  | 'Egg'
  | 'Tofu'
  | 'Canned Goods'
  | 'Other';

export interface MealHistoryItem {
  id: string;
  date: string;
  mealType: MealHistoryMealType;
  recipeId?: string | null;
  recipeName: string;
  category?: MealHistoryCategory | string;
  dishType?: MealHistoryDishType | string;
  notes?: string;
  isManualEntry: boolean;
  createdAt: string;
}
