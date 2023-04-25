import { computed, createVNode, defineComponent, ref, onMounted } from "vue";
import { authorize, exchange, listAuthProvider } from "@src/src-clients/storage";
import { useRequest } from "vue-request";
import { useRoute } from "vue-router";
import { LoginOutlined } from "@ant-design/icons-vue";
import { invoke } from "@tauri-apps/api/tauri";
import callbackTemplate from "@src/components/CallbackTemplate";
import { appWindow, WebviewWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { parseSearchString } from "@src/plugins/router/helpers";
import { useAuth } from "@src/plugins/auth";
import { v4 as uuid } from "uuid";
import "./index.less";
import { Button, Modal, Card } from "ant-design-vue";
import { Setting } from "@src/pages/setting";
export const Index = defineComponent({
  setup() {
    const loading = ref(false);
    const route = useRoute();
    const auth = useAuth();
    const { runAsync: runExchange } = useRequest(exchange, {
      manual: true,
      onSuccess(res) {
        auth.setAccess(res);
        location.href = `${route.query?.callback}`;
      },
      onAfter() {
        loading.value = false;
      },
    });

    const { data: providersMap } = useRequest(() => listAuthProvider(), {
      refreshOnWindowFocus: true,
    });

    const providers = computed(() =>
      providersMap.value?.providers
        ? Object.keys(providersMap.value?.providers).map((key) => ({
            ...providersMap.value?.providers[key],
            providerName: key,
          }))
        : [],
    );
    onMounted(() => {
      if (
        !window.__TAURI_METADATA__ &&
        parseSearchString(location.search)?.code &&
        parseSearchString(location.search)?.name
      ) {
        loading.value = true;
        runExchange({ code: parseSearchString(location.search).code, name: parseSearchString(location.search).name });
      }
    });

    return () => (
      <div class="login relative">
        <div class={"absolute bottom-4 left-4 text-xs"}>
          <Button
            type={"link"}
            onClick={() => {
              Modal.confirm({
                title: "错误信息",
                closable: true,
                width: "800px",
                wrapClassName: "confirmModal",
                content: createVNode(<Setting />),
                cancelButtonProps: { style: { display: "none" } } as any,
                okButtonProps: { style: { display: "none" } } as any,
              });
            }}>
            域名配置
          </Button>
        </div>
        <Card title={"AI 数据管理工具"} class={"login-card fixed"}>
          {providers.value.map((item) => {
            return (
              <Button
                class={"flex items-center"}
                type={"link"}
                loading={loading.value}
                disabled={loading.value}
                icon={<LoginOutlined />}
                onClick={async () => {
                  const providerName = item.providerName;
                  if (window.__TAURI_METADATA__) {
                    invoke("plugin:oauth|start", {
                      config: {
                        response: callbackTemplate,
                      },
                    }).then((port) => {
                      const url = authorize.getConfig({
                        redirect_uri: `http://localhost:${port}`,
                        name: providerName,
                      }).url;

                      const webview = new WebviewWindow(uuid(), {
                        url,
                        alwaysOnTop: true,
                        title: "login",
                      });
                      loading.value = true;
                      listen("oauth://url", (data) => {
                        const { code } = parseSearchString(data.payload as string);
                        webview.close();
                        appWindow.show();

                        if (code) {
                          runExchange({ code, name: providerName });
                        }
                      });
                      webview.listen("tauri://close-requested", () => {
                        loading.value = false;
                      });
                    });
                  } else {
                    // 兼容 web 登录
                    const url = authorize.getConfig({
                      redirect_uri: `${location.href}&name=${providerName}`,
                      name: providerName,
                    }).url;
                    location.href = url;
                  }
                }}>
                通过 {item.providerName?.toUpperCase()} 登录
              </Button>
            );
          })}
        </Card>
      </div>
    );
  },
});
