import { computed, createVNode, defineComponent, onMounted, ref } from "vue";
import { Dropdown, Menu, MenuItem, message, Modal, Select } from "ant-design-vue";
import {
  bindDirGroupRole,
  displayRbacRoleType,
  IRbacRoleType,
  RbacRoleType,
  unBindDirGroupRole,
} from "@src/src-clients/storage";
import { defineStore } from "pinia";
import { useRequest } from "vue-request";
import { IGroupAuthGroup, useDirAuthStore } from "./index";
import { DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useGroupsStore } from "@src/pages/org/orgPanel";
import { toFullDate } from "@src/utils/date";
import { useCurrentAccountStore } from "@src/pages/account";
import { Table } from "ant-design-vue";
import { AuthButton } from "@src/components/authButton";

export const useRoleOptions = () => {
  const dirAuthStore = useDirAuthStore();

  return computed(() => {
    if (!dirAuthStore.currentUserRole) return [];
    const currentUserStore = useCurrentAccountStore();
    return dirAuthStore.currentUserRole === "OWNER" || currentUserStore.account?.isAdmin
      ? Object.keys(RbacRoleType).map((key) => ({
          value: key,
          label: displayRbacRoleType(key as IRbacRoleType),
        }))
      : // 非 owner 只能添加普通成员和访问者
        [
          { label: displayRbacRoleType(RbacRoleType.MEMBER), value: RbacRoleType.MEMBER },
          { label: displayRbacRoleType(RbacRoleType.GUEST), value: RbacRoleType.GUEST },
        ];
  });
};

export const useGroupAuthStore = defineStore("groupAuth", () => {
  const searchGroupID = ref("");

  return {
    searchGroupID,
  };
});

export const GroupAuthPanel = defineComponent({
  setup() {
    const groupAuthStore = useGroupAuthStore();
    const dirAuthStore = useDirAuthStore();
    const groupsStore = useGroupsStore();

    const columns = useColumns();

    onMounted(() => {
      groupsStore.getGroups();
    });

    const searchedGroups = computed(
      () =>
        (
          (groupAuthStore.searchGroupID?.trim()
            ? groupsStore.allGroups?.data?.filter((group) => groupAuthStore.searchGroupID === group.groupID)
            : groupsStore.allGroups?.data) || []
        ).map((item) => ({
          ...item,
          roleType: dirAuthStore.currentDirGroupRoleMap[item.groupID]?.roleType,
        })) as IGroupAuthGroup[],
    );

    return () => {
      return (
        <div>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-end"}>
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
                    groupAuthStore.searchGroupID = value as string;
                  }}
                  value={groupAuthStore.searchGroupID}></Select>
              </div>
            </div>
          </div>
          <Table rowKey={"groupID"} dataSource={searchedGroups.value || []} columns={columns} />
        </div>
      );
    };
  },
});

function useColumns() {
  const roleOptions = useRoleOptions();
  const dirAuthStore = useDirAuthStore();
  const { runAsync: bindGroupRole } = useRequest(bindDirGroupRole, {
    manual: true,
    onSuccess() {
      message.success("权限修改成功");
      dirAuthStore.refreshDirRoles();
    },
  });

  const { runAsync: unBindGroupRole } = useRequest(unBindDirGroupRole, {
    manual: true,
    onSuccess() {
      message.success("清空权限成功");
      dirAuthStore.refreshDirRoles();
    },
  });

  return [
    {
      title: "组织名称",
      key: "name",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "当前权限",
      key: "roleType",
      dataIndex: "roleType",
      width: 200,
      customRender({ record }: { record: IGroupAuthGroup }) {
        return <span>{displayRbacRoleType(record.roleType) || "-"} </span>;
      },
    },
    {
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 200,
      customRender({ record }: { record: IGroupAuthGroup }) {
        return <span class={"text-ellipsis whitespace-pre"}>{record.desc || "-"} </span>;
      },
    },
    // {
    //   title: "父级权限",
    //   key: "parentDirRoles",
    //   dataIndex: "parentDirRoles",
    //   width: 200,
    //   customRender({ record }: { record: IGroupAuthGroup }) {
    //     console.log(record.parentDirRoles);
    //     return (
    //       <div>
    //         {record.parentDirRoles?.map((item) => {
    //           const text = `${item.path}: ${displayRbacRoleType(item.roleType)}`;
    //           return (
    //             <div key={text} class={"text-xs overflow-hidden whitespace-pre text-ellipsis"}>
    //               <Tooltip title={text}>{text}</Tooltip>
    //             </div>
    //           );
    //         })}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "更新时间",
      key: "createdAt",
      dataIndex: "createdAt",
      width: 200,
      customRender({ record }: { record: IGroupAuthGroup }) {
        return <span>{toFullDate(record.updatedAt)}</span>;
      },
    },
    {
      title: "操作",
      key: "groupID",
      dataIndex: "groupID",
      width: 200,
      customRender({ record }: { record: IGroupAuthGroup }) {
        return (
          <div class={"gap-2 flex items-center"}>
            <Dropdown
              trigger={"click"}
              v-slots={{
                overlay() {
                  return (
                    <Menu>
                      {roleOptions.value.map(({ value, label }) => {
                        return (
                          <MenuItem
                            key={value}
                            onClick={() => {
                              console.log(dirAuthStore.currentDir, "dirAuthStore.currentDir.path");
                              Modal.confirm({
                                title: `确定修改权限为${label}?`,
                                closable: true,
                                icon: createVNode(ExclamationCircleOutlined),
                                onOk() {
                                  return bindGroupRole({
                                    groupID: record.groupID,
                                    path: dirAuthStore.currentDir!.path,
                                    body: {
                                      roleType: value as IRbacRoleType,
                                    },
                                  });
                                },
                              });
                            }}>
                            <a href="javascript:;">{displayRbacRoleType(value as any)}</a>
                          </MenuItem>
                        );
                      })}
                    </Menu>
                  );
                },
              }}>
              <AuthButton
                hasPermission={dirAuthStore.currentUserRole && dirAuthStore.currentUserRole !== "MEMBER"}
                type={"link"}
                class={"p-0"}>
                {record.roleType ? "修改权限" : "添加权限"}
                <DownOutlined />
              </AuthButton>
            </Dropdown>
            <AuthButton
              hasPermission={dirAuthStore.currentUserRole && dirAuthStore.currentUserRole !== "MEMBER"}
              disabled={!record.roleType}
              class={"ml-2"}
              title={
                dirAuthStore.currentUserRole && dirAuthStore.currentUserRole !== "MEMBER"
                  ? "未设置任何权限"
                  : "无权限操作"
              }
              type={"link"}
              danger
              onClick={() => {
                Modal.confirm({
                  title: "确定删除当前组织的权限吗?",
                  closable: true,
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    if (!dirAuthStore.currentDir?.path) return;
                    return unBindGroupRole({
                      groupID: record.groupID,
                      path: dirAuthStore.currentDir.path,
                    });
                  },
                });
              }}>
              删除权限
            </AuthButton>
          </div>
        );
      },
    },
  ];
}
