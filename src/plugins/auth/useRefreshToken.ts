import { onMounted } from "vue";
import { refreshToken } from "@src/src-clients/storage";
import { useAuth } from "@src/plugins/auth/index";
import { listen } from "@tauri-apps/api/event";
import { watch } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { useAuthorization } from "@src/plugins/request/axios";
export const useRefreshToken = () => {
  const auth = useAuth();
  const getAuthorization = useAuthorization();

  watch(
    () => auth.access,
    () => {
      if (auth.access?.accessToken) {
        invoke("set_auth_token", {
          auth: getAuthorization(),
        });
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    let loading = false;

    const refresh = () => {
      if (!auth.access || loading) return;
      const token = auth.access.refreshToken;
      refreshToken({
        body: {
          refresh_token: token,
        },
      })
        .then((res) => {
          console.log(res.access_token);
          auth.setAccess(res);
        })
        .finally(() => {
          setTimeout(() => {
            loading = false;
          }, 1000);
        });
    };

    // 前端定时器存在不准确的问题，所以从后端触发定时器
    listen("tauri://interval_refresh_token", () => {
      if (!auth.access || loading) return;
      const expirS = Math.ceil((auth.access.expiresDate - new Date().valueOf()) / 1000);
      // 如果 token 小于十分钟就要过期，立马刷新
      if (expirS < 600) {
        refresh();
      }
    });

    // 触发立即刷新
    listen("tauri://refresh_token", () => {
      if (!auth.access || loading) return;
      console.log("立即刷新 token");
      refresh();
    });
  });

  return null;
};
