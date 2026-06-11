import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import recipesData from '@/data/recipes.json';
import type { ProteinType, Recipe, RecipeMatch } from '@/types/recipe';

const FAVORITES_KEY = 'anong-ulam:favorites';

export const ingredientCategories = [
  { name: 'Meat', ingredients: ['pork', 'chicken', 'beef'] },
  { name: 'Seafood', ingredients: ['fish', 'tilapia', 'bangus', 'shrimp', 'squid'] },
  { name: 'Vegetables', ingredients: ['kangkong', 'ampalaya', 'talong', 'sitaw', 'kalabasa', 'sayote', 'pechay'] },
  {
    name: 'Pantry',
    ingredients: [
      'egg',
      'tofu',
      'sardines',
      'corned beef',
      'garlic',
      'onion',
      'tomato',
      'soy sauce',
      'vinegar',
      'fish sauce',
      'coconut milk'
    ]
  }
];

export const cookingTimeOptions = [
  { label: 'Under 15 minutes', value: 15 },
  { label: 'Under 30 minutes', value: 30 },
  { label: 'Under 1 hour', value: 60 }
];
export const mealTypeOptions = ['breakfast', 'lunch', 'dinner'];
export const categoryOptions = [
  'pork',
  'chicken',
  'beef',
  'fish',
  'vegetable',
  'seafood',
  'canned goods',
  'egg',
  'tofu',
  'soup',
  'fried'
];

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>(recipesData as Recipe[]);
  const selectedIngredients = ref<string[]>([]);
  const cookingTime = ref<number | null>(null);
  const mealType = ref('');
  const category = ref('');
  const quickMealsOnly = ref(false);
  const noPork = ref(false);
  const noSeafood = ref(false);
  const vegetableOnly = ref(false);
  const cannedGoodsOnly = ref(false);
  const eggMealsOnly = ref(false);
  const favoriteIds = ref<string[]>(loadFavoriteIds());

  const favoriteRecipes = computed(() =>
    favoriteIds.value
      .map((id) => recipes.value.find((recipe) => recipe.id === id))
      .filter((recipe): recipe is Recipe => Boolean(recipe))
  );

  function calculateMatchScore(
    recipe: Recipe,
    requiredMatches: number,
    optionalMatches: number,
    missingRequired: number
  ) {
    let points = 0;
    let maxPoints = 0;

    const selectedIngredientCount = requiredMatches + missingRequired;
    if (selectedIngredientCount > 0) {
      points += requiredMatches * 12;
      maxPoints += selectedIngredientCount * 12;
      points += optionalMatches * 4;
      maxPoints += Math.max(recipe.optionalIngredients.length, optionalMatches) * 4;
      points -= missingRequired * 4;
    }

    if (cookingTime.value) {
      maxPoints += 10;
      if (recipe.cookingTimeMinutes <= cookingTime.value) points += 10;
    }

    if (category.value) {
      maxPoints += 12;
      if (recipeMatchesCategory(recipe, category.value)) points += 12;
    }

    if (mealType.value) {
      maxPoints += 6;
      if (recipe.mealType === 'any' || recipe.mealType === mealType.value) points += 6;
    }

    if (quickMealsOnly.value) {
      maxPoints += 6;
      if (recipe.isQuickMeal && recipe.cookingTimeMinutes <= 30) points += 6;
    }

    if (vegetableOnly.value || cannedGoodsOnly.value || eggMealsOnly.value) {
      maxPoints += 8;
      if (
        (vegetableOnly.value && recipe.proteinType === 'vegetable') ||
        (cannedGoodsOnly.value && (recipe.proteinType === 'canned' || recipe.category === 'canned goods')) ||
        (eggMealsOnly.value && (recipe.proteinType === 'egg' || recipe.ingredients.includes('egg')))
      ) {
        points += 8;
      }
    }

    if (noPork.value || noSeafood.value) {
      maxPoints += 6;
      if (
        (!noPork.value || !recipeUsesProtein(recipe, 'pork')) &&
        (!noSeafood.value || (!recipeUsesProtein(recipe, 'seafood') && !recipeUsesProtein(recipe, 'fish')))
      ) {
        points += 6;
      }
    }

    if (maxPoints === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((points / maxPoints) * 100)));
  }

  const suggestions = computed<RecipeMatch[]>(() => {
    const selected = new Set(selectedIngredients.value);
    const hasSelectedIngredients = selected.size > 0;

    return recipes.value
      .filter((recipe) => {
        if (cookingTime.value && recipe.cookingTimeMinutes > cookingTime.value) return false;
        if (mealType.value && recipe.mealType !== 'any' && recipe.mealType !== mealType.value) return false;
        if (category.value && !recipeMatchesCategory(recipe, category.value)) return false;
        if (quickMealsOnly.value && (!recipe.isQuickMeal || recipe.cookingTimeMinutes > 30)) return false;
        if (noPork.value && recipeUsesProtein(recipe, 'pork')) return false;
        if (noSeafood.value && (recipeUsesProtein(recipe, 'seafood') || recipeUsesProtein(recipe, 'fish'))) return false;
        if (vegetableOnly.value && recipe.proteinType !== 'vegetable') return false;
        if (cannedGoodsOnly.value && recipe.proteinType !== 'canned' && recipe.category !== 'canned goods') return false;
        if (eggMealsOnly.value && recipe.proteinType !== 'egg' && !recipe.ingredients.includes('egg')) return false;
        return true;
      })
      .map((recipe) => {
        const matchedIngredients = recipe.ingredients.filter((ingredient) => matchesSelectedIngredient(ingredient, selected));
        const matchedOptionalIngredients = recipe.optionalIngredients.filter((ingredient) => matchesSelectedIngredient(ingredient, selected));
        const missingIngredients = recipe.ingredients.filter((ingredient) => !matchesSelectedIngredient(ingredient, selected));
        const matchScore = calculateMatchScore(recipe, matchedIngredients.length, matchedOptionalIngredients.length, missingIngredients.length);

        const hasIngredientOverlap = matchedIngredients.length > 0 || matchedOptionalIngredients.length > 0;

        return {
          recipe,
          matchedIngredients,
          matchedOptionalIngredients,
          missingIngredients,
          matchScore,
          matchLabel: getMatchLabel(matchScore),
          hasIngredientOverlap
        };
      })
      .filter((match) => !hasSelectedIngredients || match.hasIngredientOverlap)
      .sort((a, b) => b.matchScore - a.matchScore || a.recipe.cookingTimeMinutes - b.recipe.cookingTimeMinutes);
  });

  function toggleIngredient(ingredient: string) {
    selectedIngredients.value = selectedIngredients.value.includes(ingredient)
      ? selectedIngredients.value.filter((item) => item !== ingredient)
      : [...selectedIngredients.value, ingredient];
  }

  function clearFilters() {
    selectedIngredients.value = [];
    cookingTime.value = null;
    mealType.value = '';
    category.value = '';
    quickMealsOnly.value = false;
    noPork.value = false;
    noSeafood.value = false;
    vegetableOnly.value = false;
    cannedGoodsOnly.value = false;
    eggMealsOnly.value = false;
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

  return {
    recipes,
    selectedIngredients,
    cookingTime,
    mealType,
    category,
    quickMealsOnly,
    noPork,
    noSeafood,
    vegetableOnly,
    cannedGoodsOnly,
    eggMealsOnly,
    favoriteIds,
    favoriteRecipes,
    suggestions,
    toggleIngredient,
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

function matchesSelectedIngredient(recipeIngredient: string, selectedIngredients: Set<string>) {
  if (selectedIngredients.has(recipeIngredient)) return true;

  const aliases: Record<string, string[]> = {
    fish: ['tilapia', 'bangus'],
    bangus: ['fish'],
    sardines: ['fish'],
    shrimp: ['seafood'],
    squid: ['seafood']
  };

  return aliases[recipeIngredient]?.some((alias) => selectedIngredients.has(alias)) ?? false;
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
