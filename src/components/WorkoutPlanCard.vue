<script setup lang="ts">
// import { Icon } from "@iconify/vue";

defineProps<{
  id: string | number;
  name: string;
  exerciseCount: number;
  subtitle?: string | null;
  color?: string | null;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <div v-ripple class="plan-card" @click="emit('click')">
    <!-- Цветная полоска-акцент сверху -->
    <div
      class="plan-card__accent"
      :style="{ backgroundColor: color || 'var(--tg-theme-button-color, #3390ec)' }"
    ></div>

    <div class="plan-card__content">
      <!-- <div
        class="plan-card__icon-wrapper"
        :style="{
          color: color || 'var(--tg-theme-button-color, #3390ec)',
          backgroundColor: color
            ? `color-mix(in srgb, ${color} 15%, transparent)`
            : 'color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 15%, transparent)'
        }"
      >
        <Icon icon="lucide:dumbbell" width="18" height="18" />
      </div> -->

      <div class="plan-card__name">{{ name }}</div>
      <div v-if="subtitle" class="plan-card__count">{{ subtitle }}</div>
      <div class="plan-card__count">{{ exerciseCount }} упражнений</div>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  position: relative;
  min-width: 140px;
  width: 140px;
  flex: 0 0 140px;
  background-color: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  overflow: hidden;
  box-sizing: border-box;
}

.plan-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.plan-card__content {
  display: flex;
  flex-direction: column;
}

/* Иконка в стилизованном подложке */
.plan-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.plan-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #ffffff);
  line-height: 1.3;
  margin-bottom: 4px;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-card__count {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
}
</style>
