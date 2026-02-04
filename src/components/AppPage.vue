<script setup lang="ts">
defineProps<{ title: string, disclaimer?: string }>();
</script>

<template>
  <div class="page">
    <h1 class="page__title">{{ title }}</h1>
    <div v-if="disclaimer" class="page__disclaimer">{{ disclaimer }}</div>

    <!-- Main content -->
    <div class="page__content">
      <slot />
    </div>

    <!-- Bottom bar slot -->
    <!-- <div v-if="$slots.bottom" class="page__bottom-bar">
      <slot name="bottom" />
    </div> -->
  </div>
</template>

<style>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  /* margin-top: 80px; */
}

/* Title */
.page__title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 600;
  color: var(--tg-theme-text-color);
}

/* Disclaimer */
.page__disclaimer {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--tg-theme-hint-color);
}

/* Main content area */
.page__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-bottom: 72px;
}

/* Bottom bar */
.page__bottom-bar {
  position: fixed;
  bottom: 8px;
  left: 16px;
  right: 16px;

  padding: 8px 16px;
  background: var(--tg-theme-bg-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
