<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

const router = useRouter();
const route = useRoute();

const items = [
  {
    label: "Home",
    icon: "mdi:home-outline",
    iconActive: "mdi:home",
    path: "/",
  },
  {
    label: "History",
    icon: "mdi:history",
    iconActive: "mdi:history",
    path: "/history",
  },
  {
    label: "Workouts",
    icon: "solar:dumbbell-outline",
    iconActive: "solar:dumbbell-bold",
    path: "/workouts",
  },
  {
    label: "Settings",
    icon: "mdi:cog-outline",
    iconActive: "mdi:cog",
    path: "/test",
  },
];

function isActive(path: string) {
  return route.path === path;
}

function navigate(path: string) {
  router.push(path);
}
</script>

<template>
  <nav class="bottom-nav">
    <div
      v-for="item in items"
      :key="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="navigate(item.path)"
    >
      <Icon
        :icon="isActive(item.path) ? item.iconActive : item.icon"
        width="22"
      />

      <span class="label">{{ item.label }}</span>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 8px;

  border-radius: 32px;

  background: var(--tg-theme-bg-color);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  width: 100%;

  padding: 6px 2px;
  cursor: pointer;

  font-size: 12px;
  color: var(--tg-theme-text-color);

  transition:
    background 0.2s ease,
    color 0.2s ease;
  border-radius: 32px;
}

.nav-item.active {
  background: color-mix(in srgb, var(--tg-theme-button-color) 20%, transparent);
  color: var(--tg-theme-button-color);
}

.nav-item.active .label {
  color: var(--tg-theme-button-color);
}

.label {
  font-size: 11px;
}
</style>
