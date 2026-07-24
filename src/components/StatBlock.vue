<script setup lang="ts">
import StatCard from "./StatCard.vue";

withDefaults(
  defineProps<{
    daysInRow: number;
    thisWeek: number;
    totalWorkouts?: number;
    avgDuration?: number;
  }>(),
  {
    totalWorkouts: 0,
    avgDuration: 0,
  }
);
</script>

<template>
  <div class="stats-grid">
    <StatCard
      icon="lucide:award"
      label="Стрик"
      :value="daysInRow"
      :unit="daysInRow === 1 ? 'день подряд' : 'дней подряд'"
    />

    <StatCard
      icon="lucide:calendar"
      label="На этой неделе"
      :value="thisWeek"
      unit="тренировок"
    />

    <StatCard
      icon="lucide:trending-up"
      label="Всего"
      :value="totalWorkouts"
      unit="за всё время"
    />

    <StatCard
      icon="lucide:clock"
      label="Ср. время"
      :value="avgDuration"
      unit="минут"
    />
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
</style>
