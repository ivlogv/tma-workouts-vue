<script setup lang="ts">
import { useBackButton } from "@/composables/useBackButton";
import { NConfigProvider } from "naive-ui";
import { useNaiveTheme } from "./theme/naiveTheme";

const { themeOverrides } = useNaiveTheme();
useBackButton();
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <RouterView />
  </n-config-provider>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
</style>
