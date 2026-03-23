<script setup lang="ts">
// import { computed } from "vue";
// import { routes } from "@/router";
import AppPage from "@/components/AppPage.vue";
// import AppLink from "@/components/AppLink.vue";
import BottomNav from "@/components/BottomNav.vue";
// import TransactionCard from "@/components/TransactionCard.vue";

// import { WalletOutline, HomeOutline, RestaurantOutline } from "@vicons/ionicons5";

// const nonIndexRoutes = computed(() => routes.filter((r) => !!r.meta?.title));
import { ref } from "vue";
import axios from "axios";
import { retrieveRawInitData } from "@tma.js/sdk-vue";

const message = ref("test");
const data = ref("empty");

const initDataRaw = retrieveRawInitData();
console.log("initDataRaw:", initDataRaw);

// base api instance with the base URL and default headers
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `tma ${initDataRaw}`,
  },
});

async function testLogin() {
  if (!initDataRaw) {
    message.value = "No init data";
    return;
  }
  try {
    const response = await api.post("/auth/telegram", {});
    message.value = response.data.message;
    console.log("Ответ сервера:", response.data);
  } catch (error) {
    console.error("Ошибка запроса:", error);
    message.value = "Ошибка при запросе";
  }
}

async function testFetchData() {
  if (!initDataRaw) {
    message.value = "No init data";
    return;
  }
  try {
    const response = await api.get("/templates");
    // data.value = response.data;
    const templateId = response.data[0].id; // Получаем ID первого шаблона из ответа

    // const response2 = await api.get(`/exercises/`);
    // const exerciseId = response2.data[1].id; // Получаем ID первого упражнения из ответа

    const response3 = await api.get(`/exercises/template/${templateId}`)

    data.value = response3.data; // Сохраняем ответ в переменную data
  } catch (error) {
    console.error("Ошибка запроса:", error);
    data.value = "Ошибка при запросе";
  }
}
</script>

<template>
  <AppPage title="Home Page" :back="false">
    <n-button @click="testLogin" type="primary">Тест авторизации</n-button>
    <p>{{ message }}</p>

    <n-button @click="testFetchData">Тест запроса</n-button>
    <p>{{ data }}</p>

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped>
.balance-card {
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-text-color);
  border-radius: 16px;
}

.title {
  color: var(--tg-theme-text-color);
}

.amount {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--tg-theme-text-color);
}

.currency {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.icon {
  color: var(--tg-theme-text-color);
}
</style>
