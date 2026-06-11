export type Difficulty = 'easy' | 'medium' | 'hard';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any';
export type ProteinType = 'chicken' | 'pork' | 'beef' | 'fish' | 'seafood' | 'egg' | 'tofu' | 'vegetable' | 'canned';
export type CookingMethod = 'fried' | 'soup' | 'stew' | 'sauteed' | 'grilled' | 'simmered';

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
  difficulty: Difficulty;
  sourceName: string;
  sourceUrl: string;
  tags: string[];
  mealType: MealType;
  proteinType: ProteinType;
  cookingMethod: CookingMethod;
  isQuickMeal: boolean;
}

export interface RecipeMatch {
  recipe: Recipe;
  matchedIngredients: string[];
  matchedOptionalIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
  matchLabel: 'Excellent' | 'Good' | 'Possible' | 'Low';
}
