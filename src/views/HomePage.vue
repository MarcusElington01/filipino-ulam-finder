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
          <p class="eyebrow">Filipino ulam finder</p>
          <h1>Anong Ulam?</h1>
          <p class="description">Find Filipino ulam ideas based on your available ingredients.</p>
        </div>
        <ion-button expand="block" size="large" router-link="/tabs/ingredients">Find Ulam</ion-button>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
</script>
