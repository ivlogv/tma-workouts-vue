<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import WorkoutPlanCard from "./WorkoutPlanCard.vue";
import type { WorkoutPlanResponse } from "@/shared/api/types"; // Путь к вашим типам API

const props = withDefaults(
  defineProps<{
    plans?: WorkoutPlanResponse[];
    maxItems?: number;
  }>(),
  {
    plans: () => [],
    maxItems: 4,
  }
);

const emit = defineEmits<{
  (e: "plan-click", planId: number): void;
  (e: "more-click"): void;
}>();

const displayPlans = computed(() => props.plans.slice(0, props.maxItems));
</script>

<template>
  <div class="plans-wrapper">
    <div class="plans-title">Мои программы</div>

    <div class="workout-gallery">
      <!-- Список карточек программ -->
      <WorkoutPlanCard
        v-for="plan in displayPlans"
        :key="plan.id"
        :id="plan.id"
        :name="plan.name"
        :exercise-count="plan.plan_exercises?.length ?? 0"
        :color="plan.color"
        :subtitle="plan.description"
        @click="emit('plan-click', plan.id)"
      />

      <!-- Пунктирная кнопка "Ещё / Все программы" -->
      <button v-ripple class="more-card" type="button" @click="emit('more-click')">
        <Icon icon="lucide:plus" width="28" height="28" class="more-icon" />
        <span class="more-text">{{ plans?.length ? "Все программы" : "Добавить программу" }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.plans-wrapper {
  margin-bottom: 16px;
  width: 100%;
  overflow: visible;
}

.plans-title {
  color: var(--tg-theme-accent-text-color, #3390ec);
  font-size: 14px;
  font-weight: 600;
  margin: 0 16px 8px 16px;
}

/* Скролл-контейнер */
.workout-gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;

  /* Растягиваем с учетом боковых отступов */
  width: calc(100% + 32px);
  margin-left: -16px;
  margin-right: -16px;

  /* Задаем левый отступ, а правый компенсируем через ::after */
  padding-left: 16px;
  box-sizing: border-box;

  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE / Edge */
}

/* Псевдоэлемент-распорка для хвоста скролла */
.workout-gallery::after {
  content: "";
  flex: 0 0 16px;
}

.workout-gallery::-webkit-scrollbar {
  display: none; /* Chrome / Safari / Opera */
}

/* Кнопка "Ещё" в конце списка */
.more-card {
  min-width: 130px;
  width: 130px;
  flex: 0 0 130px;
  background-color: var(--tg-theme-secondary-bg-color, #1c1c1e);
  border: 2px dashed var(--tg-theme-hint-color, rgba(255, 255, 255, 0.2));
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  cursor: pointer;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.more-icon {
  color: var(--tg-theme-hint-color, #8e8e93);
}

.more-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--tg-theme-hint-color, #8e8e93);
}
</style>
