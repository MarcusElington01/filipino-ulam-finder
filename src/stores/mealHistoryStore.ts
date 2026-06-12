import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { MealHistoryCategory, MealHistoryDishType, MealHistoryItem, MealHistoryMealType } from '@/types/mealHistory';

const MEAL_HISTORY_KEY = 'anong-ulam:meal-history';

export const useMealHistoryStore = defineStore('mealHistory', () => {
  const meals = ref<MealHistoryItem[]>(loadMealHistory());

  const mealsByDate = computed(() => groupMealsByDate(meals.value));

  function addMealHistory(payload: {
    date: string;
    mealType: MealHistoryMealType;
    recipeId?: string | null;
    recipeName: string;
    category?: MealHistoryCategory | string;
    dishType?: MealHistoryDishType | string;
    notes?: string;
    isManualEntry?: boolean;
  }) {
    const isManualEntry = payload.isManualEntry ?? !payload.recipeId;
    const item: MealHistoryItem = {
      id: createId(),
      date: payload.date,
      mealType: payload.mealType,
      recipeId: isManualEntry ? null : payload.recipeId,
      recipeName: payload.recipeName.trim(),
      category: payload.category,
      dishType: payload.dishType,
      notes: payload.notes?.trim() || undefined,
      isManualEntry,
      createdAt: new Date().toISOString()
    };

    meals.value = [item, ...meals.value];
    saveMealHistory(meals.value);
  }

  function removeMealHistory(id: string) {
    meals.value = meals.value.filter((meal) => meal.id !== id);
    saveMealHistory(meals.value);
  }

  function updateMealHistoryCategory(id: string, category: MealHistoryCategory) {
    meals.value = meals.value.map((meal) => (meal.id === id ? { ...meal, category } : meal));
    saveMealHistory(meals.value);
  }

  function getMealsByDate(date: string) {
    return meals.value
      .filter((meal) => meal.date === date)
      .sort((a, b) => mealOrder(a.mealType) - mealOrder(b.mealType));
  }

  function getRecentMealByRecipeId(recipeId?: string) {
    if (!recipeId) return undefined;
    return sortedMeals(meals.value).find((meal) => meal.recipeId === recipeId);
  }

  function getRecentMealByRecipeName(recipeName: string) {
    const normalized = normalizeName(recipeName);
    return sortedMeals(meals.value).find((meal) => normalizeName(meal.recipeName) === normalized);
  }

  function daysSinceLastEaten(recipe: { id?: string; name: string }) {
    const meal = getRecentMealByRecipeId(recipe.id) ?? getRecentMealByRecipeName(recipe.name);
    if (!meal) return null;

    return diffInDays(startOfLocalDay(new Date()), startOfLocalDay(new Date(`${meal.date}T00:00:00`)));
  }

  function wasRecentlyEaten(recipe: { id?: string; name: string }, days = 7) {
    const elapsed = daysSinceLastEaten(recipe);
    return elapsed !== null && elapsed >= 0 && elapsed <= days;
  }

  function recentMealLabel(recipe: { id?: string; name: string }) {
    const elapsed = daysSinceLastEaten(recipe);
    if (elapsed === null || elapsed < 0 || elapsed > 7) return '';
    if (elapsed === 0) return 'Eaten today';
    if (elapsed === 1) return 'Eaten yesterday';
    if (elapsed === 2) return 'Eaten 2 days ago';
    return 'Eaten recently';
  }

  function getMealCategory(meal: MealHistoryItem) {
    return meal.category ?? inferMealCategory(meal.recipeName);
  }

  return {
    meals,
    mealsByDate,
    addMealHistory,
    removeMealHistory,
    updateMealHistoryCategory,
    getMealsByDate,
    getRecentMealByRecipeId,
    getRecentMealByRecipeName,
    getMealCategory,
    wasRecentlyEaten,
    daysSinceLastEaten,
    recentMealLabel
  };
});

function loadMealHistory() {
  try {
    const saved = localStorage.getItem(MEAL_HISTORY_KEY);
    const parsed = saved ? (JSON.parse(saved) as MealHistoryItem[]) : [];
    return parsed.map((meal) => ({
      ...meal,
      recipeId: meal.recipeId ?? null,
      isManualEntry: meal.isManualEntry ?? !meal.recipeId
    }));
  } catch {
    return [];
  }
}

function saveMealHistory(meals: MealHistoryItem[]) {
  localStorage.setItem(MEAL_HISTORY_KEY, JSON.stringify(meals));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function groupMealsByDate(meals: MealHistoryItem[]) {
  return meals
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || mealOrder(a.mealType) - mealOrder(b.mealType))
    .reduce<Record<string, MealHistoryItem[]>>((groups, meal) => {
      groups[meal.date] = groups[meal.date] ? [...groups[meal.date], meal] : [meal];
      return groups;
    }, {});
}

function sortedMeals(meals: MealHistoryItem[]) {
  return meals.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

function mealOrder(mealType: MealHistoryMealType) {
  return { breakfast: 1, lunch: 2, dinner: 3 }[mealType];
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(newer: Date, older: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((newer.getTime() - older.getTime()) / msPerDay);
}

function inferMealCategory(recipeName: string): MealHistoryCategory {
  const name = recipeName.toLowerCase();
  if (/(pork|baboy|lechon|sisig|menudo|igado|dinakdakan|tokwa't baboy|karne)/.test(name)) return 'Pork';
  if (/(chicken|manok|tinola|afritada|asado|sopas|arroz caldo)/.test(name)) return 'Chicken';
  if (/(beef|baka|bistek|tapa|mechado|caldereta)/.test(name)) return 'Beef';
  if (/(fish|isda|bangus|tilapia|salmon|daing|paksiw|sarciado)/.test(name)) return 'Fish';
  if (/(shrimp|hipon|squid|pusit|seafood)/.test(name)) return 'Seafood';
  if (/(kangkong|pechay|ampalaya|talong|sitaw|kalabasa|sayote|gulay|munggo|laing|pinakbet|pakbet)/.test(name)) return 'Vegetable';
  if (/(egg|itlog|torta|omelette)/.test(name)) return 'Egg';
  if (/(tofu|tokwa)/.test(name)) return 'Tofu';
  if (/(sardines|corned|tuna)/.test(name)) return 'Canned Goods';
  return 'Other';
}
