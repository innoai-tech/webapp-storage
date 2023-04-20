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
    const settingStore = useSettingStore();
    const formState = ref({
      host: settingStore.host,
    });

    return () => {
      return (
        <Form model={formState.value}>
          <FormItem
            required
            name={"host"}
            label={"host"}
            rules={[{ required: true, message: "请输入 host", trigger: "change" }]}>
            <Input placeholder={"请输入请求地址"} v-model:value={formState.value.host} />
          </FormItem>
          <div class={"flex justify-end"}>
            <Button
              type={"primary"}
              onClick={() => {
                if (formState.value.host) {
                  settingStore.host = formState.value.host;
                  message.success("修改成功");
                  Modal.destroyAll();
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
