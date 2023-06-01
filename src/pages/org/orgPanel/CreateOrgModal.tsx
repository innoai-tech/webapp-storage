import { defineComponent, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal, Textarea } from "ant-design-vue";

import { useRequest } from "vue-request";
import { createGroup } from "@src/src-clients/storage";
import { useGroupsStore } from "@src/pages/org/orgPanel/index";

interface IFormState {
  name?: string;
  desc?: string;
}

export const CreateOrgModal = defineComponent({
  setup() {
    const formState = ref<IFormState>({});
    const groupsStore = useGroupsStore();
    const loading = ref(false);
    const { runAsync } = useRequest(createGroup, {
      manual: true,
      onSuccess() {
        message.success("创建成功");
        groupsStore.refresh();
        Modal.destroyAll();
      },
    });

    return () => {
      return (
        <div>
          <Form
            layout={"vertical"}
            v-model:model={formState.value}
            onFinish={() => {
              if (groupsStore.groups?.data?.find((group) => group.name === formState.value.name)) {
                message.error("已存在同名组织");
                return;
              }
              runAsync({ body: { name: formState.value.name!, desc: formState.value.desc } }).finally(() => {
                loading.value = false;
              });
            }}>
            <FormItem
              required
              label={"组织名称"}
              name={"name"}
              rules={[{ required: true, message: "请输入组织名称", trigger: "blur" }]}>
              <Input // @ts-ignore 禁用 mac 拼写提示
                spellcheck="false"
                placeholder={"请输入组织名称"}
                v-model:value={formState.value.name}
              />
            </FormItem>
            <FormItem label={"组织描述"} name={"desc"}>
              <Textarea placeholder={"请输入组织描述"} v-model:value={formState.value.desc} />
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
