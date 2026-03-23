<script setup lang="ts">
import type { Component } from 'vue'

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
      @click="emit('select', w.id)"
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
}

.workout-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.workout-item.active {
  background: color-mix(in srgb, var(--tg-theme-button-color) 20%, transparent);
}

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
