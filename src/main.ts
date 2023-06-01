import { createApp } from "vue";
import "@src/tailwind.css";
import { App } from "@src/App";
import { router } from "./plugins/router";
import { pinia } from "@src/store";
import "./assets/css/index";

createApp(App).use(pinia).use(router).mount("#app");
