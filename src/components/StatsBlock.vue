<script setup lang="ts">

defineProps({
  daysInRow: {
    type: Number,
    required: true
  },
  thisWeek: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="stats-block card">
      <div class="stat-item">
        <div class="stat-value">{{ daysInRow }}</div>
        <div class="stat-label">дней подряд</div>
      </div>

      <div class="divider"></div>

      <div class="stat-item">
        <div class="stat-value">{{ thisWeek }}</div>
        <div class="stat-label">на этой неделе</div>
      </div>
    </div>
</template>

<style scoped>
.card {
  background: var(--tg-theme-bg-color, #1c1c1c);
  padding: 16px;
  border-radius: 12px;
  color: var(--tg-theme-text-color, #fff);
  font-family: sans-serif;
}

.card__title {
  color: var(--tg-theme-button-color, #fff);
  font-size: 14px;
}

.stats-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.stat-value {
  font-size: 24px;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--tg-theme-hint-color, #888);
}

.divider {
  width: 1px;
  height: 48px;
  background: var(--tg-theme-hint-color, #888);
}
</style>
