<script lang="ts" setup>
import AppPage from "@/components/AppPage.vue";
import BottomNav from "@/components/BottomNav.vue";
import CardBlock from "@/components/CardBlock.vue";
// import type { Template } from "@/types/api";
import { computed, onMounted, ref } from "vue";

// import { api } from "@/shared/api"
import { useWorkoutStore } from "@/stores/workouts";

const store = useWorkoutStore()
const data = ref("");

onMounted(() => {
  store.fetchTemplates()
});

const hasTemplates = computed(() => store.templates.length > 0);
</script>

<template>
  <AppPage title="Workouts">
    <p>Workouts page content goes here.</p>
    <!-- <van-button type="primary" @click="getTemplates">Get Templates</van-button> -->

    <CardBlock class="templates-list">

      <van-cell-group :border="false" v-if="hasTemplates">
        <van-cell
          v-for="item in store.templates"
          :key="item.id"
          :title="item.title"
          :label="item.description"
          is-link to="workouts/{{ item.id }}"
        />
      </van-cell-group>
      <p v-else>No templates available.</p>
    </CardBlock>

    <p v-if="data">{{ data }}</p>

    <van-button type="primary" is-link to="workouts/new">Add New Workout</van-button>

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped>
.templates-list {
  padding: 12px 0;
}
</style>
