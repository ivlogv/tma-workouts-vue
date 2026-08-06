<script setup lang="ts">
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { triggerHaptic } from "@/shared/utils/haptic.ts";

withDefaults(
  defineProps<{
    daysInRow: number;
    thisWeek: number;
    avgDuration?: number;
  }>(),
  {
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
    <div class="stats-unified">
      <!-- Метрики в один ряд -->
      <div class="stats-row">
        <!-- Стрик -->
        <div class="stat-item">
          <div class="stat-value-group">
            <Icon icon="lucide:flame" width="18" height="18" class="stat-icon icon-flame" />
            <span class="stat-value">{{ daysInRow }}</span>
          </div>
          <span class="stat-label">Стрик (дней)</span>
        </div>

        <div class="stat-divider"></div>

        <!-- На этой неделе -->
        <div class="stat-item">
          <div class="stat-value-group">
            <Icon icon="lucide:calendar" width="18" height="18" class="stat-icon" />
            <span class="stat-value">{{ thisWeek }}</span>
          </div>
          <span class="stat-label">На этой неделе</span>
        </div>

        <div class="stat-divider"></div>

        <!-- Среднее время -->
        <div class="stat-item">
          <div class="stat-value-group">
            <Icon icon="lucide:clock" width="18" height="18" class="stat-icon" />
            <span class="stat-value">{{ avgDuration }} <span class="stat-unit">мин</span></span>
          </div>
          <span class="stat-label">Ср. время</span>
        </div>
      </div>

      <!-- Нижняя кнопка перехода -->
      <button v-ripple class="stats-bottom-btn" @click="goToStats">
        <span>Подробнее</span>
        <Icon icon="lucide:chevron-right" width="16" height="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.stats-section {
  margin-bottom: 0;
}

.stats-unified {
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 14px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  color: var(--tg-theme-button-color, #3390ec);
}

.stat-icon.icon-flame {
  color: #ff9500;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--tg-theme-text-color, #ffffff);
  line-height: 1;
}

.stat-unit {
  font-size: 13px;
  font-weight: 500;
  color: var(--tg-theme-hint-color, #8e8e93);
}

.stat-label {
  font-size: 11px;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-weight: 500;
  text-align: center;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

/* Нижняя кнопка */
.stats-bottom-btn {
  width: 100%;
  background: var(--tg-theme-bg-color, rgba(255, 255, 255, 0.04));
  border: none;
  border-radius: 14px;
  padding: 14px;
  color: var(--tg-theme-button-color, #3390ec);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color 0.15s ease;
}
</style>
