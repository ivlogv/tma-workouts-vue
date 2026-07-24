<!-- <script setup lang="ts">
import { useBackButton } from "@/composables/useBackButton";
// import { MiniApp } from "@tma.js/sdk-vue";

useBackButton();
</script>

<template>
  <van-config-provider theme="dark">
    <RouterView />
  </van-config-provider>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
</style> -->

<script setup lang="ts">
import { computed } from "vue";
import { themeParams } from "@tma.js/sdk-vue";
import { useBackButton } from "@/composables/useBackButton";

// Инициализируем логику кнопки "Назад" в Telegram
useBackButton();

// Определяем тёмную тему на основе themeParams
const vantTheme = computed(() => {
  // themeParams.isDark() возвращает boolean (или true, если цвет фона тёмный)
  if (typeof themeParams.isDark === "function") {
    return themeParams.isDark() ? "dark" : "light";
  }
  return "dark"; // Запасной дефолт
});
</script>

<template>
  <van-config-provider :theme="vantTheme">
    <div class="app-wrapper">
      <RouterView />
    </div>
  </van-config-provider>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  /*
    Берём фоновый цвет и цвет текста из CSS-переменных,
    которые привязал themeParams.bindCssVars() в init.ts
  */
  background-color: var(--tg-theme-secondary-bg-color, #000000);
  color: var(--tg-theme-text-color, #ffffff);
}

.app-wrapper {
  height: 100%;
  box-sizing: border-box;

  /*
    Используем безопасные зоны из viewport.bindCssVars()
  */
  padding-top: var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-bottom: var(
    --tg-safe-area-inset-bottom,
    env(safe-area-inset-bottom, 0px)
  );
}
</style>
