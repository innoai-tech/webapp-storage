import hotkeys, { KeyHandler } from "hotkeys-js"
import { onUnmounted, ref } from "vue"

export const useKeyMap = (key: string, keyHandler: KeyHandler) => {
  const effects = ref<{ key: string; keyHandler: KeyHandler }[]>([])

  onUnmounted(() => {
    // 卸载记录的所有的快捷键
    effects.value.forEach((effect) => {
      hotkeys.unbind(effect.key, effect.keyHandler)
    })
  })
  // 绑定快捷键
  hotkeys(key, keyHandler)

  // 同时加入 effect 方便后续自动卸载
  effects.value.push({ key, keyHandler })
}
