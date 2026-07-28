import { api } from "../api";
import type {
  WorkoutSessionResponse,
  WorkoutSessionCreate,
  WorkoutSessionUpdate,
  SessionStatus,
  ExerciseResponse,
  WorkoutPlanResponse,
} from "./types";

export const workoutsApi = {
  // Начать новую сессию
  createSession: async (data: WorkoutSessionCreate) => {
    const res = await api.post<WorkoutSessionResponse>("/workouts", data);
    return res.data;
  },

  getActiveSession: async (): Promise<WorkoutSessionResponse | null> => {
    const res = await api.get<WorkoutSessionResponse | null>("/workouts/active");
    return res.data;
  },

  // Получить активную или конкретную сессию по ID
  getSession: async (sessionId: number) => {
    const res = await api.get<WorkoutSessionResponse>(`/workouts/${sessionId}`);
    return res.data;
  },

  // Обновить сессию (изменить статус, сохранить подходы, завершить)
  updateSession: async (sessionId: number, data: WorkoutSessionUpdate) => {
    const res = await api.put<WorkoutSessionResponse>(`/workouts/${sessionId}`, data);
    return res.data;
  },

  // Список всех тренировок (история)
  getSessions: async (status?: SessionStatus) => {
    const res = await api.get<WorkoutSessionResponse[]>("/workouts", {
      params: status ? { status } : undefined,
    });
    return res.data;
  },
};

export const plansApi = {
  // Получить список планов пользователя
  getPlans: async () => {
    const res = await api.get<WorkoutPlanResponse[]>("/plans");
    return res.data;
  },
};

export const exercisesApi = {
  // Получить каталог упражнений
  getCatalog: async (params?: { q?: string; category?: string }) => {
    const res = await api.get<ExerciseResponse[]>("/exercises", { params });
    return res.data;
  },
};
