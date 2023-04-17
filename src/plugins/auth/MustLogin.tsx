import { computed, defineComponent, watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuth } from "@src/plugins/auth/index";
import { useRefreshToken } from "@src/plugins/auth/useRefreshToken";
import dayjs from "dayjs";

export const MustLogin = defineComponent({
  setup: function () {
    const router = useRouter();

    const auth = useAuth();

    const isValidToken = computed(() => {
      return auth.access?.expiresDate && auth.access.expiresDate - dayjs().valueOf() > 100;
    });

    // 定时刷新
    useRefreshToken();
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

    return () => (auth.access && isValidToken ? <RouterView></RouterView> : null);
  },
});
