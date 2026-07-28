import { api } from "../api";
import type { UserResponse } from "./types";

export const authApi = {
  // Вызов авторизации/регистрации (initData уходит автоматически через axios-интерцептор)
  loginOrRegister: async () => {
    const res = await api.post<UserResponse>("/auth/telegram");
    return res.data;
  },

  // Получить профиль текущего юзера
  getMe: async () => {
    const res = await api.get<UserResponse>("/auth/me");
    return res.data;
  },
};
