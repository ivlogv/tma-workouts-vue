import { api } from "../api";

export interface ExerciseCatalogItem {
  id: number;
  name: string;
  category?: string | null;
  description?: string | null;
}

export interface ExerciseCreatePayload {
  name: string;
  category?: string;
  description?: string;
}

export const exercisesApi = {
  // Поиск упражнений в справочнике
  search: async (query?: string, category?: string) => {
    const res = await api.get<ExerciseCatalogItem[]>("/exercises", {
      params: { q: query || undefined, category: category || undefined },
    });
    return res.data;
  },

  // Создание кастомного упражнения в справочнике
  create: async (payload: ExerciseCreatePayload) => {
    const res = await api.post<ExerciseCatalogItem>("/exercises", payload);
    return res.data;
  },
};
