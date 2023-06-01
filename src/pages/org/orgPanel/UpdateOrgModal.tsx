import { defineComponent, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal, Textarea } from "ant-design-vue";
import { useRequest } from "vue-request";
import { updateGroup } from "@src/src-clients/storage";
import { useGroupsStore } from "@src/pages/org/orgPanel/index";

interface IFormState {
  name: string;
  desc?: string;
}

export const UpdateOrgModal = defineComponent({
  props: {
    groupID: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
  },
  setup(props) {
    const formState = ref<IFormState>({ name: props.name, desc: props.desc });
    const groupsStore = useGroupsStore();
    const loading = ref(false);
    const { runAsync } = useRequest(updateGroup, {
      manual: true,
      onSuccess() {
        message.success("更新成功");
        groupsStore.refresh();
        Modal.destroyAll();
      },
    });

    return () => {
      return (
        <Form
          layout={"vertical"}
          v-model:model={formState.value}
          onFinish={() => {
            runAsync({
              groupID: props.groupID,
              body: { name: formState.value.name!, desc: formState.value.desc },
            }).finally(() => {
              loading.value = false;
            });
          }}>
          <FormItem
            required
            label={"组织名称"}
            name={"name"}
            rules={[{ required: true, message: "请输入组织名称", trigger: "blur" }]}>
            <Input
              // @ts-ignore 禁用 mac 拼写提示
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
      );
    };
  },
});
