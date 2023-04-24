import { defineComponent, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal } from "ant-design-vue";
import { useRequest } from "vue-request";
import { joinPath, useCurrentPath, useDiskStore } from "../store";
import { createDir } from "@src/src-clients/storage";
import { replaceFileName } from "@src/pages/disk/upload";

export const CreateDirModal = defineComponent({
  setup() {
    const loading = ref(false);
    const diskStore = useDiskStore();
    const { runAsync } = useRequest(createDir, {
      manual: true,
      onSuccess() {
        message.success("新建文件夹成功");
      },
    });
    const formState = ref({ dirName: "" });
    const currentPath = useCurrentPath();
    return () => {
      return (
        <div>
          <Form
            layout={"vertical"}
            v-model:model={formState.value}
            onFinish={() => {
              if (!formState.value.dirName) {
                message.warn("请输入文件夹名称");
                return;
              }
              if (formState.value.dirName === "/") {
                message.warn("无法以 / 命名");
                return;
              }
              loading.value = true;
              runAsync({
                path: joinPath(currentPath.value, formState.value.dirName),
              })
                .then(() => {
                  diskStore.refreshFiles();
                  Modal.destroyAll();
                })
                .finally(() => {
                  loading.value = false;
                });
            }}>
            <FormItem
              required
              label={"文件夹名称"}
              name={"dirName"}
              rules={[{ required: true, message: "请输入文件夹名称", trigger: "change" }]}>
              <Input
                placeholder={"请输入文件夹名称"}
                onChange={() => {
                  if (formState.value.dirName?.includes("/")) {
                    message.warn("无法使用「/」充当名称");
                    return;
                  }
                  if (formState.value.dirName?.includes(":")) {
                    message.warn("无法使用「:」充当名称");
                    return;
                  }
                  formState.value.dirName = replaceFileName(formState.value.dirName) || "";
                }}
                v-model:value={formState.value.dirName}
              />
            </FormItem>
            <div class={"flex items-center justify-end"}>
              <Button
                onClick={() => {
                  Modal.destroyAll();
                }}>
                取消
              </Button>
              <Button loading={loading.value} htmlType={"submit"} type={"primary"} class={"ml-2"}>
                保存
              </Button>
            </div>
          </Form>
        </div>
      );
    };
  },
});
