import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { defineStore } from "pinia";
import { CloseOutlined } from "@ant-design/icons-vue";
import { useKeyMap } from "@src/utils/keymap";
import { getObject, IObjectObjectInfo } from "@src/src-clients/storage";
import { useZoomModal } from "@src/components/imagesviewer/useZoomImage";
import { useOffsetStore, useZoomStore } from "@src/components/imagesviewer/store";
import { useMoveModal } from "@src/components/imagesviewer/useMoveModal";
import { CircularArray } from "@src/components/imagesviewer/CircularArray";
import { useDiskStore } from "@src/pages/disk/store";
import { isVideo } from "@src/pages/disk/Icon";
import { VideoPlayer } from "@src/components/videoPlayer";

export const useVideosViewerStore = defineStore("videosViewer", () => {
  const store = useDiskStore();
  // 获取当前可以播放的图片数据
  const videos = computed(() => store.objects?.filter((obj) => !obj.isDir && isVideo(obj["content-type"])));
  // 获取当前的 index（方便上一张下一张）,这个进作为内部上下控制，不暴露对外
  const currentIndex = ref(0);
  // 对外设置当前展示图片的path
  const currentVideoPath = ref("");
  // 当前展示的图片，不暴露对外
  const currentVideo = computed(() => videos.value.find((item) => item.path === currentVideoPath.value));

  function setCurrentPath(newPath) {
    currentVideoPath.value = newPath;
    currentIndex.value = videos.value.findIndex((image) => image.path === newPath);

    if (currentIndex.value === -1) {
      return null;
    }
  }

  function prev() {
    // 取上一个，到第一个自动取最后一个
    currentIndex.value = (currentIndex.value - 1) % videos.value.length;
    currentVideoPath.value = videos.value[currentIndex.value].path;
    return videos.value[currentIndex.value];
  }
  function next() {
    currentIndex.value = (currentIndex.value + 1) % videos.value.length;
    currentVideoPath.value = videos.value[currentIndex.value].path;
    return videos.value[currentIndex.value];
  }
  return {
    setCurrentPath,
    videos,
    next,
    prev,
    currentVideo,
  };
});

export const VideosViewer = defineComponent({
  setup() {
    const store = useDiskStore();
    // 方便快捷获取图片
    const circularArray = ref(new CircularArray<IObjectObjectInfo>([]));
    // 最外层容器
    const containerRef = ref<HTMLDivElement | null>(null);
    // image 的包裹层
    const videoContainerRef = ref<HTMLDivElement | null>(null);
    const videosViewerStore = useVideosViewerStore();
    const zoomStore = useZoomStore();
    const offsetStore = useOffsetStore();

    const src = computed(() =>
      videosViewerStore.currentVideo?.path
        ? getObject.getConfig({
            path: videosViewerStore.currentVideo.path,
          }).url
        : null,
    );

    watch(
      () => [zoomStore.zoom, offsetStore.x, offsetStore.y],
      () => {
        if (!videoContainerRef.value) return;
        videoContainerRef.value.style.setProperty(
          "--imageViewerTransform",
          `translate3d(${offsetStore.x}px, ${offsetStore.y}px, 0px) scale(${zoomStore.zoom})`,
        );
      },
    );

    watch(
      () => videosViewerStore.currentVideo?.path,
      () => {
        zoomStore.clear();
        offsetStore.clear();
      },
    );

    onMounted(() => {
      watch(
        () => store.objects,
        () => {
          // 数据更新的时候切换一下
          circularArray.value.update(store.objects?.filter((object) => !object.isDir) || []);
        },
        { immediate: true },
      );

      useZoomModal(videoContainerRef);
      useMoveModal(containerRef);

      useKeyMap("esc", () => {
        videosViewerStore.setCurrentPath("");
      });

      useKeyMap("up, left", (e) => {
        if (!videosViewerStore.currentVideo?.path) return;
        e.preventDefault();
        videosViewerStore.prev();
      });

      useKeyMap("down, right", (e) => {
        if (!videosViewerStore.currentVideo?.path) return;
        e.preventDefault();
        videosViewerStore.next();
      });
    });

    watch(
      () => src.value,
      () => {
        console.log(src.value);
      },
    );

    return () => {
      return (
        <div
          ref={containerRef}
          v-show={videosViewerStore.currentVideo}
          class={"left-0 top-0 videos-viewer w-full h-full fixed flex items-center justify-center"}>
          <div class={"animation-fade-in z-1 videos-viewer fixed inset-0 opacity-50 bg-black"}></div>
          <div
            class={"close z-30 p-2 fixed right-8 top-8 text-gray-100 cursor-pointer"}
            onClick={() => {
              videosViewerStore.setCurrentPath("");
            }}>
            <CloseOutlined />
          </div>

          <div ref={videoContainerRef} class={"relative z-40"}>
            <div class={"imageContent"}>{src.value ? <VideoPlayer autoplay src={src.value} /> : null}</div>
          </div>
        </div>
      );
    };
  },
});
