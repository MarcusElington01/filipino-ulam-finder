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
            <p class="eyebrow">Best matches first</p>
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
              <ion-badge :color="matchColor(match.matchScore)">{{ match.matchScore }}%</ion-badge>
            </div>
            <ion-card-subtitle>{{ match.matchLabel }} match</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>{{ match.recipe.description }}</p>
            <div class="badge-row">
              <ion-badge color="medium">{{ match.recipe.cookingTimeMinutes }} min</ion-badge>
              <ion-badge color="warning">{{ titleCase(match.recipe.difficulty) }}</ion-badge>
            </div>
            <div class="mini-group">
              <strong>Matched</strong>
              <span>{{ formatList(match.matchedIngredients) }}</span>
            </div>
            <div class="mini-group">
              <strong>Missing</strong>
              <span>{{ match.missingIngredients.length }} required | {{ formatList(match.missingIngredients) }}</span>
            </div>
            <p class="source">Source: {{ match.recipe.sourceName }}</p>
          </ion-card-content>
        </ion-card>

        <ion-card v-if="store.suggestions.length === 0">
          <ion-card-content>No strong ulam match found. Try adding more ingredients or removing filters.</ion-card-content>
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
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { useRecipeStore } from '@/stores/recipeStore';

const router = useRouter();
const store = useRecipeStore();
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

function formatList(items: string[]) {
  return items.length ? items.map(titleCase).join(', ') : 'None';
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function matchColor(score: number) {
  if (score >= 90) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 40) return 'warning';
  return 'medium';
}
</script>
