import { computed, defineComponent, PropType, ref } from "vue";
import { Button, Form, FormItem, message, Modal, Select } from "ant-design-vue";
import { bindGroupAccount, IGroupRoleType } from "@src/src-clients/storage";
import { useGroupMemberPanelStore } from "./index";
import { useRequest } from "vue-request";
import { getRoleOptions } from "@src/pages/org/groupMemberPanel/BindMemberModal";

interface IFormState {
  accountID?: string;
  roleType?: IGroupRoleType;
}

export const UpdateGroupMemberRoleModal = defineComponent({
  props: {
    // 需要更新的 group 的 id
    groupID: {
      type: String,
      required: true,
    },
    // 需要更新的 member 的 id
    accountID: {
      type: String,
      required: true,
    },
    // 当前操作的用户权限（不是需要更新的 member 的 role
    operatorRoleType: {
      type: String as PropType<IGroupRoleType>,
      required: true,
    },
    // 当前需要更新的 member 的 role
    subjectRoleType: {
      type: String as PropType<IGroupRoleType>,
      required: true,
    },
  },
  setup(props) {
    const memberPanelStore = useGroupMemberPanelStore();
    const formState = ref<IFormState>({
      roleType: props.subjectRoleType,
      accountID: props.accountID,
    });
    const loading = ref(false);
    const groupMemberIDs = computed(() => memberPanelStore?.groupMembers?.data?.map((item) => item.accountID));

    const { runAsync: groupBindAccount } = useRequest(bindGroupAccount, {
      manual: true,
      onSuccess() {
        message.success("操作成功");
        memberPanelStore.refresh();
        Modal.destroyAll();
      },
    });

    return () => {
      return (
        <Form
          layout={"vertical"}
          v-model:model={formState.value}
          onFinish={() => {
            groupBindAccount({
              groupID: props.groupID,
              accountID: formState.value.accountID!,
              body: {
                roleType: formState.value.roleType!,
              },
            })
              .then(() => {
                memberPanelStore.refresh();
              })
              .finally(() => {
                loading.value = false;
              });
          }}>
          <FormItem
            required
            label={"选择用户"}
            name={"accountID"}
            rules={[{ required: true, message: "请选择需要添加的用户", trigger: "change" }]}>
            <Select
              disabled
              options={memberPanelStore.groupMembers?.data.map((member) => ({
                value: member.accountID,
                label: member.name,
                // 已存在就不允许选择了
                disabled: groupMemberIDs.value?.includes(member.accountID),
              }))}
              placeholder={"请选择需要添加的用户"}
              v-model:value={formState.value.accountID}
            />
          </FormItem>
          <FormItem
            required
            label={"用户角色"}
            name={"roleType"}
            rules={[{ required: true, message: "请选择用户角色", trigger: "change" }]}>
            <Select
              options={getRoleOptions(props.operatorRoleType)}
              placeholder={"请选择用户角色"}
              v-model:value={formState.value.roleType}
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
      );
    };
  },
});
