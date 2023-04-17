import { defineStore } from "pinia";
import { ref } from "vue";

export interface ICanvasOffset {
  x: number;
  y: number;
}

export const useOffsetStore = defineStore("imageViewerOffsetStore", () => {
  const x = ref(0);
  const y = ref(0);
  return {
    x,
    y,
    set(offset: ICanvasOffset) {
      x.value = offset.x;
      y.value = offset.y;
    },
    clear() {
      x.value = 0;
      y.value = 0;
    },
  };
});
export const useZoomStore = defineStore("imageViewerZoomStore", () => {
  const zoom = ref(1);
  return {
    zoom,
    set(newZoom: number) {
      zoom.value = newZoom;
    },
    clear() {
      zoom.value = 1;
    },
  };
});
