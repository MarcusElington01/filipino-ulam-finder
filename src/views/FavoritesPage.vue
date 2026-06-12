<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Favorites</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-body">
        <ion-card v-for="recipe in store.favoriteRecipes" :key="recipe.id">
          <ion-card-header>
            <ion-card-title>{{ recipe.name }}</ion-card-title>
            <ion-card-subtitle>{{ recipe.cookingTimeMinutes }} min</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>{{ recipe.description }}</p>
            <div class="card-actions">
              <ion-button fill="outline" :router-link="`/tabs/recipes/${recipe.slug}`">View</ion-button>
              <ion-button color="danger" fill="clear" @click="removeFavorite(recipe.id)">Remove</ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card v-if="store.favoriteRecipes.length === 0" class="empty-state">
          <ion-card-content>
            <h2>No favorites yet</h2>
            <p>Save recipes from the details page and they will stay here offline.</p>
            <ion-button router-link="/tabs/ingredients">Find Ulam</ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
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
import { showToast } from '@/utils/toast';

const store = useRecipeStore();

async function removeFavorite(recipeId: string) {
  store.toggleFavorite(recipeId);
  await showToast('Removed from favorites.', 'medium');
}
</script>
