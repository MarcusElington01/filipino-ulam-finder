<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon aria-hidden="true" :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="ingredients" href="/tabs/ingredients">
          <ion-icon aria-hidden="true" :icon="searchOutline" />
          <ion-label>Find</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="favorites" href="/tabs/favorites">
          <ion-icon aria-hidden="true" :icon="heartOutline" />
          <ion-label>Favorites</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { heartOutline, homeOutline, searchOutline } from 'ionicons/icons';
</script>
