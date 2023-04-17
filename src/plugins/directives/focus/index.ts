import { Directive } from "vue"

export const Focus: Directive = {
  mounted(e) {
    e.focus()
  }
}
