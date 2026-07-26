<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import WorkoutPlanCard from "./WorkoutPlanCard.vue";

export interface WorkoutPlan {
  id: string | number;
  name: string;
  exercises: unknown[];
  color?: string;
}

const props = withDefaults(
  defineProps<{
    plans?: WorkoutPlan[];
    maxItems?: number;
  }>(),
  {
    plans: () => [],
    maxItems: 4,
  }
);

const emit = defineEmits<{
  (e: "plan-click", planId: string | number): void;
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
        :exercise-count="plan.exercises.length"
        :color="plan.color"
        @click="emit('plan-click', plan.id)"
      />

      <!-- Пунктирная кнопка "Ещё / Создать" -->
      <button v-ripple class="more-card" type="button" @click="emit('more-click')">
        <Icon icon="lucide:plus" width="28" height="28" class="more-icon" />
        <span class="more-text">Все программы</span>
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
  color: var(--tg-theme-button-color, #3390ec);
  font-size: 14px;
  font-weight: 600;
  margin: 0 16px 8px 16px;
}

/* Скролл-контейнер */
.workout-gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;

  /* Важно: растягиваем на ширину с учетом отрицательных отступов */
  width: calc(100% + 32px);
  margin-left: -16px;
  margin-right: -16px;

  /* Задаем левый отступ, а правый компенсируем через ::after ниже */
  padding-left: 16px;
  box-sizing: border-box;

  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE / Edge */
}

/* Псевдоэлемент-распорка для ХВОСТА скролла */
/* Он решает проблему, когда padding-right в overflow-x: auto игнорируется браузерами */
.workout-gallery::after {
  content: "";
  flex: 0 0 4px; /* 12px (gap) + 4px = 16px идеального отступа справа */
}

.workout-gallery::-webkit-scrollbar {
  display: none; /* Chrome / Safari / Opera */
}

/* Кнопка "Ещё" в конца списка */
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
