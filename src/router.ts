import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LogTypes from "@/pages/LogTypes.vue";
import AddLogType from "@/pages/AddLogType.vue";
import AddCategory from "@/pages/AddCategory.vue";
import AddLog from "@/pages/AddLog.vue";
import FillInAll from "@/pages/FillInAll.vue";
import Chart from "@/pages/Chart.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: LogTypes },
  { path: "/add-log-type", component: AddLogType },
  { path: "/edit-log-type/:logTypeName", component: AddLogType, props: true },
  { path: "/add-category", component: AddCategory },
  { path: "/log/:logTypeName", component: AddLog, props: true },
  { path: "/chart/:logTypeName", component: Chart, props: true },
  { path: "/fill-in-all", component: FillInAll },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
