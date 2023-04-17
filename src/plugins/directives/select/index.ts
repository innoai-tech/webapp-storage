import { Directive } from "vue"

export const Select: Directive = {
  mounted(e) {
    e.select()
  }
}
