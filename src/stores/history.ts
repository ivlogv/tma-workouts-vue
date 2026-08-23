import { defineStore } from "pinia";
import { ref } from "vue";
import { workoutsApi } from "@/shared/api/workouts"; // Укажи свой верный путь к API
import type { WorkoutSessionResponse } from "@/shared/api/types";

export const useHistoryStore = defineStore("history", () => {
  const sessions = ref<WorkoutSessionResponse[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Загрузка истории (по умолчанию фильтруем только завершённые, если требуется)
  async function fetchHistory(limit?: number) {
    isLoading.value = true;
    error.value = null;
    try {
      // Запрашиваем завершенные тренировки (или все сессии)
      const data = await workoutsApi.getSessions("completed");

      // Если передали лимит (например, первые 5 для главного экрана)
      sessions.value = limit ? data.slice(0, limit) : data;
    } catch (e: unknown) {
      console.error("Ошибка при загрузке истории тренировок:", e);
      error.value = "Не удалось загрузить историю тренировок";
    } finally {
      isLoading.value = false;
    }
  }

  return {
    sessions,
    isLoading,
    error,
    fetchHistory,
  };
});
