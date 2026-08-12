<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import BottomNav from "@/components/BottomNav.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
</script>

<template>
  <AppPage title="">
    <ScreenHeader title="История тренировок" show-back @back="$router.back()" />

    <p>Здесь будет отображаться история ваших тренировок.</p>

    <!-- <template #bottom>
      <BottomNav />
    </template> -->
  </AppPage>
</template>

<style scoped></style>
