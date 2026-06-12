<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Suggestions</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-body">
        <div class="summary-row">
          <div>
            <p class="eyebrow">Filtered ideas</p>
            <h1>{{ store.suggestions.length }} ulam ideas</h1>
          </div>
          <ion-button fill="outline" router-link="/tabs/ingredients">Edit</ion-button>
        </div>

        <p v-if="store.suggestions.length > 0" class="result-count">
          Showing {{ visibleSuggestions.length }} of {{ store.suggestions.length }}
        </p>

        <ion-card v-for="match in visibleSuggestions" :key="match.recipe.id" button @click="openRecipe(match.recipe.slug)">
          <ion-card-header>
            <div class="card-title-row">
              <ion-card-title>{{ match.recipe.name }}</ion-card-title>
            </div>
            <ion-badge v-if="match.recentMealLabel" color="secondary" class="history-badge">
              {{ match.recentMealLabel }}
            </ion-badge>
          </ion-card-header>
          <ion-card-content>
            <p>{{ match.recipe.description }}</p>
            <div class="badge-row">
              <ion-badge color="tertiary">{{ titleCase(match.recipe.mealType) }}</ion-badge>
              <ion-badge color="medium">{{ match.recipe.cookingTimeMinutes }} min</ion-badge>
              <ion-badge color="primary">{{ titleCase(match.recipe.category) }}</ion-badge>
              <ion-badge color="secondary">{{ titleCase(match.recipe.dishType) }}</ion-badge>
              <ion-badge color="warning">{{ titleCase(match.recipe.difficulty) }}</ion-badge>
            </div>
            <p class="reason-text">{{ match.reasonText }}</p>
            <p class="source">Source: {{ match.recipe.sourceName }}</p>
            <ion-button fill="outline" class="load-more-button" @click.stop="markCooked(match.recipe, store.mealType)">
              I cooked this
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card v-if="store.suggestions.length === 0" class="empty-state">
          <ion-card-content>
            <h2>No ulam found</h2>
            <p>Try changing your filters or removing avoid-repeat options.</p>
            <ion-button @click="clearFilters">Clear Filters</ion-button>
          </ion-card-content>
        </ion-card>

        <ion-button v-if="canLoadMore" expand="block" fill="outline" class="load-more-button" @click="loadMore">
          Load more recipes
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { useRecipeStore } from '@/stores/recipeStore';
import { useCookedMeal } from '@/composables/useCookedMeal';
import { showToast } from '@/utils/toast';

const router = useRouter();
const store = useRecipeStore();
const { markCooked } = useCookedMeal();
const pageSize = 12;
const visibleCount = ref(pageSize);
const visibleSuggestions = computed(() => store.suggestions.slice(0, visibleCount.value));
const canLoadMore = computed(() => visibleCount.value < store.suggestions.length);

watch(
  () => store.suggestions.map((match) => match.recipe.id).join('|'),
  () => {
    visibleCount.value = pageSize;
  }
);

function openRecipe(slug: string) {
  router.push(`/tabs/recipes/${slug}`);
}

function loadMore() {
  visibleCount.value += pageSize;
}

async function clearFilters() {
  store.clearFilters();
  await showToast('Filters cleared.', 'medium');
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>
