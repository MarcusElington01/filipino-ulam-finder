<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ recipe?.name ?? 'Recipe' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="recipe" class="page-body details-page">
        <div class="details-header">
          <div class="badge-row">
            <ion-badge color="primary">{{ titleCase(recipe.category) }}</ion-badge>
            <ion-badge color="medium">{{ recipe.cookingTimeMinutes }} min</ion-badge>
            <ion-badge color="warning">{{ titleCase(recipe.difficulty) }}</ion-badge>
          </div>
          <h1>{{ recipe.name }}</h1>
          <p>{{ recipe.description }}</p>
          <ion-button expand="block" @click="store.toggleFavorite(recipe.id)">
            {{ store.isFavorite(recipe.id) ? 'Remove from Favorites' : 'Save to Favorites' }}
          </ion-button>
        </div>

        <ion-list inset>
          <ion-item>
            <ion-label>Cooking time</ion-label>
            <ion-note slot="end">{{ recipe.cookingTimeMinutes }} minutes</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Difficulty</ion-label>
            <ion-note slot="end">{{ titleCase(recipe.difficulty) }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Method</ion-label>
            <ion-note slot="end">{{ titleCase(recipe.cookingMethod) }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Meal type</ion-label>
            <ion-note slot="end">{{ titleCase(recipe.mealType) }}</ion-note>
          </ion-item>
        </ion-list>

        <section class="section-block">
          <h2>Ingredients</h2>
          <div class="chip-grid">
            <ion-chip v-for="ingredient in recipe.ingredients" :key="ingredient" color="primary">
              {{ titleCase(ingredient) }}
            </ion-chip>
            <ion-chip v-for="ingredient in recipe.optionalIngredients" :key="ingredient">
              Optional: {{ titleCase(ingredient) }}
            </ion-chip>
          </div>
        </section>

        <section class="section-block">
          <h2>Missing Ingredients</h2>
          <div class="chip-grid" v-if="missingIngredients.length">
            <ion-chip v-for="ingredient in missingIngredients" :key="ingredient" color="warning">
              {{ titleCase(ingredient) }}
            </ion-chip>
          </div>
          <ion-card v-else>
            <ion-card-content>You have the required ingredients selected for this recipe.</ion-card-content>
          </ion-card>
        </section>

        <section class="section-block">
          <h2>Steps</h2>
          <ion-list inset>
            <ion-item v-for="(step, index) in recipe.steps" :key="step">
              <ion-badge slot="start">{{ index + 1 }}</ion-badge>
              <ion-label class="ion-text-wrap">{{ step }}</ion-label>
            </ion-item>
          </ion-list>
        </section>

        <ion-card>
          <ion-card-content>
            <p><strong>Source attribution:</strong> {{ recipe.sourceName }}</p>
            <a :href="recipe.sourceUrl" target="_blank" rel="noreferrer">{{ recipe.sourceUrl }}</a>
            <p class="disclaimer">Recipe details are summarized for app demo purposes. Please visit the source link for the full original recipe.</p>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="page-body">
        <ion-card>
          <ion-card-content>Recipe not found.</ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { useRecipeStore } from '@/stores/recipeStore';

const route = useRoute();
const store = useRecipeStore();
const recipe = computed(() => store.getRecipeBySlug(String(route.params.slug)));
const missingIngredients = computed(() => {
  if (!recipe.value) return [];
  const match = store.suggestions.find((suggestion) => suggestion.recipe.id === recipe.value?.id);
  if (match) return match.missingIngredients;

  return recipe.value.ingredients.filter((ingredient) => !store.selectedIngredients.includes(ingredient));
});

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>
