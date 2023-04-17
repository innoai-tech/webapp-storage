import { App } from "vue"
import { Focus } from "./focus"
import { Select } from "./select"

export const setGlobalDirectives = (app: App<Element>) => {
  app.directive("focus", Focus)
  app.directive("select", Select)
}
