import { actionSheetController } from '@ionic/vue';
import { useMealHistoryStore } from '@/stores/mealHistoryStore';
import type { Recipe } from '@/types/recipe';
import type { MealHistoryCategory, MealHistoryMealType } from '@/types/mealHistory';
import { showToast } from '@/utils/toast';

export function useCookedMeal() {
  const historyStore = useMealHistoryStore();

  async function markCooked(recipe: Recipe, preferredMealType?: string) {
    const mealType = isMealType(preferredMealType) ? preferredMealType : await askMealType();
    if (!mealType) return;

    historyStore.addMealHistory({
      date: todayString(),
      mealType,
      recipeId: recipe.id,
      recipeName: recipe.name,
      category: recipeCategory(recipe)
    });

    await showToast('Meal logged successfully.', 'success');
  }

  return { markCooked };
}

async function askMealType() {
  return new Promise<MealHistoryMealType | undefined>(async (resolve) => {
    const sheet = await actionSheetController.create({
      header: 'Which meal?',
      buttons: [
        { text: 'Breakfast', handler: () => resolve('breakfast') },
        { text: 'Lunch', handler: () => resolve('lunch') },
        { text: 'Dinner', handler: () => resolve('dinner') },
        { text: 'Cancel', role: 'cancel', handler: () => resolve(undefined) }
      ]
    });
    await sheet.present();
  });
}

function isMealType(value?: string): value is MealHistoryMealType {
  return value === 'breakfast' || value === 'lunch' || value === 'dinner';
}

function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function recipeCategory(recipe: Recipe): MealHistoryCategory {
  if (recipe.proteinType === 'pork') return 'Pork';
  if (recipe.proteinType === 'chicken') return 'Chicken';
  if (recipe.proteinType === 'beef') return 'Beef';
  if (recipe.proteinType === 'fish') return 'Fish';
  if (recipe.proteinType === 'seafood') return 'Seafood';
  if (recipe.proteinType === 'vegetable') return 'Vegetable';
  if (recipe.proteinType === 'egg') return 'Egg';
  if (recipe.proteinType === 'tofu') return 'Tofu';
  if (recipe.proteinType === 'canned') return 'Canned Goods';
  return 'Other';
}
