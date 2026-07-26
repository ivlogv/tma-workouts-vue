<script setup lang="ts">
import { useSlots } from "vue";
import { Icon } from "@iconify/vue";

defineProps<{
  title: string;
  subtitle?: string;
  showBack?: boolean;
  letter?: string; // Сделали опциональным
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "avatar-click"): void;
}>();

const slots = useSlots();
</script>

<template>
  <div class="screen-header">
    <div class="header-main">
      <!-- Кнопка "Назад" с v-ripple -->
      <button
        v-if="showBack"
        v-ripple
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

    <!-- Показываем правую секцию только если передан letter или использован кастомный слот #action -->
    <div v-if="letter || slots.action" class="action-slot">
      <slot name="action">
        <button
          v-ripple
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
  border-radius: 50%;
  cursor: pointer;
  color: var(--tg-theme-link-color, #3390ec);
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
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
  color: var(--tg-theme-hint-color, #8e8e93);
}

.action-slot {
  display: flex;
  align-items: center;
}

/* Кнопка-аватарка */
.avatar-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
</style>
