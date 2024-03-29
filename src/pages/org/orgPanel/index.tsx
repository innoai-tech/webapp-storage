import { computed, createVNode, defineComponent, getCurrentInstance, onMounted, ref } from "vue";
import { useRequest } from "vue-request";
import { currentUserGroup, IGroupRoleType, listGroup } from "@src/src-clients/storage";
import { InputSearch, Modal, Select } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { defineStore } from "pinia";
import { useCurrentAccountStore } from "@src/pages/account";
import { CreateOrgModal } from "@src/pages/org/orgPanel/CreateOrgModal";
import { useColumns } from "@src/pages/org/orgPanel/useColumns";
import { Table } from "@src/components/table";
import { AuthButton } from "@src/components/authButton";

export const useGroupsStore = defineStore("groups", () => {
  const searchGroupID = ref("");
  const accountStore = useCurrentAccountStore();

  const { data: currentUserGroups, runAsync: getUserGroups } = useRequest(() => currentUserGroup({ size: -1 }), {
    manual: true,
    refreshOnWindowFocus: true,
  });
  const { data: allGroups, runAsync: getGroups } = useRequest(() => listGroup({ size: -1 }), {
    refreshOnWindowFocus: true,
    manual: true,
  });

  const groups = computed(() =>
    // 管理员改写一下，默认吧所有组织都设置为 owner 权限
    accountStore.account?.isAdmin
      ? {
          ...allGroups.value,
          data:
            allGroups.value?.data?.map((item) => ({
              ...item,
              roleType: "OWNER" as IGroupRoleType,
            })) || [],
        }
      : currentUserGroups.value,
  );

  return {
    groups,
    refresh() {
      if (accountStore.account?.isAdmin) {
        return getGroups();
      } else {
        return getUserGroups();
      }
    },

    getGroups,
    currentUserGroups,
    allGroups,
    searchGroupID,
  };
});

export const OrgPanel = defineComponent({
  setup() {
    const groupsStore = useGroupsStore();

    onMounted(() => {
      groupsStore.refresh();
    });

    const searchedGroups = computed(() =>
      groupsStore.searchGroupID?.trim()
        ? groupsStore.groups?.data?.filter((group) => groupsStore.searchGroupID === group.name)
        : groupsStore.groups?.data,
    );

    const columns = useColumns();

    return () => {
      return (
        <div class={"h-full flex flex-col"}>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between"}>
              <div class={"flex gap-2"}>
                <AuthButton
                  title={"仅系统管理员可创建组织"}
                  icon={<PlusOutlined />}
                  type={"primary"}
                  class={"flex items-center"}
                  onClick={() => {
                    const appContext = getCurrentInstance()?.appContext;
                    Modal.confirm({
                      appContext,
                      title: "新建组织",
                      centered: true,
                      closable: true,
                      content: createVNode(<CreateOrgModal />),
                      icon: null,
                      cancelButtonProps: { style: { display: "none" } } as any,
                      okButtonProps: { style: { display: "none" } } as any,
                      wrapClassName: "confirmModal",
                    });
                  }}>
                  新建组织
                </AuthButton>
              </div>
              <div>
                <Select
                  placeholder={"输入组织名称搜索"}
                  class={"flex w-40 h-full items-center"}
                  showSearch
                  allowClear
                  options={groupsStore.allGroups?.data?.map((item) => ({
                    value: item.groupID,
                    label: item.name,
                  }))}
                  onChange={(value) => {
                    groupsStore.searchGroupID = value as string;
                  }}
                  value={groupsStore.searchGroupID}></Select>
              </div>
            </div>
          </div>

          <Table rowKey={"groupID"} columns={columns} data={searchedGroups.value || []} />
        </div>
      );
    };
  },
});
