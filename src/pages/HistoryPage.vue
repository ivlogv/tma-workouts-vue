<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import BottomNav from "@/components/BottomNav.vue";
</script>

<template>
  <AppPage title="История тренировок">
    <p>Здесь будет отображаться история ваших тренировок.</p>

    <van-button type="primary" @click="$router.back()"> Назад </van-button>

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped></style>
