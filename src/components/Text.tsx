import { watch } from "vue";
import { defineComponent, onMounted, ref } from "vue";

export const Text = defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const domRef = ref<HTMLDivElement | null>(null);
    const value = ref("");
    onMounted(() => {
      const dom = domRef.value;
      if (!dom) return;

      watch(
        () => props.text,
        () => {
          if (!props.text || !dom.parentElement) return;
          const count = dom.parentElement!.clientWidth / 14;
          if (count >= props.text.length) {
            value.value = props.text;
          } else {
            const ellipsis = "...";

            const oneThirdLength = Math.floor(props.text.length / 3);
            const truncatedText =
              props.text.slice(0, oneThirdLength) + ellipsis + props.text.slice(-2 * oneThirdLength);
            value.value = truncatedText;
          }
        },
        { immediate: true },
      );
    });
    return () => {
      return <div ref={domRef}>{value.value || props.text}</div>;
    };
  },
});
