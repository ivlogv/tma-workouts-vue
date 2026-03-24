<script lang="ts" setup>
import AppPage from "@/components/AppPage.vue";
import BottomNav from "@/components/BottomNav.vue";
import CardBlock from "@/components/CardBlock.vue";
import type { Template } from "@/types/api";
import axios from "axios";
import { retrieveRawInitData } from "@tma.js/sdk-vue";
import { onMounted, ref } from "vue";

const initDataRaw = retrieveRawInitData();
const message = ref("test");
const data = ref("");
const source = ref<Template[]>([]);

// base api instance with the base URL and default headers
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `tma ${initDataRaw}`,
  },
});

async function getTemplates() {
  if (!initDataRaw) {
    message.value = "No init data";
    return;
  }
  try {
    const response = await api.get("/templates/");
    // for (let i = 0; i < response.data.length; i++) {
    //   source.value.push(response.data[i]);
    //   console.log(response.data[i]);
    // }
    source.value = response.data;

  } catch (error) {
    console.error("Ошибка запроса:", error);
    data.value = "Ошибка при запросе";
  }
}

onMounted(() => {
  getTemplates();
});
</script>

<template>
  <AppPage title="Workouts">
    <p>Workouts page content goes here.</p>
    <van-button type="primary" @click="getTemplates">Get Templates</van-button>

    <CardBlock class="templates-list">
      <!-- <div v-for="item in source" :key="item.id" class="template-item">
        <p>{{ item.title }}</p>
      </div> -->

      <van-cell-group :border="false">
        <van-cell
          v-for="item in source"
          :key="item.id"
          :title="item.title"
          :label="item.description"
          is-link to="workouts/{{ item.id }}"
        />
      </van-cell-group>
    </CardBlock>

    <p v-if="data">{{ data }}</p>

    <van-button type="primary" is-link to="workouts/new">Add New Workout</van-button>

    <CardBlock class="test">
      <div>qwe</div>
    </CardBlock>

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped>
.templates-list {
  padding: 12px 0;
}

.test {
  background: var(--tg-theme-accent-text-color);
}
</style>
