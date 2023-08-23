import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { Button, Form, FormItem, message, Modal, Select } from "ant-design-vue";

import { useRequest } from "vue-request";
import {
  bindGroupAccount,
  displayGroupRoleType,
  GroupRoleType,
  IGroupRoleType,
  listGroupAccount,
} from "@src/src-clients/storage";
import { useGroupMemberPanelStore } from "@src/pages/org/groupMemberPanel/index";
import { useCurrentAccountStore } from "@src/pages/account";
import { useMembersStore } from "@src/pages/member";

interface IFormState {
  accountID?: string;
  roleType?: IGroupRoleType;
}

export const getRoleOptions = (currentRoleType: IGroupRoleType) => {
  const currentUserStore = useCurrentAccountStore();
  return currentRoleType === "OWNER" || currentUserStore.account?.isAdmin
    ? Object.keys(GroupRoleType).map((key) => ({
        value: key,
        label: displayGroupRoleType(key as IGroupRoleType),
      }))
    : // 非 owner 只能添加普通成员
      [{ label: displayGroupRoleType(GroupRoleType.MEMBER), value: GroupRoleType.MEMBER }];
};

export const BindMemberModal = defineComponent({
  props: {
    groupID: {
      type: String,
      required: true,
    },
    roleType: {
      type: String as PropType<IGroupRoleType>,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(false);
    const memberPanelStore = useGroupMemberPanelStore();
    const { runAsync: groupBindAccount } = useRequest(bindGroupAccount, {
      manual: true,
      onSuccess() {
        memberPanelStore.refresh();
        message.success("操作成功");
        Modal.destroyAll();
      },
    });
    const membersStore = useMembersStore();
    const formState = ref<IFormState>({});

    const { data: groupMembers, run } = useRequest(listGroupAccount, {
      refreshOnWindowFocus: true,
      manual: true,
      onSuccess(res) {
        if (!res.data?.length) {
          message.warn("成员列表为空");
        }
      },
      onError(err) {
        message.error(`获取成员列表失败${err.message}`);
      },
    });

    onMounted(() => {
      run({ groupID: props.groupID });
      membersStore.refresh();
    });

    const groupMemberIDs = computed(() => groupMembers.value?.data?.map((item) => item.accountID));

    return () => {
      return (
        <Form
          layout={"vertical"}
          v-model:model={formState.value}
          onFinish={() => {
            loading.value = true;
            groupBindAccount({
              accountID: formState.value.accountID!,
              groupID: props.groupID,
              body: {
                roleType: formState.value.roleType!,
              },
            }).finally(() => {
              loading.value = false;
            });
          }}>
          <FormItem
            required
            label={"选择用户"}
            name={"accountID"}
            rules={[{ required: true, message: "请选择需要添加的用户", trigger: "change" }]}>
            <Select
              options={membersStore.members?.data.map((member) => ({
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
              options={getRoleOptions(props.roleType)}
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
