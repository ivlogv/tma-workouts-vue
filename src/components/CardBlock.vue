<script setup lang="ts">
</script>

<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--tg-theme-bg-color, #1c1c1c);
  border-radius: 12px;
  color: var(--tg-theme-text-color, #fff);
  font-family: sans-serif;
}
</style>
