<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

// Ionicons 5
import {
  HomeOutline,
  TimeOutline,
  PieChartOutline,
  SettingsOutline,
  Home,
  Time,
  PieChart,
  Settings,
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const items = [
  { label: 'Home', icon: HomeOutline, iconActive: Home, path: '/' },
  { label: 'History', icon: TimeOutline, iconActive: Time, path: '/history' },
  { label: 'Analytics', icon: PieChartOutline, iconActive: PieChart, path: '/analytics' },
  { label: 'Settings', icon: SettingsOutline, iconActive: Settings, path: '/test' }
]

function isActive(path: string) {
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
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
      <n-icon :component="isActive(item.path) ? item.iconActive : item.icon" size="22" />
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
  min-width: 80px;

  padding: 6px 2px;
  cursor: pointer;

  font-size: 12px;
  color: var(--tg-theme-text-color);

  transition: background 0.2s ease, color 0.2s ease;
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
