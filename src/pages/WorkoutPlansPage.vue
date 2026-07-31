<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { mainButton } from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";

import AppPage from "@/components/AppPage.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import BottomNav from "@/components/BottomNav.vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import { usePlansStore } from "@/stores/plans";
import type { WorkoutPlanResponse } from "@/shared/api/types";

interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercisesCount: number;
  color: string;
}

const router = useRouter();
const plansStore = usePlansStore();

const plans = computed(() => plansStore.plans);
const isLoading = computed(() => plansStore.isLoading);
const error = computed(() => plansStore.error);

function exercisesCount(plan: WorkoutPlanResponse): number {
  return plan.plan_exercises?.length ?? 0;
}

// Моковые данные планов (в будущем заменятся на useWorkoutStore)
// const plans = ref<WorkoutPlan[]>([
//   {
//     id: "1",
//     name: "Силовая А (Грудь + Трицепс)",
//     description: "Базовый сплит на верх тела",
//     exercisesCount: 5,
//     color: "#ff9500",
//   },
//   {
//     id: "2",
//     name: "День Спины & Бицепс",
//     description: "Тяговые движения и подтягивания",
//     exercisesCount: 6,
//     color: "#3390ec",
//   },
//   {
//     id: "3",
//     name: "Ноги & Пресс",
//     description: "Приседания, выпады и проработка кора",
//     exercisesCount: 4,
//     color: "#34c759",
//   },
// ]);

function handleGoBack() {
  triggerHaptic("light");
  router.back();
}

function handleOpenPlan(plan: WorkoutPlanResponse) {
  triggerHaptic("light");
  router.push(`/plans/${plan.id}`);
}

function handleCreateNewPlan() {
  triggerHaptic("medium");
  router.push("/plans/create");
}

// --- Telegram MainButton ---
onMounted(async () => {
  await plansStore.fetchPlans();

  if (mainButton.isMounted()) {
    mainButton.setText("Создать новый план");
    mainButton.enable();
    mainButton.show();
    mainButton.onClick(handleCreateNewPlan);
  }
});

onUnmounted(() => {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleCreateNewPlan);
    mainButton.hide();
  }
});
</script>

<template>
  <AppPage title="" :back="false">
    <!-- Наш единый ScreenHeader -->
    <ScreenHeader
      title="Мои планы"
      subtitle="Шаблоны ваших тренировок"
      :show-back="true"
      @back="handleGoBack"
    />

    <!-- Загрузка -->
    <div v-if="isLoading && plans.length === 0" class="empty-state">
      <div class="empty-icon-wrap">Загрузка...</div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="empty-state">
      <div class="empty-icon-wrap">{{ error }}</div>
      <button v-ripple class="btn-primary" @click="plansStore.fetchPlans">
        Попробовать снова
      </button>
    </div>

    <!-- Пустое состояние -->
    <div v-if="plans.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <Icon icon="tabler:dumbbell" width="40" height="40" />
      </div>
      <p class="empty-title">У вас пока нет планов</p>
      <p class="empty-desc">
        Создайте свой первый шаблон тренировки, чтобы легко отслеживать прогресс
      </p>
      <button v-ripple class="btn-primary" @click="handleCreateNewPlan">
        <Icon icon="mdi:plus" width="20" height="20" />
        Создать план
      </button>
    </div>

    <!-- Список планов через Vant Cell Group -->
    <div v-else class="plans-container">
      <van-cell-group inset class="plans-group">
        <van-cell
          v-for="plan in plans"
          :key="plan.id"
          v-ripple
          is-link
          center
          class="plan-cell"
          @click="handleOpenPlan(plan)"
        >
          <!-- Иконка гантели слева на цветной подложке -->
          <template #icon>
            <div
              class="plan-icon-avatar"
              :style="{ backgroundColor: plan.color || '#3390ec' }"
            >
              <Icon icon="tabler:dumbbell" width="24" height="24" color="#ffffff" />
            </div>
          </template>

          <!-- Основная информация -->
          <template #title>
            <div class="plan-title">{{ plan.name }}</div>
          </template>

          <template #label>
            <div v-if="plan.description" class="plan-desc">
              {{ plan.description }}
            </div>
            <div class="plan-meta">
              {{ exercisesCount(plan) }}
              {{ exercisesCount(plan) === 1 ? "упражнение" : "упражнений" }}
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- <van-button
      type="primary"
      @click="handleCreateNewPlan"
    >
      Создать новый план
    </van-button> -->

    <template #bottom>
      <BottomNav />
    </template>
  </AppPage>
</template>

<style scoped>
.plans-container {
  margin-top: 8px;
}

/* Перебиваем дефолтные отступы van-cell-group inset для соответствия дизайну */
.plans-group {
  margin: 0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  background: var(--tg-theme-bg-color, #1c1c1e) !important;
}

.plan-cell {
  padding: 12px 16px !important;
  background: transparent !important;
  align-items: center;
}

.plan-cell::after {
  border-bottom-color: rgba(255, 255, 255, 0.06) !important;
}

/* Иконка планов */
.plan-icon-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

/* Тексты */
.plan-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #fff);
  line-height: 1.25;
}

.plan-desc {
  font-size: 13px;
  color: var(--tg-theme-hint-color, #8e8e93);
  margin-top: 3px;
  line-height: 1.3;
}

.plan-meta {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
  margin-top: 4px;
  font-weight: 500;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  background: var(--tg-theme-secondary-bg-color, #1c1c1e);
  border-radius: 16px;
  margin-top: 12px;
}

.empty-icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tg-theme-hint-color, #8e8e93);
  margin-bottom: 12px;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #fff);
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: var(--tg-theme-hint-color, #8e8e93);
  margin: 0 0 18px;
  max-width: 240px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #fff);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
