import { defineStore } from "pinia";
import { ref } from "vue";
import { plansApi } from "@/shared/api/workouts";
import type { WorkoutPlanResponse } from "@/shared/api/types";

export const usePlansStore = defineStore("plans", () => {
  const plans = ref<WorkoutPlanResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPlans() {
    isLoading.value = true;
    error.value = null;
    try {
      plans.value = await plansApi.getPlans();
    } catch (e: unknown) {
      console.error("Ошибка при загрузке планов:", e);
      error.value = "Не удалось загрузить программы тренировок";
    } finally {
      isLoading.value = false;
    }
  }

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
  };
});
