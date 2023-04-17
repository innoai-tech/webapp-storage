import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { defineStore } from "pinia";
import "./index.less";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { useKeyMap } from "@src/utils/keymap";
import { getObject, IObjectObjectInfo } from "@src/src-clients/storage";
import { useZoomModal } from "@src/components/imagesviewer/useZoomImage";
import { useOffsetStore, useZoomStore } from "@src/components/imagesviewer/store";
import { useMoveModal } from "@src/components/imagesviewer/useMoveModal";

import { CircularArray } from "@src/components/imagesviewer/CircularArray";
import { useDiskStore } from "@src/pages/disk/store";
import { isImage } from "@src/pages/disk/Icon";

export const useImagesViewerStore = defineStore("imagesViewer", () => {
  const store = useDiskStore();
  // 获取当前可以播放的图片数据
  const images = computed(() => store.objects?.filter((obj) => !obj.isDir && isImage(obj["content-type"])));
  // 获取当前的 index（方便上一张下一张）,这个进作为内部上下控制，不暴露对外
  const currentIndex = ref(0);
  // 对外设置当前展示图片的path
  const currentImagePath = ref("");
  // 当前展示的图片，不暴露对外
  const currentImage = computed(() => images.value.find((item) => item.path === currentImagePath.value));

  function setCurrentPath(newPath) {
    currentImagePath.value = newPath;
    currentIndex.value = images.value.findIndex((image) => image.path === newPath);

    if (currentIndex.value === -1) {
      return null;
    }
  }

  function prev() {
    if (currentIndex.value === -1 || images.value.length === 1) return;
    currentIndex.value = currentIndex.value === 0 ? images.value.length - 1 : currentIndex.value - 1;
    currentImagePath.value = images.value[currentIndex.value].path;
    return images.value[currentIndex.value];
  }

  function next() {
    if (currentIndex.value === -1 || images.value.length === 1) return;
    currentIndex.value = currentIndex.value === images.value.length - 1 ? 0 : currentIndex.value + 1;
    currentImagePath.value = images.value[currentIndex.value].path;
    return images.value[currentIndex.value];
  }
  return {
    setCurrentPath,
    images,
    next,
    prev,
    currentImage,
  };
});

export const ImagesViewer = defineComponent({
  setup() {
    const store = useDiskStore();
    const loading = ref(false);
    const src = ref("");
    // 默认加个 500ms 延迟，如果 500ms 内加载了图片就没必要 loading 了
    const timer = setTimeout(() => {
      loading.value = true;
    });
    const imageRef = ref<HTMLImageElement | null>(null);

    // 方便快捷获取图片
    const circularArray = ref(new CircularArray<IObjectObjectInfo>([]));
    // 最外层容器
    const containerRef = ref<HTMLDivElement | null>(null);
    // image 的包裹层
    const imageContainerRef = ref<HTMLDivElement | null>(null);
    const imagesViewerStore = useImagesViewerStore();
    const zoomStore = useZoomStore();
    const offsetStore = useOffsetStore();

    watch(
      () => [zoomStore.zoom, offsetStore.x, offsetStore.y],
      () => {
        if (!imageContainerRef.value) return;
        // 更新一下css变量
        imageContainerRef.value.style.setProperty(
          "--imageViewerTransform",
          `translate3d(${offsetStore.x}px, ${offsetStore.y}px, 0px) scale(${zoomStore.zoom})`,
        );
      },
    );

    watch(
      () => imagesViewerStore.currentImage?.path,
      () => {
        zoomStore.clear();
        offsetStore.clear();
      },
    );

    onMounted(() => {
      watch(
        () => imagesViewerStore.currentImage?.path,
        () => {
          if (imagesViewerStore.currentImage?.path) {
            src.value = getObject.getConfig({
              path: imagesViewerStore.currentImage?.path,
            }).url;
          }
        },
        { immediate: true },
      );
    });

    onMounted(() => {
      watch(
        () => store.objects,
        () => {
          // 数据更新的时候切换一下
          circularArray.value.update(store.objects?.filter((object) => !object.isDir) || []);
        },
        { immediate: true },
      );

      useZoomModal(imageContainerRef);
      useMoveModal(containerRef);

      useKeyMap("esc", () => {
        imagesViewerStore.setCurrentPath("");
      });

      useKeyMap("up, left", (e) => {
        if (!imagesViewerStore.currentImage?.path) return;
        e.preventDefault();
        imagesViewerStore.prev();
      });

      useKeyMap("down, right", (e) => {
        if (!imagesViewerStore.currentImage?.path) return;
        e.preventDefault();
        imagesViewerStore.next();
      });
    });

    return () => {
      return (
        <div
          ref={containerRef}
          v-show={imagesViewerStore.currentImage}
          class={"left-0 top-0 images-viewer w-full h-full fixed flex items-center justify-center"}>
          <div class={"animation-fade-in z-1 images-viewer fixed inset-0 opacity-50 bg-black"}></div>
          <div
            class={"close z-30 p-2 fixed right-8 top-8 text-gray-100 cursor-pointer"}
            onClick={() => {
              imagesViewerStore.setCurrentPath("");
            }}>
            <CloseOutlined />
          </div>

          <div ref={imageContainerRef} class={"relative z-40"}>
            <div>
              {imagesViewerStore.currentImage ? (
                <>
                  <div class={"text-white text-3xl"}>
                    <LoadingOutlined v-show={loading.value} />
                  </div>
                  <img
                    onLoad={() => {
                      if (!imageRef.value || !imageRef.value.parentElement) return;
                      const height = imageRef.value.offsetHeight;
                      const width = imageRef.value.offsetWidth;
                      const parentHeight = imageRef.value.parentElement.offsetHeight;
                      // 因为默认设置的宽度铺满，所以判断一下高度是否超出，如果超出把高度设置到父元素的高度，然后等比例缩小宽度
                      if (height > parentHeight) {
                        imageRef.value.height = parentHeight;
                        imageRef.value.width = width * (parentHeight / height);
                        // 清除设置的默认宽度
                        imageRef.value.style.width = "auto";
                      }

                      loading.value = false;
                      clearTimeout(timer);
                    }}
                    ref={imageRef}
                    src={src.value}
                    class={["imageContent", "pointer-events-none"]}
                    alt={imagesViewerStore.currentImage?.name}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      );
    };
  },
});
