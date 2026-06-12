export type BudgetLevel = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any';
export type ProteinType = 'chicken' | 'pork' | 'beef' | 'fish' | 'seafood' | 'egg' | 'tofu' | 'vegetable' | 'canned';
export type CookingMethod = 'fried' | 'soup' | 'stew' | 'sauteed' | 'grilled' | 'simmered';
export type DishType = 'ulam' | 'sabaw' | 'fried' | 'ginisa' | 'stew' | 'gata' | 'adobo' | 'grilled' | 'rice meal';

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  ingredients: string[];
  optionalIngredients: string[];
  steps: string[];
  cookingTimeMinutes: number;
  budgetLevel: BudgetLevel;
  difficulty: Difficulty;
  sourceName: string;
  sourceUrl: string;
  tags: string[];
  mealType: MealType;
  proteinType: ProteinType;
  cookingMethod: CookingMethod;
  dishType: DishType;
  isBudgetMeal: boolean;
  isQuickMeal: boolean;
}

export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
  matchLabel: 'Excellent' | 'Good' | 'Possible' | 'Low';
  recentMealLabel?: string;
  reasonText?: string;
}
