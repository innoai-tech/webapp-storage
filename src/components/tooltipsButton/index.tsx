import { DefineComponent, defineComponent } from "vue";
import { Button, Tooltip } from "ant-design-vue";

type TooltipsButtonType = InstanceType<typeof Button>["$props"];

export const TooltipButton = defineComponent({
  inheritAttrs: false,

  setup(props, { slots, attrs }) {
    return () => (
      <Tooltip title={attrs.disabled ? attrs.title : ""}>
        <Button {...attrs} disabled={!!attrs?.disabled} title={undefined}>
          {slots.default?.()}
        </Button>
      </Tooltip>
    );
  },
}) as DefineComponent<TooltipsButtonType>;
