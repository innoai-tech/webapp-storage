import { defineComponent } from "vue";
import { Tooltip } from "ant-design-vue";

/*
 * 文字溢出显示，传入字符串，自动添加 tooltips
 * */
export const TextEllipsis = defineComponent({
  setup(_, { slots }) {
    return () => {
      return (
        <Tooltip title={slots?.default?.()}>
          <div class={"text-ellipsis overflow-hidden whitespace-pre"}>{slots?.default?.()}</div>
        </Tooltip>
      );
    };
  },
});
