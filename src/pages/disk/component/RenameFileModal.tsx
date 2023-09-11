import { defineComponent, PropType, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal } from "ant-design-vue";
import { useRequest } from "vue-request";
import { joinPath, useDiskStore } from "../store";
import { dirRename, objectRename } from "@src/src-clients/storage";
import { replaceFileName } from "@src/pages/disk/upload";

export const RenameFileModal = defineComponent({
  props: {
    path: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
    mode: {
      type: String as PropType<"DIR" | "FILE">,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(false);
    const diskStore = useDiskStore();

    const formState = ref({ name: props.name });

    const { runAsync: renameDir } = useRequest(dirRename, {
      manual: true,
      onSuccess() {
        diskStore.refreshFiles();
        Modal.destroyAll();
        message.success("文件夹名称修改成功");
      },
      onAfter() {
        loading.value = false;
      },
    });

    const { runAsync: renameObject } = useRequest(objectRename, {
      manual: true,
      onSuccess() {
        diskStore.refreshFiles();
        Modal.destroyAll();
        message.success("文件名称修改成功");
      },
      onAfter() {
        loading.value = false;
      },
    });
    return () => {
      return (
        <div>
          <Form
            layout={"vertical"}
            v-model:model={formState.value}
            onFinish={() => {
              if (!formState.value.name) {
                message.warn("请输入名称");
                return;
              }
              if (formState.value.name === "/") {
                message.warn("无法以 / 命名");
                return;
              }
              loading.value = true;
              if (props.mode === "DIR") {
                renameDir({
                  path: props.path,
                  body: {
                    newPath: joinPath(formState.value.name),
                  },
                });
              } else {
                renameObject({
                  path: props.path,
                  newpath: joinPath(formState.value.name),
                });
              }
            }}>
            <FormItem
              required
              label={"新名称"}
              name={"name"}
              rules={[{ required: true, message: "请输入新名称", trigger: "change" }]}>
              <Input
                placeholder={"请输入新名称"}
                onChange={() => {
                  if (formState.value.name?.includes("/")) {
                    message.warn("无法使用「/」充当名称");
                    return;
                  }

                  formState.value.name = replaceFileName(formState.value.name) || "";
                }}
                v-model:value={formState.value.name}
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
