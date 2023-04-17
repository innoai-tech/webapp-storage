import { createPinia } from "pinia";
import piniaPersist from "./persist";
import piniaLogs from "./storeLogs";

export const pinia = createPinia().use(piniaPersist).use(piniaLogs);
