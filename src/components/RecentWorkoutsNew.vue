<script setup lang="ts">
import { hapticFeedback } from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";
import type { Directive } from "vue";

interface Workout {
  id: number;
  name: string;
  date: string;
  icon?: string;
}

withDefaults(
  defineProps<{
    workouts?: Workout[];
    selectedId?: number;
  }>(),
  { workouts: () => [] },
);

const emit = defineEmits<(e: "select", id: number) => void>();

// Кастомная легкая директива Ripple
const vRipple: Directive = {
  mounted(el: HTMLElement) {
    el.style.position = "relative";
    el.style.overflow = "hidden";

    el.addEventListener("click", (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const circle = document.createElement("span");
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add("v-ripple-effect");

      const oldRipple = el.querySelector(".v-ripple-effect");
      if (oldRipple) oldRipple.remove();

      el.appendChild(circle);

      setTimeout(() => circle.remove(), 600);
    });
  },
};

function handleClick(id: number) {
  if (hapticFeedback.isSupported()) {
    hapticFeedback.impactOccurred("light");
  }
  emit("select", id);
}
</script>

<template>
  <div class="workouts-wrapper">
    <div class="workouts-title">Последние тренировки</div>

    <div v-if="workouts.length === 0" class="empty">Нет тренировок</div>

    <van-cell-group v-else inset :border="false">
      <!-- Навешиваем v-ripple прямо на van-cell -->
      <van-cell
        v-for="w in workouts"
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
  /* background-color: var(--tg-theme-secondary-bg-color, #1c1c1e); */
  overflow: hidden;
}

:deep(.van-cell) {
  background-color: transparent;
  color: var(--tg-theme-text-color, #ffffff);
  padding: 12px 16px;
  align-items: center;
  /* Убираем все жесткие ховеры Vant */
  -webkit-tap-highlight-color: transparent;
}

/* Стили самой волны */
:deep(.v-ripple-effect) {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15); /* Мягкая белая волна */
  transform: scale(0);
  animation: ripple 0.5s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(3.5);
    opacity: 0;
  }
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
  /* color: var(--tg-theme-hint-color, #8e8e93); */
  margin-left: 8px;
}

/* :deep(.van-cell.active) {
  background-color: color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 15%, transparent);
} */

:deep(.van-cell.active) .workout-name,
:deep(.van-cell.active) .workout-icon {
  color: var(--tg-theme-button-color, #3390ec);
}

.empty {
  padding: 16px;
  text-align: center;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 14px;
}
</style>
