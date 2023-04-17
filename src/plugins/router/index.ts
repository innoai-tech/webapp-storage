import * as VueRouter from "vue-router";
import { routes } from "@src/plugins/router/routes";

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});
