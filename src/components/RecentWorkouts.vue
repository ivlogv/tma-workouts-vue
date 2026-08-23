<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import type { WorkoutSessionResponse } from "@/shared/api/types";

const props = withDefaults(
  defineProps<{
    workouts?: WorkoutSessionResponse[] | null;
    selectedId?: number;
    maxItems?: number;
    isLoading?: boolean;
  }>(),
  {
    workouts: null,
    maxItems: 3,
    isLoading: false,
  }
);

const emit = defineEmits<{
  (e: "select", id: number): void;
  (e: "open-history"): void;
}>();

// Форматирование даты в понятный формат (например, "28 июля, 18:30")
function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Получение названия: сперва кастомное имя, затем заголовок плана, иначе "Тренировка"
function getWorkoutName(session: WorkoutSessionResponse): string {
  return session.title || "Тренировка";
}

const displayedWorkouts = computed(() => {
  return [...(props.workouts || [])]
    .sort((a, b) => {
      const dateA = new Date(a.started_at || 0).getTime();
      const dateB = new Date(b.started_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, props.maxItems);
});

function handleClick(id: number) {
  triggerHaptic("light");
  emit("select", id);
}

function handleHistoryClick() {
  triggerHaptic("light");
  emit("open-history");
}
</script>

<template>
  <div class="workouts-wrapper">
    <div class="workouts-title">Последние тренировки</div>

    <!-- Состояние загрузки -->
    <Transition name="fade-expand" mode="out-in">
      <div v-if="isLoading" key="loading" class="skeleton-container">
        <van-cell-group inset :border="false">
          <van-cell class="skeleton-cell">
            <template #title>
              <div class="skeleton-line skeleton-title"></div>
            </template>
            <template #label>
              <div class="skeleton-line skeleton-date"></div>
            </template>
            <template #right-icon>
              <div class="skeleton-line skeleton-icon"></div>
            </template>
          </van-cell>

          <!-- Скелетон кнопки "Вся история" -->
          <van-cell class="history-cell">
            <template #title>
              <div class="skeleton-line skeleton-history"></div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="Array.isArray(workouts) &&workouts.length === 0" key="empty" class="empty">Нет завершённых тренировок</div>

      <!-- Список ячеек -->
      <div v-else key="content">
        <van-cell-group inset :border="false">
          <van-cell v-for="w in displayedWorkouts" :key="w.id" v-ripple :class="{ active: w.id === selectedId }"
            @click="handleClick(w.id)">
            <template #title>
              <div class="workout-name">{{ getWorkoutName(w) }}</div>
            </template>

            <template #label>
              <div class="workout-date">
                {{ formatDate(w.finished_at || w.started_at) }}
              </div>
            </template>

            <template #right-icon>
              <div class="workout-icon">
                <Icon icon="lucide:chevron-right" width="18" height="18" />
              </div>
            </template>
          </van-cell>

          <!-- Инлайн-кнопка перехода ко всей истории -->
          <van-cell v-ripple class="history-cell" @click="handleHistoryClick">
            <template #title>
              <div class="history-content">
                <span>Вся история</span>
                <Icon icon="lucide:history" width="16" height="16" />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.workouts-wrapper {
  background-color: var(--tg-theme-bg-color);
  border-radius: 14px;
}

.workouts-title {
  color: var(--tg-theme-accent-text-color, #3390ec);
  font-size: 14px;
  font-weight: 600;
  margin: 0 16px 8px 16px;
  padding-top: 12px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-cell) {
  background-color: var(--tg-theme-bg-color, #1c1c1e);
  color: var(--tg-theme-text-color, #ffffff);
  padding: 12px 16px;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Разделительная линия между ячейками */
:deep(.van-cell::after) {
  border-bottom-color: rgba(255, 255, 255, 0.06);
  left: 16px;
  right: 16px;
}

.workout-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #ffffff);
}

.workout-date {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
  margin-top: 2px;
}

.workout-icon {
  display: flex;
  align-items: center;
  margin-left: 8px;
  color: var(--tg-theme-hint-color, #8e8e93);
}

:deep(.van-cell.active) .workout-name,
:deep(.van-cell.active) .workout-icon {
  color: var(--tg-theme-button-color, #3390ec);
}

.history-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--tg-theme-link-color, #3390ec);
}

.empty {
  padding: 16px;
  text-align: center;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 14px;
}

/* --- Скелетон анимация и стили --- */
.skeleton-line {
  /* Базовый цвет основываем на теме Telegram, а сверху накладываем градиентную волну */
  background: linear-gradient(
    90deg,
    var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05)) 25%,
    var(--tg-theme-hint-color, rgba(255, 255, 255, 0.15)) 37%,
    var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05)) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: 6px;
  /* Для мягкого смешивания с фоном карточки */
  opacity: 0.6;
}

.skeleton-title {
  width: 120px;
  height: 14px;
}

.skeleton-date {
  width: 80px;
  height: 12px;
  margin-top: 6px;
}

.skeleton-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.skeleton-history {
  width: 100px;
  height: 14px;
  margin: 0 auto;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* --- Плавные анимации смены состояний --- */
.fade-expand-enter-active,
.fade-expand-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-expand-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.99);
}

.fade-expand-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.99);
}
</style>
