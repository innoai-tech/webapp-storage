import axios from "axios";
import { defineComponent, onBeforeMount, ref, toRefs } from "vue";
import { defineStore } from "pinia";
import { APP_CONFIG } from "@src/config";
import { useAuth } from "@src/plugins/auth";
import { StatusUnauthorized } from "@src/plugins/request/status";
import { ElMessage } from "element-plus";

export const axiosRequester = axios.create();

const useTalkErrorMsgStore = defineStore("calkErrorMsg", () => {
  const messages = ref<string[]>([]);
  return {
    messages,
    pushMessages(msg: string) {
      // 如果正在提示就不弹窗了，避免重复提示相同错误
      if (messages.value.includes(msg)) return;
      // 插入数组
      messages.value.push(msg);

      // 弹窗关闭的时候删除提示
      ElMessage.error(msg);
    },
  };
});

export const useAuthorization = () => {
  const accessStore = useAuth();
  const { access } = toRefs(accessStore);

  return () => (access.value ? `bearer ${access.value?.accessToken}` : "");
};

export const AxiosRequester = defineComponent({
  setup(_, { slots }) {
    const accessStore = useAuth();

    // 设置 token
    onBeforeMount(() => {
      const id = axiosRequester.interceptors.request.use((config) => {
        // img 无法使用 header，暂时不用 header 传播
        if (config.headers) {
          // set(config.headers, "Authorization", `bearer ${access.value?.accessToken}`);
        } else {
          // set(config, "headers", {
          //   Authorization: getAuthorization(),
          // });

          console.log(config.params);
        }

        // fixme 等待后端修复这个字段的逻辑 标记组件来源
        if (config.headers) {
          delete config.headers.referPCode;
        }
        return config;
      });

      return () => {
        axiosRequester.interceptors.request.eject(id);
      };
    });

    // trim
    onBeforeMount(() => {
      const id = axiosRequester.interceptors.request.use((config) => {
        if (config.method === "post" || config.method === "put") {
          const data = config.data;
          config.data = data ? trimString(data) : data;
        }
        return config;
      });

      return () => {
        axiosRequester.interceptors.request.eject(id);
      };
    });

    onBeforeMount(() => {
      const talkErrorMsgStore = useTalkErrorMsgStore();
      const id = axiosRequester.interceptors.response.use(
        function (response) {
          return response;
        },
        function (error) {
          // 因为请求被中断引起的reject
          if (error instanceof axios.Cancel) {
            return Promise.reject(error);
          }

          const responseData = error.response?.data;

          // 提示错误信息
          if (responseData?.msg && responseData?.canBeTalkError) {
            talkErrorMsgStore.pushMessages(responseData.msg);
          }

          // 401 清除掉登录信息
          if (error.response?.status === StatusUnauthorized) {
            accessStore.setAccess(null);
          }

          // 权限组被删除
          if (error.response?.data.code === 403999006) {
            window.location.replace("/");
          }

          return Promise.reject(error);
        },
      );

      return () => {
        axiosRequester.interceptors.response.eject(id);
      };
    });
    return () => {
      return slots?.default?.();
    };
  },
  beforeCreate() {
    // @ts-ignore
    const env = import.meta.env ? "DEV" : "PROD";
    const nameMeta = document.createElement("meta");
    nameMeta.content = `appName=${APP_CONFIG.APP_NAME()},env=${APP_CONFIG.ENV(env)},version=`;
    nameMeta.name = "devkit:app";
    const configMeta = document.createElement("meta");
    configMeta.content = `${Object.keys(APP_CONFIG)
      .map((key) => `${key}=${APP_CONFIG[key]?.(env)}`)
      .join(",")}`;
    configMeta.name = "devkit:config";

    document.querySelector("head")?.appendChild(nameMeta);
    document.querySelector("head")?.appendChild(configMeta);
  },
});

// 遍历去掉空格
function trimString(property: any) {
  // 如果是字符串，直接 trim
  if (typeof property === "string") {
    return property.trim();
  }

  // 如果是数字数组，遍历一下
  if (Array.isArray(property)) {
    return property.map((item) => trimString(item));
    // 如果是对象，遍历属性，屏蔽 undefined 和 null
  } else if (typeof property === "object" && property !== null) {
    Object.keys(property).forEach((key) => {
      property[key] = trimString(property[key]);
    });
    return property;
  }

  return property;
}
