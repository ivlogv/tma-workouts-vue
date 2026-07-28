import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { workoutsApi, plansApi } from "@/shared/api/workouts";
import type {
  WorkoutSessionResponse,
  WorkoutSetCreate,
  WorkoutSessionUpdate,
  WorkoutPlanResponse,
} from "@/shared/api/types";

export const useWorkoutStore = defineStore("workout", () => {
  // --- STATE ---
  const activeSession = ref<WorkoutSessionResponse | null>(null);
  const templates = ref<WorkoutPlanResponse[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  // Локальные подходы, которые пользователь редактирует в моменте
  const currentSets = ref<WorkoutSetCreate[]>([]);

  // --- GETTERS ---
  const isSessionActive = computed(() => {
    return activeSession.value?.status === "in_progress";
  });

  const sessionTitle = computed(() => activeSession.value?.title || "Тренировка");

  // Подсчет процента выполнения тренировки для прогресс-бара
  const progressPercentage = computed(() => {
    if (!currentSets.value.length) return 0;
    const completed = currentSets.value.filter((s) => s.is_completed).length;
    return Math.round((completed / currentSets.value.length) * 100);
  });

  // --- ACTIONS ---

  /**
   * Загрузить шаблоны/планы тренировок
   */
  async function fetchTemplates() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await plansApi.getPlans();
      templates.value = data;
    } catch (e: any) {
      error.value = e.response?.data?.detail || "Ошибка при загрузке шаблонов";
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Начать новую тренировку (по ID плана или без него)
   */
  async function startWorkout(planId?: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const session = await workoutsApi.createSession({ plan_id: planId });
      activeSession.value = session;

      // Инициализируем локальные подходы из ответа бэкенда
      initLocalSets(session);
    } catch (e: any) {
      error.value = e.response?.data?.detail || "Не удалось начать тренировку";
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Восстановить/загрузить сессию (например, при запуске приложения)
   */
  async function loadSession(sessionId: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const session = await workoutsApi.getSession(sessionId);
      activeSession.value = session;
      initLocalSets(session);
    } catch (e: any) {
      error.value = e.response?.data?.detail || "Ошибка при загрузке тренировки";
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Изменить/отметить подход локально в интерфейсе
   */
  function updateLocalSet(index: number, payload: Partial<WorkoutSetCreate>) {
    if (currentSets.value[index]) {
      currentSets.value[index] = {
        ...currentSets.value[index],
        ...payload,
      };
    }
  }

  /**
   * Добавить новый подход к упражнению
   */
  function addSetToExercise(exerciseId: number) {
    // Находим максимальный номер подхода для этого упражнения
    const existingSets = currentSets.value.filter((s) => s.exercise_id === exerciseId);
    const nextSetNumber = existingSets.length + 1;

    // Копируем вес и повторения с предыдущего подхода (если он был) для удобства
    const lastSet = existingSets[existingSets.length - 1];

    currentSets.value.push({
      exercise_id: exerciseId,
      set_number: nextSetNumber,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      is_completed: false,
    });
  }

  /**
   * Сохранить текущее состояние на бэкенд
   */
  async function saveProgress() {
    if (!activeSession.value) return;

    isSaving.value = true;
    try {
      const updateData: WorkoutSessionUpdate = {
        sets: currentSets.value,
      };
      const updated = await workoutsApi.updateSession(activeSession.value.id, updateData);
      activeSession.value = updated;
    } catch (e: any) {
      console.error("Ошибка при сохранении тренировки:", e);
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Завершить тренировку
   */
  async function finishWorkout(notes?: string) {
    if (!activeSession.value) return;

    isSaving.value = true;
    try {
      const updateData: WorkoutSessionUpdate = {
        status: "completed",
        finished_at: new Date().toISOString(),
        notes: notes || activeSession.value.notes,
        sets: currentSets.value,
      };

      const updated = await workoutsApi.updateSession(activeSession.value.id, updateData);
      activeSession.value = updated;
    } catch (e: any) {
      error.value = "Не удалось завершить тренировку";
      console.error(e);
    } finally {
      isSaving.value = false;
    }
  }

  // Хелпер для копирования сетов из формата ответа сервера в формат редактирования
  function initLocalSets(session: WorkoutSessionResponse) {
    if (session.sets && session.sets.length > 0) {
      currentSets.value = session.sets.map((s) => ({
        exercise_id: s.exercise_id,
        set_number: s.set_number,
        weight: s.weight,
        reps: s.reps,
        is_completed: s.is_completed,
        rpe: s.rpe,
      }));
    } else {
      currentSets.value = [];
    }
  }

  return {
    activeSession,
    templates,
    currentSets,
    isLoading,
    isSaving,
    error,
    isSessionActive,
    sessionTitle,
    progressPercentage,
    fetchTemplates,
    startWorkout,
    loadSession,
    updateLocalSet,
    addSetToExercise,
    saveProgress,
    finishWorkout,
  };
});
