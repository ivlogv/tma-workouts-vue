import { defineStore } from "pinia";
import { ref } from "vue";
import { plansApi } from "@/shared/api/workouts";
import type {
  WorkoutPlanResponse,
  WorkoutPlanCreate,
  WorkoutPlanUpdate,
  // PlanExerciseCreate,
  // PlanExerciseUpdate,
  // PlanExerciseResponse,
} from "@/shared/api/types";

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

  async function getPlanById(id: number): Promise<WorkoutPlanResponse | null> {
    // Сначала ищем в имеющемся списке
    const existing = plans.value.find((p) => p.id === id);
    if (existing) return existing;

    // Если нет в сторе, запрашиваем с сервера
    try {
      const plan = await plansApi.getPlanById(id);
      // Кэшируем/добавляем в имеющийся список, если его там не было
      if (plan && !plans.value.some((p) => p.id === plan.id)) {
        plans.value.push(plan);
      }
      return plan;
    } catch (e) {
      console.error("Ошибка при получении плана:", e);
      return null;
    }
  }

  async function createPlan(payload: WorkoutPlanCreate) {
    isLoading.value = true;
    try {
      const newPlan = await plansApi.createPlan(payload);
      plans.value.push(newPlan);
      return newPlan;
    } catch (e) {
      console.error("Ошибка при создании плана:", e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePlan(id: number, payload: WorkoutPlanUpdate) {
    isLoading.value = true;
    try {
      const updatedPlan = await plansApi.updatePlan(id, payload);
      const index = plans.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        plans.value[index] = updatedPlan;
      }
      return updatedPlan;
    } catch (e) {
      console.error("Ошибка при обновлении плана:", e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function deletePlan(id: number) {
    isLoading.value = true;
    try {
      await plansApi.deletePlan(id);
      plans.value = plans.value.filter((p) => p.id !== id);
    } catch (e) {
      console.error("Ошибка при удалении плана:", e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // Точечные методы управления упражнениями плана
  // (Если бэкенд поддерживает отдельный REST под plan_exercises)
  // ==========================================

  // async function addExerciseToPlan(
  //   planId: number,
  //   payload: PlanExerciseCreate
  // ): Promise<PlanExerciseResponse | null> {
  //   try {
  //     const addedExercise = await plansApi.addExerciseToPlan(planId, payload);
  //     const plan = plans.value.find((p) => p.id === planId);
  //     if (plan) {
  //       if (!plan.plan_exercises) plan.plan_exercises = [];
  //       plan.plan_exercises.push(addedExercise);
  //     }
  //     return addedExercise;
  //   } catch (e) {
  //     console.error("Ошибка при добавлении упражнения в план:", e);
  //     throw e;
  //   }
  // }

  // async function updatePlanExercise(
  //   planId: number,
  //   planExerciseId: number,
  //   payload: PlanExerciseUpdate
  // ): Promise<PlanExerciseResponse | null> {
  //   try {
  //     const updated = await plansApi.updatePlanExercise(
  //       planId,
  //       planExerciseId,
  //       payload
  //     );
  //     const plan = plans.value.find((p) => p.id === planId);
  //     if (plan && plan.plan_exercises) {
  //       const idx = plan.plan_exercises.findIndex(
  //         (ex) => ex.id === planExerciseId
  //       );
  //       if (idx !== -1) {
  //         plan.plan_exercises[idx] = updated;
  //       }
  //     }
  //     return updated;
  //   } catch (e) {
  //     console.error("Ошибка при обновлении упражнения в плане:", e);
  //     throw e;
  //   }
  // }

  // async function removeExerciseFromPlan(
  //   planId: number,
  //   planExerciseId: number
  // ) {
  //   try {
  //     await plansApi.removeExerciseFromPlan(planId, planExerciseId);
  //     const plan = plans.value.find((p) => p.id === planId);
  //     if (plan && plan.plan_exercises) {
  //       plan.plan_exercises = plan.plan_exercises.filter(
  //         (ex) => ex.id !== planExerciseId
  //       );
  //     }
  //   } catch (e) {
  //     console.error("Ошибка при удалении упражнения из плана:", e);
  //     throw e;
  //   }
  // }

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    // addExerciseToPlan,
    // updatePlanExercise,
    // removeExerciseFromPlan,
  };
});
