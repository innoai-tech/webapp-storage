import { computed, createVNode, defineComponent, onMounted, ref, watch } from "vue";
import { useRequest } from "vue-request";
import { listGroupAccount } from "@src/src-clients/storage";
import { message, Modal, Select } from "ant-design-vue";
import { UsergroupAddOutlined } from "@ant-design/icons-vue";
import { defineStore } from "pinia";
import { useCurrentAccountStore } from "@src/pages/account";
import { useGroupsStore } from "@src/pages/org/orgPanel";
import { BindMemberModal } from "@src/pages/org/groupMemberPanel/BindMemberModal";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/org/groupMemberPanel/useColumns";
import { AuthButton } from "@src/components/authButton";

export const useGroupMemberPanelStore = defineStore("memberPanel", () => {
  const {
    data: groupMembers,
    runAsync,
    refresh,
  } = useRequest(listGroupAccount, {
    manual: true,
    refreshOnWindowFocus: true,
  });

  return {
    getGroupMembers(groupID) {
      return runAsync({ size: -1, groupID: groupID });
    },
    groupMembers,
    refresh,
  };
});

export const GroupMemberPanel = defineComponent({
  setup() {
    const currentGroupID = ref<string>("");
    const groupsStore = useGroupsStore();
    const currentGroup = computed(() =>
      groupsStore.groups?.data?.find((group) => group.groupID === currentGroupID.value),
    );
    const accountStore = useCurrentAccountStore();
    const memberPanelStore = useGroupMemberPanelStore();

    const columns = useColumns();

    const currentAccountInGroupRoleType = computed(
      () =>
        memberPanelStore.groupMembers?.data?.find((item) => item.accountID === accountStore.account?.accountID)
          ?.roleType,
    );

    onMounted(() => {
      groupsStore.refresh().then((res) => {
        currentGroupID.value = res.data?.[0]?.groupID;
      });
      watch(
        () => currentGroupID.value,
        () => {
          if (currentGroupID.value) {
            memberPanelStore.getGroupMembers(currentGroupID.value);
          }
        },
        { immediate: true },
      );
    });

    return () => {
      return (
        <div>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between"}>
              <div class={"flex gap-2"}>
                <AuthButton
                  title={"普通用户无法添加成员"}
                  hasPermission={
                    // 普通成员不能加人
                    currentAccountInGroupRoleType.value !== "MEMBER"
                  }
                  icon={<UsergroupAddOutlined />}
                  class={"flex items-center"}
                  onClick={() => {
                    if (!currentGroup.value) {
                      return message.warn("请先选择组织");
                    }
                    Modal.confirm({
                      title: "添加用户",
                      closable: true,
                      centered: true,
                      content: createVNode(
                        <BindMemberModal groupID={currentGroupID.value} roleType={currentGroup.value.roleType} />,
                      ),
                      icon: null,
                      cancelButtonProps: { style: { display: "none" } } as any,
                      okButtonProps: { style: { display: "none" } } as any,
                      wrapClassName: "confirmModal",
                    });
                  }}>
                  添加成员
                </AuthButton>
              </div>
              <div>
                <Select
                  allowClear
                  v-model:value={currentGroupID.value}
                  options={groupsStore.groups?.data?.map((group) => ({
                    label: group.name,
                    value: group.groupID,
                  }))}
                  class={"flex h-full items-center w-40"}
                  placeholder="请选择组织"
                />
              </div>
            </div>
          </div>

          <Table rowKey={"accountID"} columns={columns} data={memberPanelStore.groupMembers?.data || []} />
        </div>
      );
    };
  },
});
