<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Meal History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-body">
        <ion-card ref="addMealCard">
          <ion-card-header>
            <ion-card-title>Add Past Meal</ion-card-title>
            <ion-card-subtitle>Track what you ate so suggestions stay fresh.</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list inset>
              <ion-item>
                <ion-input v-model="date" label="Date" type="date"></ion-input>
              </ion-item>
              <ion-item>
                <ion-select v-model="mealType" label="Meal type">
                  <ion-select-option value="breakfast">Breakfast</ion-select-option>
                  <ion-select-option value="lunch">Lunch</ion-select-option>
                  <ion-select-option value="dinner">Dinner</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  <strong>Recipe search</strong>
                  <p>Select a recipe or type your own ulam name below.</p>
                </ion-label>
              </ion-item>
              <ion-searchbar
                v-model="recipeSearch"
                placeholder="Search saved recipes"
                :debounce="100"
              ></ion-searchbar>
              <div v-if="recipeSearch.trim()" class="recipe-search-results">
                <ion-chip
                  v-for="recipe in filteredRecipes"
                  :key="recipe.id"
                  :class="{ 'chip-selected': selectedRecipeId === recipe.id }"
                  @click="selectRecipe(recipe.id)"
                >
                  {{ recipe.name }}
                </ion-chip>
                <p v-if="filteredRecipes.length === 0">No saved recipe found. Use manual entry.</p>
              </div>
              <ion-item>
                <ion-input v-model="manualRecipeName" label="Ulam name" placeholder="Type ulam name"></ion-input>
              </ion-item>
              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  <p>Not in the list? Type your ulam manually.</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-select v-model="manualCategory" label="Category" placeholder="Optional category">
                  <ion-select-option value="">No category</ion-select-option>
                  <ion-select-option v-for="category in historyCategories" :key="category" :value="category">
                    {{ category }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-select v-model="manualDishType" label="Dish type" placeholder="Optional dish type">
                  <ion-select-option value="">No dish type</ion-select-option>
                  <ion-select-option v-for="dish in historyDishTypes" :key="dish" :value="dish">
                    {{ dish }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-textarea v-model="notes" label="Notes" placeholder="Optional notes" :auto-grow="true"></ion-textarea>
              </ion-item>
            </ion-list>

            <ion-button expand="block" @click="saveMeal">Save Meal</ion-button>
          </ion-card-content>
        </ion-card>

        <section class="section-block">
          <div class="section-heading-row">
            <h2>Tracker</h2>
            <ion-select v-model="trackerPeriod" interface="popover" aria-label="Tracker period">
              <ion-select-option value="week">Weekly</ion-select-option>
              <ion-select-option value="month">Monthly</ion-select-option>
              <ion-select-option value="quarter">Quarterly</ion-select-option>
              <ion-select-option value="year">Yearly</ion-select-option>
            </ion-select>
          </div>

          <ion-card>
            <ion-card-content>
              <p class="tracker-range">{{ trackerSummary.label }}</p>
              <div class="tracker-grid">
                <div class="tracker-stat">
                  <strong>{{ trackerSummary.totalMeals }}</strong>
                  <span>Meals logged</span>
                </div>
                <div class="tracker-stat">
                  <strong>{{ trackerSummary.uniqueMeals }}</strong>
                  <span>Unique ulam</span>
                </div>
                <div class="tracker-stat tracker-wide">
                  <strong>{{ trackerSummary.topMeal }}</strong>
                  <span>Most repeated</span>
                </div>
              </div>
              <div class="category-tracker">
                <div class="category-row" v-for="item in trackerSummary.categoryBreakdown" :key="item.category">
                  <div class="category-meta">
                    <strong>{{ item.category }}</strong>
                    <span>{{ item.count }} meal{{ item.count === 1 ? '' : 's' }} | {{ item.percent }}%</span>
                  </div>
                  <div class="category-bar">
                    <span :style="{ width: `${item.percent}%` }"></span>
                  </div>
                </div>
                <p v-if="trackerSummary.categoryBreakdown.length === 0" class="tracker-empty">
                  Log meals to see your meat, fish, vegetable, and other ulam mix.
                </p>
              </div>
              <div class="meal-breakdown">
                <ion-badge color="tertiary">Breakfast {{ trackerSummary.mealCounts.breakfast }}</ion-badge>
                <ion-badge color="tertiary">Lunch {{ trackerSummary.mealCounts.lunch }}</ion-badge>
                <ion-badge color="tertiary">Dinner {{ trackerSummary.mealCounts.dinner }}</ion-badge>
              </div>
            </ion-card-content>
          </ion-card>
        </section>

        <section class="section-block">
          <h2>History</h2>
          <ion-card v-if="Object.keys(historyStore.mealsByDate).length === 0" class="empty-state">
            <ion-card-content>
              <h2>No meals logged yet</h2>
              <p>Log your first breakfast, lunch, or dinner to start tracking your ulam rotation.</p>
              <ion-button @click="scrollToMealForm">Log Meal</ion-button>
            </ion-card-content>
          </ion-card>

          <div v-for="[historyDate, meals] in groupedMeals" :key="historyDate" class="history-day">
            <h3>{{ formatDateHeading(historyDate) }}</h3>
            <ion-list inset>
              <ion-item v-for="meal in meals" :key="meal.id">
                <ion-icon slot="start" :icon="timeOutline"></ion-icon>
                <ion-label class="ion-text-wrap">
                  <strong>{{ titleCase(meal.mealType) }}: {{ meal.recipeName }}</strong>
                  <ion-badge v-if="meal.isManualEntry" color="tertiary" class="manual-entry-badge">Manual entry</ion-badge>
                  <p>{{ formatDate(meal.date) }}</p>
                  <p v-if="meal.notes">{{ meal.notes }}</p>
                  <div class="history-category-row">
                    <span>Category</span>
                    <ion-select
                      interface="popover"
                      :value="meal.category ?? getMealCategory(meal)"
                      @ionChange="historyStore.updateMealHistoryCategory(meal.id, $event.detail.value)"
                    >
                      <ion-select-option v-for="category in historyCategories" :key="category" :value="category">
                        {{ category }}
                      </ion-select-option>
                    </ion-select>
                  </div>
                </ion-label>
                <ion-button slot="end" fill="clear" color="danger" @click="confirmDeleteMeal(meal.id)">
                  Delete
                </ion-button>
              </ion-item>
            </ion-list>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  alertController,
  IonButton,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { timeOutline } from 'ionicons/icons';
import { useMealHistoryStore } from '@/stores/mealHistoryStore';
import { useRecipeStore } from '@/stores/recipeStore';
import type { MealHistoryCategory, MealHistoryDishType, MealHistoryItem, MealHistoryMealType } from '@/types/mealHistory';
import { showToast } from '@/utils/toast';

const historyStore = useMealHistoryStore();
const recipeStore = useRecipeStore();

const date = ref(todayString());
const mealType = ref<MealHistoryMealType>('lunch');
const selectedRecipeId = ref('');
const manualRecipeName = ref('');
const manualCategory = ref<MealHistoryCategory | ''>('');
const manualDishType = ref<MealHistoryDishType | ''>('');
const notes = ref('');
const trackerPeriod = ref<'week' | 'month' | 'quarter' | 'year'>('week');
const recipeSearch = ref('');
const addMealCard = ref<{ $el?: HTMLElement } | null>(null);
const historyCategories: MealHistoryCategory[] = [
  'Pork',
  'Chicken',
  'Beef',
  'Fish',
  'Seafood',
  'Vegetable',
  'Egg',
  'Tofu',
  'Canned Goods',
  'Other'
];
const historyDishTypes: MealHistoryDishType[] = ['Ulam', 'Sabaw', 'Fried', 'Ginisa', 'Gata', 'Adobo', 'Grilled', 'Rice Meal', 'Other'];

const selectedRecipe = computed(() => recipeStore.recipes.find((recipe) => recipe.id === selectedRecipeId.value));
const recipeName = computed(() => selectedRecipe.value?.name ?? manualRecipeName.value.trim());
const canSave = computed(() => Boolean(date.value && mealType.value && recipeName.value));
const groupedMeals = computed(() => Object.entries(historyStore.mealsByDate));
const trackerSummary = computed(() => buildTrackerSummary(trackerPeriod.value));
const filteredRecipes = computed(() => {
  const query = recipeSearch.value.trim().toLowerCase();
  if (!query) return [];

  return recipeStore.recipes
    .filter((recipe) => recipe.name.toLowerCase().includes(query))
    .slice(0, 8);
});

watch(selectedRecipe, (recipe) => {
  if (recipe) {
    manualRecipeName.value = recipe.name;
    manualCategory.value = categoryLabel(recipe.proteinType, recipe.category);
    manualDishType.value = dishTypeLabel(recipe.dishType);
  }
});

async function saveMeal() {
  if (!recipeName.value) {
    await showToast('Please select or type an ulam name.', 'warning');
    return;
  }

  if (!canSave.value) {
    await showToast('Unable to save meal, please enter an ulam name.', 'warning');
    return;
  }

  historyStore.addMealHistory({
    date: date.value,
    mealType: mealType.value,
    recipeId: selectedRecipe.value?.id ?? null,
    recipeName: recipeName.value,
    category: manualCategory.value || undefined,
    dishType: manualDishType.value || undefined,
    isManualEntry: !selectedRecipe.value,
    notes: notes.value
  });

  await showToast(selectedRecipe.value ? 'Meal logged successfully.' : 'Manual ulam saved.', 'success');

  selectedRecipeId.value = '';
  manualRecipeName.value = '';
  manualCategory.value = '';
  manualDishType.value = '';
  recipeSearch.value = '';
  notes.value = '';
}

async function confirmDeleteMeal(id: string) {
  const alert = await alertController.create({
    header: 'Delete meal entry?',
    message: 'This will remove the meal from your history.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          historyStore.removeMealHistory(id);
          await showToast('History item deleted.', 'medium');
        }
      }
    ]
  });

  await alert.present();
}

function scrollToMealForm() {
  addMealCard.value?.$el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}

function selectRecipe(recipeId: string) {
  const recipe = recipeStore.recipes.find((item) => item.id === recipeId);
  if (!recipe) return;

  selectedRecipeId.value = recipe.id;
  manualRecipeName.value = recipe.name;
  manualCategory.value = categoryLabel(recipe.proteinType, recipe.category);
  manualDishType.value = dishTypeLabel(recipe.dishType);
  recipeSearch.value = recipe.name;
}

function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDateHeading(value: string) {
  const elapsed = daysBetween(todayString(), value);
  if (elapsed === 0) return 'Today';
  if (elapsed === 1) return 'Yesterday';
  return formatDate(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

function daysBetween(today: string, value: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((new Date(`${today}T00:00:00`).getTime() - new Date(`${value}T00:00:00`).getTime()) / msPerDay);
}

function buildTrackerSummary(period: 'week' | 'month' | 'quarter' | 'year') {
  const range = getDateRange(period);
  const meals = historyStore.meals.filter((meal: MealHistoryItem) => meal.date >= range.start && meal.date <= range.end);
  const uniqueNames = new Set(meals.map((meal) => meal.recipeName.trim().toLowerCase()));
  const mealCounts = {
    breakfast: meals.filter((meal) => meal.mealType === 'breakfast').length,
    lunch: meals.filter((meal) => meal.mealType === 'lunch').length,
    dinner: meals.filter((meal) => meal.mealType === 'dinner').length
  };
  const repeats = meals.reduce<Record<string, { name: string; count: number }>>((counts, meal) => {
    const key = meal.recipeName.trim().toLowerCase();
    counts[key] = counts[key] ?? { name: meal.recipeName, count: 0 };
    counts[key].count += 1;
    return counts;
  }, {});
  const top = Object.values(repeats).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0];
  const categoryCounts = meals.reduce<Record<string, number>>((counts, meal) => {
    const category = getMealCategory(meal);
    counts[category] = (counts[category] ?? 0) + 1;
    return counts;
  }, {});
  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percent: meals.length ? Math.round((count / meals.length) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  return {
    label: range.label,
    totalMeals: meals.length,
    uniqueMeals: uniqueNames.size,
    topMeal: top ? `${top.name} (${top.count}x)` : 'None yet',
    categoryBreakdown,
    mealCounts
  };
}

function getMealCategory(meal: MealHistoryItem) {
  if (meal.category) return meal.category;

  const recipe = meal.recipeId
    ? recipeStore.recipes.find((item) => item.id === meal.recipeId)
    : recipeStore.recipes.find((item) => item.name.toLowerCase() === meal.recipeName.toLowerCase());

  if (recipe) return categoryLabel(recipe.proteinType, recipe.category);

  const name = meal.recipeName.toLowerCase();
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

function categoryLabel(proteinType: string, category: string): MealHistoryCategory {
  if (proteinType === 'pork' || category === 'pork') return 'Pork';
  if (proteinType === 'chicken' || category === 'chicken') return 'Chicken';
  if (proteinType === 'beef' || category === 'beef') return 'Beef';
  if (proteinType === 'fish' || category === 'fish') return 'Fish';
  if (proteinType === 'seafood' || category === 'seafood') return 'Seafood';
  if (proteinType === 'vegetable' || category === 'vegetable') return 'Vegetable';
  if (proteinType === 'egg' || category === 'egg') return 'Egg';
  if (proteinType === 'tofu' || category === 'tofu') return 'Tofu';
  if (proteinType === 'canned' || category === 'canned goods') return 'Canned Goods';
  return 'Other';
}

function dishTypeLabel(dishType: string): MealHistoryDishType {
  if (dishType === 'sabaw') return 'Sabaw';
  if (dishType === 'fried') return 'Fried';
  if (dishType === 'ginisa') return 'Ginisa';
  if (dishType === 'gata') return 'Gata';
  if (dishType === 'adobo') return 'Adobo';
  if (dishType === 'grilled') return 'Grilled';
  if (dishType === 'rice meal') return 'Rice Meal';
  if (dishType === 'ulam') return 'Ulam';
  return 'Other';
}

function getDateRange(period: 'week' | 'month' | 'quarter' | 'year') {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === 'week') {
    const mondayOffset = (now.getDay() + 6) % 7;
    start.setDate(now.getDate() - mondayOffset);
    end.setDate(start.getDate() + 6);
  }

  if (period === 'month') {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
  }

  if (period === 'quarter') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    end.setMonth(quarterStartMonth + 3, 0);
  }

  if (period === 'year') {
    start.setMonth(0, 1);
    end.setMonth(11, 31);
  }

  return {
    start: dateString(start),
    end: dateString(end),
    label: `${formatDate(dateString(start))} - ${formatDate(dateString(end))}`
  };
}

function dateString(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>
