<script setup lang="ts">
import { useSlots } from "vue";

defineProps<{
  title: string;
  subtitle?: string;
  letter?: string;
}>();

const emit = defineEmits<{
  (e: "avatar-click"): void;
}>();

const slots = useSlots();
</script>

<template>
  <header class="screen-header">
    <!-- Левая заглушка для балансировки центрирования, если справа есть аватар -->
    <div class="header-side header-side--left">
      <slot name="left" />
    </div>

    <!-- Текстовый блок строго по центру -->
    <div class="title-group">
      <h1 class="title">{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>

    <!-- Правая секция (Аватар или кастомный action) -->
    <div class="header-side header-side--right">
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
  </header>
</template>

<style scoped>
.screen-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  /* Учитываем верхнюю безопасную зону Telegram и челки */
  padding-top: calc(var(--tg-viewport-safe-area-inset-top, 0px) + 8px);
  margin-bottom: 12px;
  min-height: 44px;
}

.header-side {
  display: flex;
  align-items: center;
  min-width: 36px; /* Фиксированная ширина боковин для точного центрирования заголовка */
}

.header-side--left {
  justify-content: flex-start;
}

.header-side--right {
  justify-content: flex-end;
}

.title-group {
  flex: 1;
  text-align: center;
  padding: 0 8px;
  /* Предотвращает вылезание текста за границы */
  overflow: hidden;
}

.title {
  font-size: 1.05rem; /* ~17px — стандартный размер iOS/Telegram navigation bar */
  line-height: 1.25;
  font-weight: 600;
  margin: 0;
  color: var(--tg-theme-text-color, #ffffff);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.subtitle {
  font-size: 0.75rem; /* 12px */
  line-height: 1.3;
  margin: 2px 0 0 0;
  color: var(--tg-theme-hint-color, #8e8e93);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Кнопка-аватарка */
.avatar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
</style>
