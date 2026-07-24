<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { initData } from "@tma.js/sdk-vue";
import axios from "axios";

import AppPage from "@/components/AppPage.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import BottomNav from "@/components/BottomNav.vue";
import StatBlock from "@/components/StatBlock.vue";
import RecentWorkouts from "@/components/RecentWorkouts.vue";

import { api } from "@/shared/api";

const router = useRouter();

const isAuthLoading = ref(false);

const daysInRow = ref(42);
const thisWeek = ref(5);
const totalWorkouts = ref(128); // Новое поле: всего тренировок
const avgDuration = ref(45);
// Достаём имя пользователя из initData Telegram
const userName = computed(() => {
  const user = initData.user();
  return user?.first_name || "Атлет";
});

// Первая буква имени для аватарки
const userLetter = computed(() => {
  return userName.value.charAt(0).toUpperCase();
});

// Динамический заголовок с приветствием
const headerTitle = computed(() => `Привет, ${userName.value}! 👋`);

// Выполняем авторизацию при загрузке страницы
onMounted(async () => {
  try {
    isAuthLoading.value = true;

    // Запрос на эндпоинт авторизации Telegram
    const response = await api.post("/auth/telegram");
    console.log("Авторизация прошла успешно:", response.data);
  } catch (error) {
    console.error("Ошибка при авторизации:", error);

    let errorMessage = "Ошибка авторизации";
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.detail || error.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast({
      type: "fail",
      message: errorMessage,
    });
  } finally {
    isAuthLoading.value = false;
  }
});

// Моковые данные для последних тренировок
const workouts = [
  {
    id: 1,
    name: "Full Body Beginner",
    date: "22.03.2026",
    icon: "mdi:dumbbell",
  },
  {
    id: 2,
    name: "Core Strength",
    date: "20.03.2026",
    icon: "mdi:dumbbell",
  },
  {
    id: 3,
    name: "Full Body Beginner",
    date: "16.03.2026",
    icon: "mdi:dumbbell",
  },
];

const selectedId = ref<number | undefined>(undefined);

function toggleSelect(id: number) {
  selectedId.value = selectedId.value === id ? undefined : id;
}

function handleStart() {
  if (selectedId.value) {
    router.push(`/workouts/${selectedId.value}`);
  } else {
    router.push("/workouts");
  }
}

function handleAvatarClick() {
  showToast(`Профиль: ${userName.value}`);
}
</script>

<template>
  <AppPage title="" :back="false">
    <ScreenHeader
      :title="headerTitle"
      subtitle="Готов к сегодняшней тренировке?"
      :letter="userLetter"
      @avatar-click="handleAvatarClick"
    />

    <!-- <StatsBlock :days-in-row="daysInRow" :this-week="thisWeek" />

    <StatsBlock :days-in-row="daysInRow" :this-week="thisWeek" /> -->

    <StatBlock
      :days-in-row="daysInRow"
      :this-week="thisWeek"
      :total-workouts="totalWorkouts"
      :avg-duration="avgDuration"
    />

    <RecentWorkouts
      :workouts="workouts"
      :selected-id="selectedId"
      @select="toggleSelect"
    />

    <van-button
      type="primary"
      block
      :loading="isAuthLoading"
      loading-text="Авторизация..."
      @click="handleStart"
    >
      {{ selectedId ? "Перейти к тренировке" : "Выбрать тренировку" }}
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
