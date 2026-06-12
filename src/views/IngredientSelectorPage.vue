<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Find Ulam</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-body">
        <section class="section-block">
          <p class="eyebrow">Choose one or more</p>
          <h2>Main Category</h2>
          <div class="chip-grid">
            <ion-chip
              v-for="option in categoryOptions"
              :key="option"
              :class="{ 'chip-selected': store.category === option }"
              @click="toggleCategory(option)"
            >
              {{ titleCase(option) }}
            </ion-chip>
          </div>
        </section>

        <section class="section-block">
          <h2>Preferences</h2>
          <ion-list inset>
            <ion-item>
              <ion-select v-model="store.cookingTime" label="Cooking time" placeholder="Any time">
                <ion-select-option v-for="option in cookingTimeOptions" :key="option.label" :value="option.value">
                  {{ option.label }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select v-model="store.mealType" label="Meal type" placeholder="Any meal">
                <ion-select-option v-for="option in mealTypeOptions" :key="option" :value="option">
                  {{ titleCase(option) }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select v-model="store.dishType" label="Dish type" placeholder="Any dish">
                <ion-select-option value="">Any dish</ion-select-option>
                <ion-select-option v-for="option in dishTypeOptions" :key="option" :value="option">
                  {{ titleCase(option) }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select v-model="store.avoidRepeat" label="Avoid repeats" placeholder="Allow repeats">
                <ion-select-option v-for="option in avoidRepeatOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
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
          </div>
        </section>

        <div class="form-actions">
          <ion-button fill="outline" class="clear-button" @click="clearFilters">Clear All</ion-button>
          <ion-button fill="outline" class="clear-button" @click="surpriseMe">Surprise Me</ion-button>
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
import { watch } from 'vue';
import {
  IonBadge,
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  avoidRepeatOptions,
  categoryOptions,
  dishTypeOptions,
  cookingTimeOptions,
  mealTypeOptions,
  useRecipeStore
} from '@/stores/recipeStore';
import { showToast } from '@/utils/toast';

const store = useRecipeStore();
const router = useRouter();

function toggleCategory(category: string) {
  store.category = store.category === category ? '' : category;
}

function surpriseMe() {
  const recipe = store.getSurpriseRecipe();
  if (recipe) router.push(`/tabs/recipes/${recipe.slug}`);
}

async function clearFilters() {
  store.clearFilters();
  await showToast('Filters cleared.', 'medium');
}

watch(
  () => store.avoidRepeat,
  async (value) => {
    if (value) await showToast('Recently eaten meals hidden.', 'medium');
  }
);

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>
