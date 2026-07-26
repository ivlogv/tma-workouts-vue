import { createRouter, createWebHistory } from "vue-router";
import TestPage from "@/pages/TestPage.vue";
import IndexPage from "@/pages/IndexPage.vue";
import HistoryPage from "@/pages/HistoryPage.vue";
import WorkoutPlansPage from "@/pages/WorkoutPlansPage.vue";
import WorkoutsPage from "@/pages/WorkoutsPage.vue";
import StatsPage from "@/pages/StatsPage.vue";
import CreateWorkoutPage from "@/pages/CreateWorkoutPage.vue";
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
  {
    path: "/workouts",
    name: "workouts",
    component: WorkoutsPage,
    meta: {
      title: "Workouts Page",
      icon: "",
    },
  },
  {
    path: "/plans",
    name: "plans",
    component: WorkoutPlansPage,
    meta: {
      title: "Workout Plans Page",
      icon: "",
    },
  },
  {
    path: "/workouts/active",
    name: "active-workout",
    component: TestPage,
    meta: {
      title: "Active Workout",
      icon: "",
    },
  },
  {
    path: "/stats",
    name: "stats",
    component: StatsPage,
    meta: {
      title: "Stats Page",
      icon: "",
    },
  },
  {
    path: "/plans/create",
    name: "create-plan",
    component: CreateWorkoutPage,
    meta: {
      title: "Create Plan",
      icon: "",
    },
  },
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
