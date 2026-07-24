import "./assets/index.css";

import { ConfigProvider } from "vant";
import { createApp } from "vue";
import { retrieveLaunchParams } from "@tma.js/sdk-vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { errorHandler } from "./errorHandler";
import { init } from "./init";

// Инициализируем моки для локальной разработки вне Telegram
import "./mockEnv";

// Получаем параметры запуска Telegram Mini App
const launchParams = retrieveLaunchParams();
const { tgWebAppPlatform: platform } = launchParams;

const debug =
  (launchParams.tgWebAppStartParam || "").includes("debug") ||
  import.meta.env.DEV;

// Инициализируем приложение Telegram SDK и внутренние зависимости
init({
  debug,
  eruda: debug && ["ios", "android"].includes(platform),
  mockForMacOS: platform === "ios",
})
  .then(() => {
    const pinia = createPinia();
    const app = createApp(App);

    // Глобальный обработчик ошибок
    app.config.errorHandler = errorHandler;

    // Подключение плагинов
    app.use(ConfigProvider);
    app.use(router);
    app.use(pinia);

    // Монтирование приложения
    app.mount("#app");
  })
  .catch((error) => {
    console.error("Ошибка при инициализации приложения Telegram Mini App:", error);
  });
