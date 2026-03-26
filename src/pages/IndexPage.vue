<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import BottomNav from "@/components/BottomNav.vue";
import StatsBlock from "@/components/StatsBlock.vue";

import { ref } from "vue";
// import axios from "axios";

import { BarbellOutline, Body } from "@vicons/ionicons5";

// import { retrieveRawInitData } from "@tma.js/sdk-vue";
import RecentWorkouts from "@/components/RecentWorkouts.vue";
// import { useRoute, useRouter } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()
// const route = useRoute()

// function isActive(path: string) {
//   return route.path === path
// }

// function navigate(path: string) {
//   router.push(path)
// }

// const initDataRaw = retrieveRawInitData();

// base api instance with the base URL and default headers
// const api = axios.create({
//   baseURL: "http://localhost:8000/api",
//   headers: {
//     Authorization: `tma ${initDataRaw}`,
//   },
// });

// async function fetchData() {}

const daysInRow = ref(42);
const thisWeek = ref(5);

// mock data for recent workout sessions, replace with real data from API
const workouts = [
  {
    id: 1,
    name: "Full Body Beginner",
    date: "22.03.2026",
    icon: BarbellOutline,
  },
  { id: 2, name: "Core Strength", date: "20.03.2026", icon: Body },
  {
    id: 3,
    name: "Full Body Beginner",
    date: "16.03.2026",
    icon: BarbellOutline,
  },
];

const selectedId = ref<number | undefined>(undefined);

function toggleSelect(id: number) {
  selectedId.value = selectedId.value === id ? undefined : id;
}

function handleStart() {
  if (selectedId.value) {
    // navigate to workout page
    router.push('/workouts/' + selectedId.value)
  } else {
    // show error message
    router.push('/workouts');
  }
}
</script>

<template>
  <AppPage title="" :back="false">
    <StatsBlock :daysInRow="daysInRow" :thisWeek="thisWeek" />

    <RecentWorkouts
      :workouts="workouts"
      :selected-id="selectedId"
      @select="toggleSelect"
    />

    <van-button type="primary" @click="handleStart">
      {{selectedId ? 'Перейти к тренировке' : 'Выбрать тренировку'}}
    </van-button>

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped>
.card {
  background: var(--tg-theme-bg-color, #1c1c1c);
  border-radius: 12px;
  color: var(--tg-theme-text-color, #fff);
  font-family: sans-serif;
}

.card__title {
  color: var(--tg-theme-accent-text-color, #fff);
  font-size: 14px;
  font-weight: 600;
  line-height: 0.9;
  margin: 16px 12px 12px 12px;
}

.title {
  color: var(--tg-theme-text-color);
}

.icon {
  color: var(--tg-theme-text-color);
}
</style>
