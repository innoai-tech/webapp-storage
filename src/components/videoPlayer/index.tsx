import { defineComponent, onMounted, ref } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export const VideoPlayer = defineComponent({
  props: {
    src: {
      required: true,
      type: String,
    },
    autoplay: {
      required: false,
      type: Boolean,
    },
  },
  setup(props) {
    const videoRef = ref<HTMLVideoElement | null>(null);
    onMounted(() => {
      const video = videoRef.value;
      if (!video) return;
      videojs(video, {
        preload: "auto",
        controls: true,
        autoplay: props.autoplay,
        loop: false,
        language: "zh-CN",
        muted: true,
        sources: [{ src: props.src, type: "video/mp4" }],
      });
    });
    return () => {
      return (
        <div>
          <video ref={videoRef} class="video-js vjs-default-skin" width="600" height="400"></video>
        </div>
      );
    };
  },
});
