import axios from "axios";
import { retrieveRawInitData } from "@tma.js/sdk-vue";

export const api = axios.create({
  // Берём URL из переменных окружения Vite, а если её нет — используем fallback
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Каждый запрос автоматически получает актуальный initDataRaw
api.interceptors.request.use(
  (config) => {
    const initDataRaw = retrieveRawInitData();
    if (initDataRaw) {
      config.headers.Authorization = `tma ${initDataRaw}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Глобальная обработка ответов и ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Ошибка авторизации Telegram Mini App (401)");
    }
    return Promise.reject(error);
  }
);
