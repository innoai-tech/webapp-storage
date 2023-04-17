import { onMounted } from "vue";
import { refreshToken } from "@src/src-clients/storage";
import { useAuth } from "@src/plugins/auth/index";

export const useRefreshToken = () => {
  const auth = useAuth();
  let timer: null | NodeJS.Timer = null;
  onMounted(() => {
    const refreshTokenOnExpires = () => {
      if (!auth.access) return;
      const token = auth.access.refreshToken;

      const refresh = () => {
        if (!token) return;
        refreshToken({
          body: {
            refresh_token: token,
          },
        }).then((res) => {
          auth.setAccess(res);

          // 重新登录后定时再刷新一次
          refreshTokenOnExpires();
        });
      };

      const expirS = Math.ceil((auth.access.expiresDate - new Date().valueOf()) / 1000);
      // 如果 token 小于十分钟就要过期，立马刷新，否则等到 token 过期十分钟前再刷新

      if (expirS < 600) {
        refresh();
      } else {
        // 如果有定时器清除一下
        if (timer) clearTimeout(timer);
        // 开一个新定时器上去
        timer = setTimeout(() => {
          refresh();
        }, (expirS - 600) * 1000); // 过期前十分钟前再刷新
      }
    };

    // 默认打开定时器
    refreshTokenOnExpires();
  });

  return null;
};
