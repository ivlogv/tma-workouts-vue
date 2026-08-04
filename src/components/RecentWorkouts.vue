<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import type { WorkoutSessionResponse } from "@/shared/api/types";

const props = withDefaults(
  defineProps<{
    workouts?: WorkoutSessionResponse[];
    selectedId?: number;
    maxItems?: number;
    isLoading?: boolean;
  }>(),
  {
    workouts: () => [],
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
  return [...props.workouts]
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
    <div v-if="isLoading" class="empty">Загрузка истории...</div>

    <!-- Пустое состояние -->
    <div v-else-if="workouts.length === 0" class="empty">Нет завершённых тренировок</div>

    <!-- Список ячеек -->
    <van-cell-group v-else inset :border="false">
      <van-cell
        v-for="w in displayedWorkouts"
        :key="w.id"
        v-ripple
        :class="{ active: w.id === selectedId }"
        @click="handleClick(w.id)"
      >
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
      <van-cell
        v-ripple
        class="history-cell"
        @click="handleHistoryClick"
      >
        <template #title>
          <div class="history-content">
            <span>Вся история</span>
            <Icon icon="lucide:history" width="16" height="16" />
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<style scoped>
.workouts-wrapper {
  margin-bottom: 16px;
  background-color: var(--tg-theme-bg-color);
  border-radius: 14px;
}

.workouts-title {
  color: var(--tg-theme-accent-text-color, #3390ec);
  font-size: 14px;
  font-weight: 600;
  margin: 0 16px 8px 16px;
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
</style>
