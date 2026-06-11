<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Find Ulam</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-body">
        <ion-searchbar v-model="searchTerm" placeholder="Search ingredients"></ion-searchbar>

        <section v-for="group in filteredIngredientCategories" :key="group.name" class="section-block">
          <h2>{{ group.name }}</h2>
          <div class="chip-grid">
            <ion-chip
              v-for="ingredient in group.ingredients"
              :key="ingredient"
              :class="{ 'chip-selected': store.selectedIngredients.includes(ingredient) }"
              @click="store.toggleIngredient(ingredient)"
            >
              {{ titleCase(ingredient) }}
            </ion-chip>
          </div>
        </section>

        <section class="section-block">
          <h2>Preferences</h2>
          <ion-list inset>
            <ion-item>
              <ion-select v-model="store.cookingTime" label="Cooking time" placeholder="Any time">
                <ion-select-option :value="null">Any time</ion-select-option>
                <ion-select-option v-for="option in cookingTimeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select v-model="store.mealType" label="Meal type" placeholder="Any meal">
                <ion-select-option value="">Any meal</ion-select-option>
                <ion-select-option v-for="option in mealTypeOptions" :key="option" :value="option">
                  {{ titleCase(option) }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select v-model="store.category" label="Category" placeholder="Any category">
                <ion-select-option value="">Any category</ion-select-option>
                <ion-select-option v-for="option in categoryOptions" :key="option" :value="option">
                  {{ titleCase(option) }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </section>

        <section class="section-block">
          <h2>Quick Filters</h2>
          <div class="chip-grid">
            <ion-chip :class="{ 'chip-selected': store.quickMealsOnly }" @click="store.quickMealsOnly = !store.quickMealsOnly">
              Quick under 30 min
            </ion-chip>
            <ion-chip :class="{ 'chip-selected': store.noPork }" @click="store.noPork = !store.noPork">
              No pork
            </ion-chip>
            <ion-chip :class="{ 'chip-selected': store.noSeafood }" @click="store.noSeafood = !store.noSeafood">
              No seafood
            </ion-chip>
            <ion-chip :class="{ 'chip-selected': store.vegetableOnly }" @click="store.vegetableOnly = !store.vegetableOnly">
              Vegetable only
            </ion-chip>
            <ion-chip :class="{ 'chip-selected': store.cannedGoodsOnly }" @click="store.cannedGoodsOnly = !store.cannedGoodsOnly">
              Canned goods
            </ion-chip>
            <ion-chip :class="{ 'chip-selected': store.eggMealsOnly }" @click="store.eggMealsOnly = !store.eggMealsOnly">
              Egg meals
            </ion-chip>
          </div>
        </section>

        <div class="form-actions">
          <ion-button fill="outline" class="clear-button" @click="store.clearFilters()">Clear All</ion-button>
          <ion-button router-link="/tabs/suggestions">
            View Suggestions
            <ion-badge color="light">{{ store.suggestions.length }}</ion-badge>
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonBadge,
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import {
  categoryOptions,
  cookingTimeOptions,
  ingredientCategories,
  mealTypeOptions,
  useRecipeStore
} from '@/stores/recipeStore';

const store = useRecipeStore();
const searchTerm = ref('');

const filteredIngredientCategories = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();
  if (!query) return ingredientCategories;

  return ingredientCategories
    .map((group) => ({
      ...group,
      ingredients: group.ingredients.filter((ingredient) => ingredient.includes(query))
    }))
    .filter((group) => group.ingredients.length > 0);
});

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>
