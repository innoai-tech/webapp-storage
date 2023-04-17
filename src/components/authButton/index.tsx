import { computed, DefineComponent, defineComponent } from "vue";
import { Button, Tooltip } from "ant-design-vue";
import { useCurrentAccountStore } from "@src/pages/account";

type AuthButtonType = { hasPermission?: boolean } & InstanceType<typeof Button>["$props"];

/*
 * 传入权限控制是否能操作，默认不传入按照是否为系统管理员来判断
 * */
export const AuthButton = defineComponent({
  inheritAttrs: false,
  props: {
    hasPermission: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const access = useCurrentAccountStore();
    const hasPermission = computed(() => access.account?.isAdmin || props.hasPermission);
    return () => {
      return (
        <Tooltip title={hasPermission.value ? "" : attrs.title || "无权限操作"}>
          <Button {...attrs} disabled={!hasPermission.value || !!attrs.disabled}>
            {slots.default?.()}
          </Button>
        </Tooltip>
      );
    };
  },
}) as DefineComponent<Omit<AuthButtonType, "width" | "height">>;
