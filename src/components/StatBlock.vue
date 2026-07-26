<script setup lang="ts">
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import StatCard from "./StatCard.vue";
import { triggerHaptic } from "@/shared/utils/haptic.ts";

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

const router = useRouter();

function goToStats() {
  triggerHaptic("light");
  router.push("/stats");
}
</script>

<template>
  <div class="stats-section">
    <!-- Шапка блока с инлайн-кнопкой для перехода в полную статистику -->
    <div class="stats-header">
      <span class="stats-title">Статистика</span>

      <button v-ripple class="inline-stats-btn" @click="goToStats">
        <span>Подробнее</span>
        <Icon icon="lucide:chevron-right" width="14" height="14" />
      </button>
    </div>

    <!-- Твой существующий сетка-виджет -->
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
  </div>
</template>

<style scoped>
.stats-section {
  margin-bottom: 16px;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 4px 8px 16px;
}

.stats-title {
  color: var(--tg-theme-button-color, #3390ec);
  font-size: 14px;
  font-weight: 600;
}

/* Инлайн-кнопка перехода */
.inline-stats-btn {
  background: transparent;
  border: none;
  color: var(--tg-theme-link-color, #3390ec);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
</style>
