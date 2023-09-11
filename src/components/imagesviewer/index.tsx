import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { defineStore } from "pinia";
import "./index.less";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  CopyOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import { useKeyMap } from "@src/utils/keymap";
import { getObject, IObjectObjectInfo } from "@src/src-clients/storage";
import { useZoomModal } from "@src/components/imagesviewer/useZoomImage";
import { useOffsetStore, useZoomStore } from "@src/components/imagesviewer/store";
import { useMoveModal } from "@src/components/imagesviewer/useMoveModal";
import { CircularArray } from "@src/components/imagesviewer/CircularArray";
import { useDiskStore } from "@src/pages/disk/store";
import { isImage } from "@src/pages/disk/Icon";
import { writeText } from "@tauri-apps/api/clipboard";
import { message, Tooltip } from "ant-design-vue";
import { toFullTime } from "@src/utils/date";

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

  function getNextPageObjects() {
    // 全部查找完毕，回到第一页
    if (store.offset >= store.total) {
      currentIndex.value = 0;
    } else {
      store.getFiles(store.offset + store.size)?.then((res) => {
        // 如果有图片，就结束，否则继续查询
        if (res.data?.some((obj) => !obj.isDir && isImage(obj["content-type"]))) {
          currentIndex.value += 1;
        } else {
          // 继续获取，直到有图片
          getNextPageObjects();
        }
      });
    }
  }

  function next() {
    if (currentIndex.value === -1 || images.value.length === 1) return;

    // 如果已经是最后一个，并且依旧有分页可以查询
    if (currentIndex.value === images.value.length - 1 && store.objects?.length !== store.total) {
      // 查询下一页
      getNextPageObjects();
    } else {
      currentIndex.value = currentIndex.value === images.value.length - 1 ? 0 : currentIndex.value + 1;
      currentImagePath.value = images.value[currentIndex.value].path;
      return images.value[currentIndex.value];
    }
  }

  // 查找当前图片在 object 里的 index

  const currentObjIndex = computed(() =>
    store.objects?.findIndex((item) => item.sha256 === currentImage.value?.sha256),
  );
  return {
    currentObjIndex,
    setCurrentPath,
    images,
    next,
    prev,
    currentIndex,
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
    const imageWidth = ref(0);
    const imageHeight = ref(0);
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
            class={"close z-30 p-2 text-xl fixed right-8 top-8 text-gray-100 cursor-pointer"}
            onClick={() => {
              imagesViewerStore.setCurrentPath("");
            }}>
            <CloseOutlined />
          </div>

          <Tooltip title={"上一张"}>
            <div
              class={"z-30 text-xl p-2 fixed left-8 top-center text-gray-100 cursor-pointer prev text-white"}
              onClick={() => {
                if (!imagesViewerStore.currentImage?.path) return;
                imagesViewerStore.prev();
              }}>
              <ArrowLeftOutlined />
            </div>
          </Tooltip>
          <Tooltip title={"下一张"}>
            <div
              class={"z-30 p-2 text-xl fixed right-8 top-center text-gray-100 cursor-pointer next text-white"}
              onClick={() => {
                if (!imagesViewerStore.currentImage?.path) return;
                imagesViewerStore.next();
              }}>
              <ArrowRightOutlined />
            </div>
          </Tooltip>
          {!!imagesViewerStore.currentImage && (
            <>
              <div class={"z-30 p-2 text-xl fixed left-8 top-8 text-gray-100 cursor-pointer next text-white"}>
                图片名称：{imagesViewerStore.currentImage?.name}
                <Tooltip title={"复制名称"}>
                  <CopyOutlined
                    class={"ml-2"}
                    onClick={() => {
                      if (imagesViewerStore.currentImage?.name) {
                        writeText(imagesViewerStore.currentImage?.name);
                        message.success("复制成功");
                      }
                    }}
                  />
                </Tooltip>
              </div>
              <div class={"z-30 p-2 text-sm fixed left-8 top-16 text-gray-200 cursor-pointer next"}>
                创建时间：{toFullTime(imagesViewerStore.currentImage?.updatedAt)}
                <Tooltip title={"复制名称"}>
                  <CopyOutlined
                    class={"ml-2"}
                    onClick={() => {
                      if (imagesViewerStore.currentImage?.name) {
                        writeText(imagesViewerStore.currentImage?.name);
                        message.success("复制成功");
                      }
                    }}
                  />
                </Tooltip>
              </div>
              <div class={"z-30 p-2 text-sm fixed left-8 top-16 mt-5 text-gray-200 cursor-pointer next"}>
                预览进度：{`${imagesViewerStore.currentObjIndex + 1}/${store.total || 0}`}
              </div>
              <div class={"z-30 p-2 text-sm fixed left-8 top-16 mt-10 text-gray-200 cursor-pointer next"}>
                图片分辨率：{`${imageWidth.value}*${imageHeight.value}`}
              </div>
            </>
          )}
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
                      imageHeight.value = imageRef.value.offsetHeight;
                      imageWidth.value = imageRef.value.offsetWidth;
                      const parentHeight = imageRef.value.parentElement.offsetHeight;
                      // 因为默认设置的宽度铺满，所以判断一下高度是否超出，如果超出把高度设置到父元素的高度，然后等比例缩小宽度
                      if (imageHeight.value > parentHeight) {
                        imageRef.value.height = parentHeight;
                        imageRef.value.width = imageWidth.value * (parentHeight / imageHeight.value);
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
