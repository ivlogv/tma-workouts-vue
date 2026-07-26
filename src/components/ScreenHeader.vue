<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
  title: string;
  subtitle?: string;
  showBack?: boolean;
  letter: string;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "avatar-click"): void;
}>();
</script>

<template>
  <div class="screen-header">
    <div class="header-main">
      <!-- Кнопка "Назад" (если требуется) -->
      <button
        v-if="showBack"
        class="back-button"
        type="button"
        @click="emit('back')"
      >
        <Icon icon="lucide:arrow-left" width="24" height="24" />
      </button>

      <!-- Текстовый блок -->
      <div class="title-group">
        <h1 class="title">{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Аватарка/Кнопка с первой буквой справа -->
    <div class="action-slot">
      <slot name="action">
        <button
          class="avatar-btn"
          type="button"
          @click="emit('avatar-click')"
        >
          <span>{{ letter }}</span>
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.back-button {
  background: none;
  border: none;
  padding: 8px;
  margin-left: -8px;
  cursor: pointer;
  color: var(--tg-theme-link-color, #2481cc);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.back-button:active {
  opacity: 0.7;
}

.title-group {
  flex: 1;
}

.title {
  font-size: 1.5rem; /* 24px */
  line-height: 1.25;
  font-weight: 700;
  margin: 0;
  color: var(--tg-theme-text-color, #ffffff);
}

.subtitle {
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
  margin: 4px 0 0 0;
  color: var(--tg-theme-hint-color, #aaaaaa);
}

.action-slot {
  display: flex;
  align-items: center;
}

/* Кнопка с буквой (Аватарка) */
.avatar-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--tg-theme-button-color, #2481cc);
  color: var(--tg-theme-button-text-color, #ffffff);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.2s ease;
}

.avatar-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
}
</style>
