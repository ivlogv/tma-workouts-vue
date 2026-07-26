<script setup lang="ts">
import { Icon } from "@iconify/vue";

export interface ActiveWorkout {
  id?: number | string;
  title?: string;
  name?: string;
  duration?: string | number;
  completedExercises?: number;
  totalExercises?: number;
}

withDefaults(
  defineProps<{
    workout?: ActiveWorkout | null;
  }>(),
  {
    workout: null,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

function handleClick() {
  emit("click");
}
</script>

<template>
  <!-- Просто вешаем v-ripple на любой элемент -->
  <div v-if="workout" v-ripple class="active-banner" @click="handleClick">
    <div class="active-banner__main">
      <div class="active-banner__header">
        <span class="pulse-dot"></span>
        <span class="active-banner__title">
          {{ workout.title || workout.name || "Тренировка" }}
        </span>
      </div>

      <div class="active-banner__sub">
        <span v-if="workout.duration" class="meta-item">
          <Icon icon="lucide:timer" width="12" height="12" />
          {{ workout.duration }}
        </span>
        <span
          v-if="
            workout.completedExercises !== undefined &&
            workout.totalExercises !== undefined
          "
          class="meta-item"
        >
          • {{ workout.completedExercises }}/{{ workout.totalExercises }} упражнений
        </span>
      </div>
    </div>

    <div class="active-banner__action">
      <Icon icon="lucide:chevron-right" width="20" height="20" />
    </div>
  </div>
</template>

<style scoped>
.active-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  touch-action: manipulation;

  border: 1px solid color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 40%, transparent);
  animation: border-glow 2.5s infinite ease-in-out;
}

@keyframes border-glow {
  0%, 100% {
    border-color: color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 30%, transparent);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 0%, transparent);
  }
  50% {
    border-color: var(--tg-theme-button-color, #3390ec);
    box-shadow: 0 0 10px 0 color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 35%, transparent);
  }
}

.active-banner__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.active-banner__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  background-color: var(--tg-theme-button-color, #3390ec);
  border-radius: 50%;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 70%, transparent);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 0%, transparent);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 0%, transparent);
  }
}

.active-banner__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #ffffff);
  line-height: 1.2;
}

.active-banner__sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
  margin-left: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.active-banner__action {
  display: flex;
  align-items: center;
  color: var(--tg-theme-button-color, #3390ec);
}
</style>
