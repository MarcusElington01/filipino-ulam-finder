<template>
  <ion-app>
    <ion-router-outlet />
    <ion-modal :is-open="showOnboarding" :backdrop-dismiss="false" class="onboarding-modal">
      <div class="onboarding-card">
        <p class="eyebrow">Version 2.0.0</p>
        <h1>Welcome to Anong Ulam?</h1>
        <p>Plan your next Filipino ulam, log what you ate, and avoid repeating the same meals too often.</p>

        <ol>
          <li>Find ulam ideas</li>
          <li>Log breakfast, lunch, and dinner</li>
          <li>Track your meal history and avoid repeats</li>
        </ol>

        <ion-button expand="block" size="large" @click="completeOnboarding">Get Started</ion-button>
      </div>
    </ion-modal>
  </ion-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonApp, IonButton, IonModal, IonRouterOutlet } from '@ionic/vue';

const ONBOARDING_KEY = 'anong-ulam:onboarding-complete';
const showOnboarding = ref(localStorage.getItem(ONBOARDING_KEY) !== 'true');

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  showOnboarding.value = false;
}
</script>
