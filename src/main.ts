import './assets/index.css';

import naive from 'naive-ui'
import { createApp } from 'vue';
import { retrieveLaunchParams } from '@tma.js/sdk-vue';

import App from './App.vue';
import router from './router';
import { errorHandler } from './errorHandler';
import { init } from './init';

// Mock the environment in case, we are outside Telegram.
import './mockEnv';

const launchParams = retrieveLaunchParams();
const { tgWebAppPlatform: platform } = launchParams;
const debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;


// const tp = launchParams.tgWebAppThemeParams;
// console.log('Launch Params:', launchParams);
// console.log('Theme Params:', tp);
// Configure all application dependencies.
init({
  debug,
  eruda: debug && ['ios', 'android'].includes(platform),
  mockForMacOS: platform === 'ios',
})
  .then(() => {
    const app = createApp(App);
    app.config.errorHandler = errorHandler;
    app.use(naive);
    app.use(router);
    app.mount('#app');
  });
