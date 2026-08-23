<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import type { WorkoutSessionResponse } from "@/shared/api/types";

const props = withDefaults(
  defineProps<{
    workout?: WorkoutSessionResponse | null;
  }>(),
  {
    workout: null,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

// --- Таймер длительности ---
const elapsedSeconds = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

function updateElapsedTime() {
  if (!props.workout?.started_at) {
    elapsedSeconds.value = 0;
    return;
  }
  const start = new Date(props.workout.started_at).getTime();
  const now = Date.now();
  elapsedSeconds.value = Math.max(0, Math.floor((now - start) / 1000));
}

onMounted(() => {
  updateElapsedTime();
  timerInterval = setInterval(updateElapsedTime, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// Форматирование времени (например, "12:45" или "1:05:20")
const formattedDuration = computed(() => {
  const totalSec = elapsedSeconds.value;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
});

// --- Вычисление количества упражнений ---
const exercisesSummary = computed(() => {
  if (!props.workout?.sets || props.workout.sets.length === 0) {
    return "0 упражнений";
  }

  // Считаем уникальные exercise_id из имеющихся подходов
  const uniqueExerciseIds = new Set(
    props.workout.sets.map((s) => s.exercise_id),
  );
  const count = uniqueExerciseIds.size;

  // Небольшое склонение слова для красоты
  if (count === 1) return "1 упражнение";
  if (count >= 2 && count <= 4) return `${count} упражнения`;
  return `${count} упражнений`;
});

// Название тренировки или фоллбэк
const sessionTitle = computed(() => {
  return props.workout?.title || "Тренировка";
});

function handleClick() {
  triggerHaptic("light");
  emit("click");
}
</script>

<template>
  <div v-if="workout" v-ripple class="active-banner" @click="handleClick">
    <div class="active-banner__main">
      <div class="active-banner__header">
        <span class="pulse-dot"></span>
        <span class="active-banner__title">
          {{ sessionTitle }}
        </span>
      </div>

      <div class="active-banner__sub">
        <span class="meta-item">
          <Icon icon="lucide:timer" width="12" height="12" />
          {{ formattedDuration }}
        </span>
        <span class="meta-item">
          • {{ exercisesSummary }}
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
  margin-bottom: 0;
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
