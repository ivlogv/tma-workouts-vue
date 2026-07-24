<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
  icon: string;        // Название иконки (например: 'lucide:award', 'lucide:calendar')
  label: string;       // Метка (например: "Стрик")
  value: string | number; // Основное значение (например: 42)
  unit?: string;       // Единица измерения (например: "дней подряд")
}>();
</script>

<template>
  <div class="stat-card">
    <!-- Шапка карточки: Иконка + Label -->
    <div class="stat-header">
      <Icon :icon="icon" width="16" height="16" class="stat-icon" />
      <span class="stat-label">{{ label }}</span>
    </div>

    <!-- Числовое значение -->
    <div class="stat-value">
      {{ value }}
    </div>

    <!-- Подпись / Единица измерения -->
    <div v-if="unit" class="stat-unit">
      {{ unit }}
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background-color: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
}

.stat-icon {
  flex-shrink: 0;
  color: var(--tg-theme-hint-color, #8e8e93);
}

.stat-value {
  font-size: 1.5rem; /* 24px */
  line-height: 1.25;
  font-weight: 700;
  color: var(--tg-theme-text-color, #ffffff);
  margin-bottom: 2px;
}

.stat-unit {
  font-size: 0.75rem; /* 12px */
  color: var(--tg-theme-hint-color, #8e8e93);
}
</style>
