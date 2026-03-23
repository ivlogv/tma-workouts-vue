import { createRouter, createWebHistory } from "vue-router";
import TestPage from "@/pages/TestPage.vue";
import IndexPage from "@/pages/IndexPage.vue";
import HistoryPage from "@/pages/HistoryPage.vue";
// import InitDataPage from "@/pages/InitDataPage.vue";
// import ThemeParamsPage from "@/pages/ThemeParamsPage.vue";
// import LaunchParamsPage from "@/pages/LaunchParamsPage.vue";

export const routes = [
  {
    path: "/",
    name: "index",
    component: IndexPage,
  },
  {
    path: "/test",
    name: "test",
    component: TestPage,
    meta: {
      title: "Test Page",
    },
  },
  {
    path: "/history",
    name: "history",
    component: HistoryPage,
    meta: {
      title: "History Page",
    },
  },
  // {
  //   path: "/init-data",
  //   name: "init-data",
  //   // component: InitDataPage,
  //   meta: {
  //     title: "Init Data",
  //     icon: "",
  //   },
  // },
  // {
  //   path: "/theme-params",
  //   name: "theme-params",
  //   component: ThemeParamsPage,
  //   meta: {
  //     title: "Theme Params",
  //     icon: "",
  //   },
  // },
  // {
  //   path: "/launch-params",
  //   name: "launch-params",
  //   // component: LaunchParamsPage,
  //   meta: {
  //     title: "Launch Params",
  //   },
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
