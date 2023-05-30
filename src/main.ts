import { createApp } from "vue";
import "@src/tailwind.css";
import { App } from "@src/App";
import { router } from "./plugins/router";
import { pinia } from "@src/store";
import "./assets/css/index";
alert("create");
createApp(App).use(pinia).mount("#app");
