import { toRefs, Ref, onMounted } from "vue"
import { ICanvasOffset, useOffsetStore } from "./store"
// max limit
export const Max_OFFSET_WIDTH = 2000
export const Max_OFFSET_HEIGHT = 2000

export const useMoveModal = (dashboardRef: Ref<HTMLDivElement | null>) => {
  const offsetStore = useOffsetStore()
  const { x, y } = toRefs(offsetStore)
  const dom = dashboardRef.value

  if (!dom) return
  let prevOffset: ICanvasOffset | null = null
  let timer: NodeJS.Timeout | null = null

  const onWheel = (e: WheelEvent) => {
    // 不处理按下 ctrl 和 cmd 的情况
    if (e.ctrlKey || e.metaKey) return

    if (prevOffset === null) {
      prevOffset = { x: x.value, y: y.value }
    }
    e.preventDefault()
    const deltaX = e.deltaX || (e as any).wheelDeltaX
    const deltaY = e.deltaY || (e as any).wheelDeltaY

    const offset = { x: prevOffset.x, y: prevOffset.y }
    offset.x -= deltaX
    offset.y -= deltaY

    // limit
    if (offset.x < -Max_OFFSET_WIDTH) {
      offset.x = -Max_OFFSET_WIDTH
    }
    if (offset.x > Max_OFFSET_WIDTH) {
      offset.x = Max_OFFSET_WIDTH
    }
    if (offset.y < -Max_OFFSET_HEIGHT) {
      offset.y = -Max_OFFSET_HEIGHT
    }
    if (offset.y > Max_OFFSET_HEIGHT) {
      offset.y = Max_OFFSET_HEIGHT
    }
    prevOffset = { ...offset }

    if (timer) {
      clearTimeout(timer)
    }

    offsetStore.set(offset)

    // because wheel event not have "wheelEnd" event,so simulate it
    timer = setTimeout(() => {
      prevOffset = null
    }, 200)
  }

  dom.addEventListener("wheel", onWheel)

  onMounted(() => {
    dom.removeEventListener("wheel", onWheel)
  })
}
