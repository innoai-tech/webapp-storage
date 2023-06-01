import { defineComponent, onMounted } from "vue";
import { RouterView } from "vue-router";
import { AxiosRequester } from "@src/plugins/request/axios";
import { VideosViewer } from "@src/components/videosviewer";
import { ImagesViewer } from "@src/components/imagesviewer";
import { ElConfigProvider } from "element-plus";
import zhCN from "element-plus/es/locale/lang/zh-cn";
import { theme } from "@src/plugins/theme";
import antdZhCN from "ant-design-vue/es/locale/zh_CN";
import { ConfigProvider } from "ant-design-vue";
import { useTransmissionStore } from "@src/pages/transmission";
import { invoke } from "@tauri-apps/api/tauri";
ConfigProvider.config({
  theme: {
    ...theme,
  },
});

export const App = defineComponent({
  setup() {
    const transmissionStore = useTransmissionStore();
    onMounted(() => {
      // 监听文件传输
      transmissionStore.listen();

      //  开启和后端的固定信息通道
      invoke("emit_every_second");
    });
    return () => {
      return (
        <AxiosRequester>
          <ConfigProvider locale={antdZhCN}>
            <ElConfigProvider locale={zhCN}>
              <RouterView></RouterView>
              <VideosViewer />
              <ImagesViewer />
            </ElConfigProvider>
          </ConfigProvider>
        </AxiosRequester>
      );
    };
  },
});
