<script setup lang="ts">
import type { Component } from 'vue'
import { hapticFeedback } from '@tma.js/sdk-vue';

interface Workout {
  id: number
  name: string
  date: string
  icon?: Component | string
}

withDefaults(defineProps<{
  workouts?: Workout[]
  selectedId?: number
}>(), { workouts: () => [] })

const emit = defineEmits<(e: 'select', id: number) => void>()

function ripple(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement

  // создаём элемент ripple
  const circle = document.createElement("span")
  const diameter = Math.max(target.clientWidth, target.clientHeight)
  const radius = diameter / 2

  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${e.clientX - target.getBoundingClientRect().left - radius}px`
  circle.style.top = `${e.clientY - target.getBoundingClientRect().top - radius}px`
  circle.classList.add("ripple")

  // удаляем старый ripple, если есть
  const oldRipple = target.querySelector(".ripple")
  if (oldRipple) oldRipple.remove()

  target.appendChild(circle)
}

function handleClick(e: MouseEvent, id: number) {
  // вибрация
  if(hapticFeedback.isSupported()) {
    hapticFeedback.impactOccurred("light")
  }

  ripple(e)
  emit("select", id)
}
</script>

<template>
  <div class="card">
    <div class="card__title">Последние тренировки</div>

    <div v-if="workouts.length === 0" class="empty">Нет тренировок</div>

    <div
      v-for="w in workouts"
      :key="w.id"
      class="workout-item"
      :class="{ active: w.id === selectedId }"
      @click="(e) => handleClick(e, w.id)"
    >
      <div class="inner">
        <div class="text">
          <div class="name">{{ w.name }}</div>
          <div class="date">{{ w.date }}</div>
        </div>
        <div class="icon">
          <n-icon size="22" :component="w.icon" />
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.card {
  background: var(--tg-theme-bg-color, #1c1c1c);
  padding: 0;
  border-radius: 12px;
  color: var(--tg-theme-text-color, #fff);
  font-family: sans-serif;
}

.card__title {
  color: var(--tg-theme-button-color, #fff);
  font-size: 14px;
  font-weight: 600;
  line-height: 0.9;
  margin: 16px 12px 12px 16px;
}

.workout-item {
  width: 100%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

:deep(.ripple) {
  position: absolute;
  border-radius: 50%;
  background: var(--tg-theme-hint-color);
  transform: scale(0);
  animation: ripple-effect 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-effect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* .workout-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.workout-item.active {
  background: color-mix(in srgb, var(--tg-theme-button-color) 20%, transparent);
} */

.workout-item.active .name,
.workout-item.active .icon {
  color: var(--tg-theme-button-color, #4da3ff);
}

.workout-item:last-child {
  margin-bottom: 12px;
}

.inner {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  margin: 0 12px;
}

.text {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: 600;
}

.date {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #fff);
}

.icon {
  display: flex;
  align-items: center;
}

.empty {
  opacity: 0.6;
  font-size: 14px;
}
</style>
