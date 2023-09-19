import { Tooltip } from "ant-design-vue";
import { watch } from "vue";
import { defineComponent, onMounted, ref } from "vue";

export const Text = defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: false,
    },
  },
  emits: ["click"],
  setup(props, { emit }) {
    const domRef = ref<HTMLDivElement | null>(null);
    const value = ref("");
    onMounted(() => {
      const dom = domRef.value;
      if (!dom) return;

      watch(
        () => props.text,
        () => {
          if (!props.text || !dom.parentElement) return;
          console.log(dom.parentElement!.clientWidth);
          const count = dom.parentElement!.clientWidth / 14;
          if (count >= props.text.length) {
            value.value = props.text;
          } else {
            const ellipsis = "...";

            const oneThirdLength = Math.floor(count / 2);
            const truncatedText =
              props.text.slice(0, oneThirdLength * 2) + ellipsis + props.text.slice(-2 * oneThirdLength);
            value.value = truncatedText;
          }
        },
        { immediate: true },
      );
    });
    return () => {
      return (
        <Tooltip title={props.text}>
          <div
            class={props.class}
            ref={domRef}
            onClick={(e) => {
              emit("click", e);
            }}>
            {value.value || props.text}
          </div>
        </Tooltip>
      );
    };
  },
});
