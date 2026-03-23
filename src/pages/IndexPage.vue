<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import BottomNav from "@/components/BottomNav.vue";
// import { ref } from "vue";
// import axios from "axios";
// import { retrieveRawInitData } from "@tma.js/sdk-vue";

// const initDataRaw = retrieveRawInitData();

// base api instance with the base URL and default headers
// const api = axios.create({
//   baseURL: "http://localhost:8000/api",
//   headers: {
//     Authorization: `tma ${initDataRaw}`,
//   },
// });

// async function fetchData() {}

</script>

<template>
  <AppPage title="Home Page" :back="false">
    <div class="card">
      <n-flex justify="space-between">
        <div class="stat">
          <h2>0</h2>
          <p class="title">Всего тренировок</p>
        </div>

        <div class="stat">
          <h2>0</h2>
          <p class="title">Текущая серия</p>
        </div>
      </n-flex>
    </div>

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped>
.card {
  background-color: var(--tg-theme-bg-color);
  border-radius: 16px;
  padding: 8px;
}

.card__header {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.title {
  color: var(--tg-theme-text-color);
}

.icon {
  color: var(--tg-theme-text-color);
}
</style>
