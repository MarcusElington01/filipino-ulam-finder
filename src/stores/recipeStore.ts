import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import recipesData from '@/data/recipes.json';
import { useMealHistoryStore } from '@/stores/mealHistoryStore';
import type { DishType, ProteinType, Recipe, RecipeMatch } from '@/types/recipe';

const FAVORITES_KEY = 'anong-ulam:favorites';

export const cookingTimeOptions = [
  { label: 'Any duration', value: null },
  { label: 'Quick under 30 minutes', value: 30 }
];
export const mealTypeOptions = ['any', 'breakfast', 'lunch', 'dinner'];
export const categoryOptions = ['chicken', 'pork', 'beef', 'fish', 'seafood', 'vegetable', 'egg', 'tofu', 'canned goods'];
export const dishTypeOptions: DishType[] = ['ulam', 'sabaw', 'fried', 'ginisa', 'gata', 'adobo', 'grilled', 'rice meal'];
export const avoidRepeatOptions = [
  { label: 'Allow repeats', value: '' },
  { label: 'No repeat from yesterday', value: 'yesterday' },
  { label: 'No repeat within 2 days', value: '2days' },
  { label: 'No repeat this week', value: 'week' }
];

type MealTypeFilter = '' | 'any' | 'breakfast' | 'lunch' | 'dinner';
type AvoidRepeatFilter = '' | 'yesterday' | '2days' | 'week';

interface RankOptions {
  mealType?: MealTypeFilter;
  category?: string;
  dishType?: DishType | '';
  quickOnly?: boolean;
  noPork?: boolean;
  noSeafood?: boolean;
  avoidRepeat?: AvoidRepeatFilter;
  excludedCategories?: string[];
  limit?: number;
}

export const useRecipeStore = defineStore('recipe', () => {
  const mealHistoryStore = useMealHistoryStore();
  const recipes = ref<Recipe[]>(recipesData as Recipe[]);
  const cookingTime = ref<number | null>(null);
  const mealType = ref<MealTypeFilter>('any');
  const category = ref('');
  const dishType = ref<DishType | ''>('');
  const quickMealsOnly = ref(false);
  const noPork = ref(false);
  const noSeafood = ref(false);
  const avoidRepeat = ref<AvoidRepeatFilter>('');
  const favoriteIds = ref<string[]>(loadFavoriteIds());

  const favoriteRecipes = computed(() =>
    favoriteIds.value
      .map((id) => recipes.value.find((recipe) => recipe.id === id))
      .filter((recipe): recipe is Recipe => Boolean(recipe))
  );

  const suggestions = computed<RecipeMatch[]>(() =>
    rankRecipes({
      mealType: mealType.value,
      category: category.value,
      dishType: dishType.value,
      quickOnly: quickMealsOnly.value || cookingTime.value === 30,
      noPork: noPork.value,
      noSeafood: noSeafood.value,
      avoidRepeat: avoidRepeat.value
    })
  );

  function rankRecipes(options: RankOptions = {}) {
    return recipes.value
      .filter((recipe) => recipePassesFilters(recipe, options))
      .map((recipe) => {
        const matchScore = calculateRotationScore(recipe, options);

        return {
          recipe,
          matchScore,
          matchLabel: getMatchLabel(matchScore),
          recentMealLabel: mealHistoryStore.recentMealLabel({ id: recipe.id, name: recipe.name }) || undefined,
          reasonText: getReasonText(recipe, options)
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore || a.recipe.cookingTimeMinutes - b.recipe.cookingTimeMinutes)
      .slice(0, options.limit ?? recipes.value.length);
  }

  function getTodaySuggestions() {
    const usedCategories = new Set<string>();

    return (['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
      const [best] = rankRecipes({
        mealType: meal,
        avoidRepeat: 'week',
        excludedCategories: [...usedCategories],
        limit: 1
      });

      if (best) usedCategories.add(getRotationCategory(best.recipe));
      return { mealType: meal, match: best };
    });
  }

  function getSurpriseRecipe() {
    const topSuggestions = rankRecipes({
      mealType: mealType.value,
      category: category.value,
      dishType: dishType.value,
      quickOnly: quickMealsOnly.value || cookingTime.value === 30,
      noPork: noPork.value,
      noSeafood: noSeafood.value,
      avoidRepeat: avoidRepeat.value || 'week',
      limit: 8
    });

    if (topSuggestions.length === 0) return undefined;
    return topSuggestions[Math.floor(Math.random() * topSuggestions.length)].recipe;
  }

  function clearFilters() {
    cookingTime.value = null;
    mealType.value = 'any';
    category.value = '';
    dishType.value = '';
    quickMealsOnly.value = false;
    noPork.value = false;
    noSeafood.value = false;
    avoidRepeat.value = '';
  }

  function getRecipeBySlug(slug: string) {
    return recipes.value.find((recipe) => recipe.slug === slug);
  }

  function isFavorite(recipeId: string) {
    return favoriteIds.value.includes(recipeId);
  }

  function toggleFavorite(recipeId: string) {
    favoriteIds.value = isFavorite(recipeId)
      ? favoriteIds.value.filter((id) => id !== recipeId)
      : [...favoriteIds.value, recipeId];
    saveFavoriteIds(favoriteIds.value);
  }

  function recipePassesFilters(recipe: Recipe, options: RankOptions) {
    if (options.mealType && options.mealType !== 'any' && recipe.mealType !== 'any' && recipe.mealType !== options.mealType) return false;
    if (options.category && !recipeMatchesCategory(recipe, options.category)) return false;
    if (options.dishType && recipe.dishType !== options.dishType && !recipe.tags.includes(options.dishType)) return false;
    if (options.quickOnly && recipe.cookingTimeMinutes > 30) return false;
    if (options.noPork && recipeUsesProtein(recipe, 'pork')) return false;
    if (options.noSeafood && (recipeUsesProtein(recipe, 'seafood') || recipeUsesProtein(recipe, 'fish'))) return false;
    if (options.avoidRepeat && isAvoidedByHistory(recipe, options.avoidRepeat)) return false;
    if (options.excludedCategories?.includes(getRotationCategory(recipe))) return false;
    return true;
  }

  function calculateRotationScore(recipe: Recipe, options: RankOptions) {
    let score = 50;

    if (options.mealType && options.mealType !== 'any') {
      score += recipe.mealType === options.mealType ? 24 : recipe.mealType === 'any' ? 10 : 0;
    }

    if (options.category && recipeMatchesCategory(recipe, options.category)) score += 22;
    if (options.dishType && (recipe.dishType === options.dishType || recipe.tags.includes(options.dishType))) score += 18;
    if (options.quickOnly && recipe.cookingTimeMinutes <= 30) score += 12;
    if (favoriteIds.value.includes(recipe.id)) score += 8;

    score -= getHistoryPenalty(recipe);
    score -= getCategoryRotationPenalty(recipe);

    if (!mealHistoryStore.wasRecentlyEaten({ id: recipe.id, name: recipe.name }, 7)) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  function getHistoryPenalty(recipe: Recipe) {
    const elapsed = mealHistoryStore.daysSinceLastEaten({ id: recipe.id, name: recipe.name });
    if (elapsed === null || elapsed < 0) return 0;
    if (elapsed === 0) return 34;
    if (elapsed === 1) return 24;
    if (elapsed <= 2) return 16;
    if (elapsed <= 7) return 8;
    return 0;
  }

  function getCategoryRotationPenalty(recipe: Recipe) {
    const category = getRotationCategory(recipe);
    const recentMeals = mealHistoryStore.meals.filter((meal) => daysSinceDate(meal.date) <= 7);
    const sameCategoryCount = recentMeals.filter((meal) => mealHistoryStore.getMealCategory(meal) === category).length;
    return Math.min(18, sameCategoryCount * 5);
  }

  function isAvoidedByHistory(recipe: Recipe, avoid: AvoidRepeatFilter) {
    const elapsed = mealHistoryStore.daysSinceLastEaten({ id: recipe.id, name: recipe.name });
    if (elapsed === null || elapsed < 0) return false;
    if (avoid === 'yesterday') return elapsed <= 1;
    if (avoid === '2days') return elapsed <= 2;
    if (avoid === 'week') return elapsed <= 7;
    return false;
  }

  function getReasonText(recipe: Recipe, options: RankOptions) {
    const category = getRotationCategory(recipe);
    const elapsed = mealHistoryStore.daysSinceLastEaten({ id: recipe.id, name: recipe.name });
    const recentMeals = mealHistoryStore.meals.filter((meal) => daysSinceDate(meal.date) <= 7);
    const categoryCounts = recentMeals.reduce<Record<string, number>>((counts, meal) => {
      const mealCategory = mealHistoryStore.getMealCategory(meal);
      counts[mealCategory] = (counts[mealCategory] ?? 0) + 1;
      return counts;
    }, {});
    const mostEatenCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (options.quickOnly || recipe.cookingTimeMinutes <= 30) return `Quick ${displayMealType(options.mealType)} option.`;
    if (elapsed === null || elapsed > 7) return `Good ${displayMealType(options.mealType)} option and not eaten in the last 7 days.`;
    if (mostEatenCategory && mostEatenCategory !== category) return `${category} dish to balance your recent ${mostEatenCategory.toLowerCase()} meals.`;
    return `Suggested because you have not eaten ${category.toLowerCase()} recently.`;
  }

  return {
    recipes,
    cookingTime,
    mealType,
    category,
    dishType,
    quickMealsOnly,
    noPork,
    noSeafood,
    avoidRepeat,
    favoriteIds,
    favoriteRecipes,
    suggestions,
    rankRecipes,
    getTodaySuggestions,
    getSurpriseRecipe,
    clearFilters,
    getRecipeBySlug,
    isFavorite,
    toggleFavorite
  };
});

function loadFavoriteIds() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function getMatchLabel(score: number): RecipeMatch['matchLabel'] {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Possible';
  return 'Low';
}

function recipeMatchesCategory(recipe: Recipe, selectedCategory: string) {
  return recipe.category === selectedCategory || recipe.proteinType === selectedCategory || recipe.tags.includes(selectedCategory);
}

function recipeUsesProtein(recipe: Recipe, protein: ProteinType) {
  return recipe.proteinType === protein || recipe.category === protein || recipe.ingredients.includes(protein) || recipe.tags.includes(protein);
}

function getRotationCategory(recipe: Recipe) {
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

function daysSinceDate(date: string) {
  const today = new Date();
  const then = new Date(`${date}T00:00:00`);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thenStart = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  return Math.floor((todayStart.getTime() - thenStart.getTime()) / (24 * 60 * 60 * 1000));
}

function displayMealType(mealType?: MealTypeFilter) {
  return mealType && mealType !== 'any' ? mealType : 'meal';
}
