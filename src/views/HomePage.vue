<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Anong Ulam?</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <section class="home-hero ion-padding">
        <div>
          <p class="eyebrow">Plan your next ulam</p>
          <h1>Anong Ulam?</h1>
          <p class="description">Browse Filipino ulam ideas by category, meal type, cooking time, and what you recently ate.</p>
        </div>

        <div class="home-actions">
          <ion-button expand="block" size="large" router-link="/tabs/ingredients">Find Ulam</ion-button>
          <ion-button expand="block" size="large" fill="outline" router-link="/tabs/history">Log Meal</ion-button>
        </div>

        <div class="home-highlights">
          <div>
            <strong>Pick a category</strong>
            <span>Chicken, fish, vegetable, canned goods, and more.</span>
          </div>
          <div>
            <strong>Avoid repeats</strong>
            <span>History badges show what you ate recently.</span>
          </div>
          <div>
            <strong>Track your mix</strong>
            <span>See weekly, monthly, quarterly, and yearly ulam patterns.</span>
          </div>
        </div>

        <section class="section-block">
          <h2>Today's Suggested Ulam</h2>
          <ion-card v-for="item in todaySuggestions" :key="item.mealType">
            <ion-card-header>
              <ion-card-subtitle>{{ titleCase(item.mealType) }}</ion-card-subtitle>
              <ion-card-title>{{ item.match?.recipe.name ?? 'No suggestion yet' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content v-if="item.match">
              <div class="badge-row">
                <ion-badge color="primary">{{ titleCase(item.match.recipe.category) }}</ion-badge>
                <ion-badge color="secondary">{{ titleCase(item.match.recipe.dishType) }}</ion-badge>
              </div>
              <p class="reason-text">{{ item.match.reasonText }}</p>
              <div class="card-actions">
                <ion-button fill="outline" :router-link="`/tabs/recipes/${item.match.recipe.slug}`">View Recipe</ion-button>
                <ion-button @click="markCooked(item.match.recipe, item.mealType)">I cooked this</ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </section>

        <section class="section-block">
          <ion-card class="about-card">
            <ion-card-header>
              <ion-card-subtitle>About</ion-card-subtitle>
              <ion-card-title>Anong Ulam?</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="badge-row">
                <ion-badge color="primary">Version 2.0.0</ion-badge>
                <ion-badge color="tertiary">Offline-first</ion-badge>
              </div>
              <p>An offline-first Filipino ulam planner that helps you find meal ideas, log what you ate, and avoid repeating the same ulam too often.</p>
              <p class="source">All data is stored locally on your device.</p>
            </ion-card-content>
          </ion-card>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
import { useCookedMeal } from '@/composables/useCookedMeal';
import { useRecipeStore } from '@/stores/recipeStore';

const store = useRecipeStore();
const { markCooked } = useCookedMeal();
const todaySuggestions = computed(() => store.getTodaySuggestions());

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
</script>
