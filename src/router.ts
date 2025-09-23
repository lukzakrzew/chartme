import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import LogTypesPage from "@/pages/LogTypesPage.vue";
import AddLogTypePage from "@/pages/AddLogTypePage.vue";
import AddCategoryPage from "@/pages/AddCategoryPage.vue";
import CategoriesListPage from "@/pages/CategoriesListPage.vue";
import AddLogPage from "@/pages/AddLogPage.vue";
import FillInAllPage from "@/pages/FillInAllPage.vue";
import ChartPage from "@/pages/ChartPage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: LogTypesPage },
  { path: "/add-log-type", component: AddLogTypePage },
  {
    path: "/edit-log-type/:logTypeName",
    component: AddLogTypePage,
    props: true,
  },
  { path: "/categories", component: CategoriesListPage },
  { path: "/categories/add", component: AddCategoryPage },
  {
    path: "/categories/edit/:categoryName",
    component: AddCategoryPage,
    props: true,
  },
  { path: "/log/:logTypeName", component: AddLogPage, props: true },
  { path: "/chart/:logTypeName", component: ChartPage, props: true },
  { path: "/fill-in-all", component: FillInAllPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
