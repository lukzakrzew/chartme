import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LogTypes from "@/pages/LogTypes.vue";
import AddLogType from "@/pages/AddLogType.vue";
import AddLog from "@/pages/AddLog.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: LogTypes },
  { path: "/add-log-type", component: AddLogType },
  { path: "/log/:logTypeName", component: AddLog, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
