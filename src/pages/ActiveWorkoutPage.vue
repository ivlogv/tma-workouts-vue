<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast, showConfirmDialog } from "vant";
import {
  mainButton,
  secondaryButton,
  miniApp,
  themeParams,
} from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";

import AppPage from "@/components/AppPage.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import { useWorkoutStore } from "@/stores/workouts";
import { usePlansStore } from "@/stores/plans";
import type { WorkoutPlanResponse } from "@/shared/api/types";

const router = useRouter();
const route = useRoute();
const workoutStore = useWorkoutStore();
const plansStore = usePlansStore();

const sessionId = computed(() => Number(route.params.id));

// --- Состояния Таймера и Паузы ---
const elapsedTime = ref(0);
const isPaused = ref(false);
let timerInterval: number | null = null;

// --- Состояние выполнения упражнений ---
// Храним количество выполненных подходов для каждого упражнения: { [exerciseId: string]: number }
const completedSetsMap = ref<Record<string, number>>({});

const activeSession = computed(() => workoutStore.activeSession);
const activeWorkout = ref<WorkoutPlanResponse | null>(null);

watch(
  () => activeSession.value?.plan_id, 
  async (planId) => {
    activeWorkout.value = planId ? await plansStore.getPlanById(planId) : null;
  },
  { immediate: true }
);

watch(
  () => activeSession.value,
  (session) => {
    if (session) {
      syncElapsedTime();
    }
  },
  { immediate: true }
);

// Функция для синхронизации прошедшего времени со старта сессии
function syncElapsedTime() {
  const startedAt = activeSession.value?.started_at || activeSession.value?.started_at;
  if (!startedAt) return;

  // Парсим UTC/ISO время из activeSession
  const startMs = new Date(startedAt).getTime();
  const nowMs = Date.now();
  
  // Корректируем прошедшее время в секундах
  const diffInSeconds = Math.floor((nowMs - startMs) / 1000);
  elapsedTime.value = diffInSeconds > 0 ? diffInSeconds : 0;
}


// Парсинг общего количества подходов
function parseTotalSets(setsStr?: string | null): number {
  if (!setsStr) return 1;
  const parsed = parseInt(setsStr.replace(/\D/g, ""), 10);
  return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
}

// Расчет общего прогресса тренировки
const totalExercises = computed(() => activeWorkout.value?.plan_exercises.length || 0);

const completedExercisesCount = computed(() => {
  if (!activeWorkout.value) return 0;
  return activeWorkout.value.plan_exercises.filter((ex) => {
    const total = parseTotalSets(ex.sets);
    const done = completedSetsMap.value[ex.id] || 0;
    return done >= total;
  }).length;
});

const overallProgress = computed(() => {
  if (totalExercises.value === 0) return 0;
  return Math.round((completedExercisesCount.value / totalExercises.value) * 100);
});

// Форматирование времени MM:SS
const formattedTime = computed(() => {
  const mins = Math.floor(elapsedTime.value / 60);
  const secs = elapsedTime.value % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
});

// --- Таймер ---
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  // 1. Сразу синхронизируем время при старте/восстановлении
  syncElapsedTime();

  // 2. Инкрементируем каждую секунду
  timerInterval = window.setInterval(() => {
    if (!isPaused.value) {
      elapsedTime.value++;
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// --- Кнопки Telegram (MainButton & SecondaryButton) ---
function updateSecondaryButtonText() {
  if (!secondaryButton.isMounted()) return;
  if (isPaused.value) {
    secondaryButton.setText("Продолжить");
  } else {
    secondaryButton.setText("Пауза");
  }
}

function setupTelegramButtons() {
  if (!mainButton.isMounted() || !secondaryButton.isMounted()) return;

  mainButton.offClick(handleFinishWorkout);
  secondaryButton.offClick(togglePause);

  // MainButton: Завершение
  mainButton.setText("Завершить");
  mainButton.enableShineEffect();
  mainButton.enable();
  mainButton.show();

  // SecondaryButton: Пауза
  miniApp.setBottomBarColor("secondary_bg_color");
  const appBgColor = themeParams.bgColor() || "#1c1c1e";
  const buttonTextColor = themeParams.buttonColor() || "#3390ec";
  secondaryButton.setBgColor(appBgColor as `#${string}`);
  secondaryButton.setTextColor(buttonTextColor as `#${string}`);
  secondaryButton.setParams({ position: "left" });
  updateSecondaryButtonText();
  secondaryButton.enable();
  secondaryButton.show();

  mainButton.onClick(handleFinishWorkout);
  secondaryButton.onClick(togglePause);
}

function togglePause() {
  triggerHaptic("light");
  isPaused.value = !isPaused.value;
  updateSecondaryButtonText();
}

// --- Клик по упражнению (Увеличение подходов) ---
function handleExerciseClick(exerciseId: string, setsStr?: string | null) {
  if (isPaused.value) {
    showToast({ message: "Тренировка на паузе", position: "top" });
    return;
  }

  const total = parseTotalSets(setsStr);
  const currentDone = completedSetsMap.value[exerciseId] || 0;

  if (currentDone < total) {
    completedSetsMap.value[exerciseId] = currentDone + 1;
    triggerHaptic("light");

    // Если закрыли последний подход
    if (currentDone + 1 === total) {
      triggerHaptic("heavy");
    }
  } else {
    // Повторный клик после полного выполнения — сброс
    completedSetsMap.value[exerciseId] = 0;
    triggerHaptic("medium");
  }
}

// --- Выход и Завершение ---
async function handleExit() {
  triggerHaptic("medium");
  try {
    await showConfirmDialog({
      title: "Выйти из тренировки?",
      message: "Прогресс текущей сессии не будет сохранен.",
      confirmButtonText: "Выйти",
      cancelButtonText: "Отмена",
      confirmButtonColor: "var(--van-danger-color)",
    });
    router.back();
  } catch {
    // Отмена выхода
  }
}

async function handleFinishWorkout() {
  triggerHaptic("medium");
  try {
    if (mainButton.isMounted()) mainButton.showLoader();
    stopTimer();

    await workoutStore.finishWorkout(sessionId.value.toString()
      // В будущем передаем детализацию выполненных сетов {
      // duration_seconds: elapsedTime.value,
    // }
  );

    showToast({ message: "Тренировка завершена! 💪", type: "success" });
    router.replace("/history");
  } catch (e) {
    showToast({ message: "Не удалось сохранить тренировку", position: "top" });
    console.error("Ошибка завершения тренировки:", e);
    startTimer();
  } finally {
    if (mainButton.isMounted()) mainButton.hideLoader();
  }
}

onMounted(async () => {
  if (sessionId.value) {
    await workoutStore.loadSession(sessionId.value);

    if (activeSession.value?.plan_id) {
      await plansStore.getPlanById(activeSession.value.plan_id);
    }
  }
  startTimer();
  setupTelegramButtons();
});

onUnmounted(() => {
  stopTimer();
  if (mainButton.isMounted()) {
    mainButton.offClick(handleFinishWorkout);
    mainButton.hideLoader();
    mainButton.hide();
  }
  if (secondaryButton.isMounted()) {
    secondaryButton.offClick(togglePause);
    secondaryButton.hide();
  }
});
</script>

<template>
  <AppPage title="" :back="false">
    <ScreenHeader :title="activeWorkout?.name ?? 'Тренировка'" @back="handleExit" />

    <div v-if="activeWorkout" class="active-workout-container">
      <!-- 1. Компактная карточка таймера и общего прогресса -->
      <div class="timer-card" :class="{ 'timer-card--paused': isPaused }">
        <div class="timer-display">
          {{ formattedTime }}
          <span v-if="isPaused" class="paused-badge">Пауза</span>
        </div>

        <div class="progress-bar-wrapper">
          <div class="progress-bar-fill" :style="{ width: `${overallProgress}%` }"></div>
        </div>

        <div class="stats-row">
          <span>{{ completedExercisesCount }} из {{ totalExercises }} упражнений</span>
          <span>{{ overallProgress }}%</span>
        </div>
      </div>

      <!-- 2. Единый блок упражнений (Vant inset style) -->
      <div class="exercises-section">
        <div class="section-label">Упражнения</div>

        <van-cell-group inset class="workout-exercises-group">
          <div
            v-for="(planExercise) in activeWorkout.plan_exercises"
            :key="planExercise.id"
            class="exercise-item-wrapper"
            :class="{
              'is-completed': (completedSetsMap[planExercise.id] || 0) >= parseTotalSets(planExercise.sets),
            }"
            @click="handleExerciseClick(planExercise.id.toString(), planExercise.sets)"
          >
            <!-- Тонкий кастомный прогресс-бар подходов внизу карточки -->
            <div
              v-if="(completedSetsMap[planExercise.id] || 0) < parseTotalSets(planExercise.sets) && (completedSetsMap[planExercise.id] || 0) > 0"
              class="sets-progress-line"
              :style="{
                width: `${((completedSetsMap[planExercise.id] || 0) / parseTotalSets(planExercise.sets)) * 100}%`,
              }"
            ></div>

            <div class="exercise-item-content">
              <div class="exercise-info">
                <span class="exercise-name">{{ planExercise.exercise.name }}</span>
                <span class="exercise-meta">
                  {{ completedSetsMap[planExercise.id] || 0 }} / {{ parseTotalSets(planExercise.sets) }} подх.
                  <template v-if="planExercise.reps">• {{ planExercise.reps }} повт.</template>
                  <template v-if="planExercise.weight">• {{ planExercise.weight }}</template>
                </span>
              </div>

              <!-- Чекбокс / Статус -->
              <div class="exercise-status">
                <div
                  class="status-checkbox"
                  :class="{
                    checked: (completedSetsMap[planExercise.id] || 0) >= parseTotalSets(planExercise.sets),
                  }"
                >
                  <Icon
                    v-if="(completedSetsMap[planExercise.id] || 0) >= parseTotalSets(planExercise.sets)"
                    icon="mdi:check"
                    width="18"
                    height="18"
                    color="#ffffff"
                  />
                  <span v-else-if="(completedSetsMap[planExercise.id] || 0) > 0" class="sets-count-text">
                    {{ completedSetsMap[planExercise.id] }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
  </AppPage>
</template>

<style scoped>
.active-workout-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

/* Компактный Hero-блок */
.timer-card {
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.2s ease;
}

.timer-card--paused {
  opacity: 0.7;
}

.timer-display {
  font-size: 2.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--tg-theme-text-color, #ffffff);
  line-height: 1;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.paused-badge {
  font-size: 0.75rem;
  background: #ff9500;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 8px;
  text-transform: uppercase;
}

.progress-bar-wrapper {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background: #3390ec;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stats-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--tg-theme-hint-color, #8e8e93);
}

/* Список упражнений */
.exercises-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--tg-theme-hint-color, #8e8e93);
  padding-left: 16px;
}

.workout-exercises-group {
  margin: 0 !important;
  overflow: hidden;
  background: var(--tg-theme-bg-color, #1c1c1e) !important;
}

.exercise-item-wrapper {
  position: relative;
  padding: 14px 16px;
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

.exercise-item-wrapper:last-child {
  border-bottom: none;
}

.exercise-item-wrapper:active {
  background: rgba(255, 255, 255, 0.05);
}

.exercise-item-wrapper.is-completed .exercise-name {
  text-decoration: line-through;
  opacity: 0.5;
}

.exercise-item-wrapper.is-completed .exercise-meta {
  opacity: 0.4;
}

.exercise-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exercise-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.exercise-meta {
  font-size: 0.8125rem;
  color: var(--van-gray-6, #8e8e93);
}

/* Чекбокс */
.status-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--van-gray-6, #8e8e93);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.status-checkbox.checked {
  background: #34c759;
  border-color: #34c759;
}

.sets-count-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #3390ec;
}

/* Линия подходов снизу карточки */
.sets-progress-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #3390ec;
  transition: width 0.25s ease;
}
</style>
