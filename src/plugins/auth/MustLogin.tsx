import { computed, defineComponent, watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuth } from "@src/plugins/auth/index";
import { useRefreshToken } from "@src/plugins/auth/useRefreshToken";
import dayjs from "dayjs";
import { useCurrentAccountStore } from "@src/pages/account";

export const MustLogin = defineComponent({
  setup: function () {
    const router = useRouter();

    const auth = useAuth();

    // 依赖用户信息的地方太多了，所以手动改一下，必须获取到用户信息再进入页面
    const accountStore = useCurrentAccountStore();
    const isValidToken = computed(() => {
      return auth.access?.expiresDate && auth.access.expiresDate - dayjs().valueOf() > 0;
    });
    watch(
      () => isValidToken.value,
      () => {
        if (!isValidToken.value) {
          auth.setAccess(null);
          router.push({
            name: "login",
            query: {
              callback: location.href,
            },
          });
        }
      },
      { immediate: true },
    );

    // 定时刷新
    useRefreshToken();

    return () => (isValidToken.value && accountStore?.account ? <RouterView></RouterView> : null);
  },
});
