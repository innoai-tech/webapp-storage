import { defineComponent, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal } from "ant-design-vue";
import { defineStore } from "pinia";
import { appConf } from "@src/config";

export const useSettingStore = defineStore(
  "settingsv3",
  () => {
    const baseUrl = appConf()?.["SRV_STORAGE"];
    const host = ref(baseUrl);

    return {
      host,
      changeHost(newHost: string) {
        host.value = newHost;
      },
    };
  },
  {
    persist: { enabled: true },
  },
);

export const Setting = defineComponent({
  setup() {
    const defaultBaseUrl = appConf()?.["SRV_STORAGE"];
    const settingStore = useSettingStore();
    const formState = ref({
      host: settingStore.host?.trim() ? settingStore.host?.trim() : defaultBaseUrl,
    });

    return () => {
      return (
        <Form model={formState.value}>
          <FormItem
            required
            name={"host"}
            label={"host"}
            rules={[{ required: true, message: "请输入 host", trigger: "change" }]}>
            <Input
              // @ts-ignore 禁用 mac 拼写提示
              spellcheck="false"
              placeholder={"请输入请求地址"}
              v-model:value={formState.value.host}
            />
          </FormItem>
          <a
            href={"javascript:;"}
            class={"flex justify-end mb-10 color"}
            onClick={() => {
              formState.value.host = defaultBaseUrl;
              message.success("已恢复默认地址");
            }}>
            恢复默认地址
          </a>
          <div class={"flex justify-end"}>
            <Button
              type={"primary"}
              onClick={() => {
                if (formState.value.host?.trim()) {
                  settingStore.host = formState.value.host?.trim();
                  message.success("修改成功");
                  Modal.destroyAll();
                  location.reload();
                }
              }}>
              确定
            </Button>
          </div>
        </Form>
      );
    };
  },
});
