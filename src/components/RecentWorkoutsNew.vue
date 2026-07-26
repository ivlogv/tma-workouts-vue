<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";

interface Workout {
  id: number;
  name: string;
  date: string;
  icon?: string;
}

const props = withDefaults(
  defineProps<{
    workouts?: Workout[];
    selectedId?: number;
    maxItems?: number;
  }>(),
  { workouts: () => [], maxItems: 3 },
);

const emit = defineEmits<{
  (e: "select", id: number): void;
  (e: "open-history"): void;
}>();

const displayedWorkouts = computed(() => {
  return [...props.workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, props.maxItems);
});

function handleClick(id: number) {
  emit("select", id);
}

function handleHistoryClick() {
  emit("open-history");
}
</script>

<template>
  <div class="workouts-wrapper">
    <div class="workouts-title">Последние тренировки</div>

    <div v-if="workouts.length === 0" class="empty">Нет тренировок</div>

    <van-cell-group v-else inset :border="false">
      <!-- Навешиваем глобальную v-ripple прямо на van-cell -->
      <van-cell
        v-for="w in displayedWorkouts"
        :key="w.id"
        v-ripple
        :class="{ active: w.id === selectedId }"
        @click="handleClick(w.id)"
      >
        <template #title>
          <div class="workout-name">{{ w.name }}</div>
        </template>

        <template #label>
          <div class="workout-date">{{ w.date }}</div>
        </template>

        <template #right-icon>
          <div v-if="w.icon" class="workout-icon">
            <Icon :icon="w.icon" width="22" height="22" />
          </div>
        </template>
      </van-cell>

      <!-- Инлайн-кнопка перехода к истории -->
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
}

.workouts-title {
  color: var(--tg-theme-button-color, #3390ec);
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
  background-color: transparent;
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
