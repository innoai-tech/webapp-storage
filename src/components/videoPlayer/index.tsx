import { defineComponent, ref } from "vue";

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
    return () => {
      return (
        <div>
          <video
            ref={videoRef}
            src={props.src}
            autoplay
            muted
            class="video-js vjs-default-skin"
            width="600"
            height="400"></video>
        </div>
      );
    };
  },
});
