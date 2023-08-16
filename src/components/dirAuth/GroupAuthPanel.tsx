import { computed, createVNode, defineComponent, onMounted, ref } from "vue";
import { Button, Dropdown, Menu, MenuItem, message, Modal, Select, Tooltip } from "ant-design-vue";
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
import { DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons-vue";
import { useGroupsStore } from "@src/pages/org/orgPanel";
import { toFullDate } from "@src/utils/date";
import { useCurrentAccountStore } from "@src/pages/account";
import { Table } from "@src/components/table";
import { AuthButton } from "@src/components/authButton";
import { useDiskStore } from "@src/pages/disk/store";

export const useRoleOptions = () => {
  const store = useDiskStore();
  const currentUserStore = useCurrentAccountStore();
  return computed(() => {
    if (!store.roleType) return [];
    return currentUserStore.account?.isAdmin
      ? Object.keys(RbacRoleType).map((key) => ({
          value: key,
          label: displayRbacRoleType(key as IRbacRoleType),
        }))
      : store.roleType === "OWNER"
      ? [
          { label: displayRbacRoleType(RbacRoleType.ADMIN), value: RbacRoleType.ADMIN },
          { label: displayRbacRoleType(RbacRoleType.MEMBER), value: RbacRoleType.MEMBER },
          { label: displayRbacRoleType(RbacRoleType.GUEST), value: RbacRoleType.GUEST },
        ]
      : store.roleType === "ADMIN"
      ? [
          { label: displayRbacRoleType(RbacRoleType.MEMBER), value: RbacRoleType.MEMBER },
          { label: displayRbacRoleType(RbacRoleType.GUEST), value: RbacRoleType.GUEST },
        ]
      : [];
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
        <div class={"flex-1 h-full flex flex-col"}>
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
          <Table filled={false} rowKey={"groupID"} data={searchedGroups.value || []} columns={columns} />
        </div>
      );
    };
  },
});

function useColumns() {
  const roleOptions = useRoleOptions();
  const store = useDiskStore();
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
      dataKey: "name",
      width: 200,
    },
    {
      title: "当前角色",
      key: "roleType",
      dataKey: "roleType",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupAuthGroup }) {
        return <span>{displayRbacRoleType(rowData.roleType) || "-"} </span>;
      },
      headerCellRenderer() {
        return (
          <div>
            当前角色
            <span class={"ml-2"}>
              <Tooltip
                title={
                  <span
                    class={
                      "whitespace-break-spaces"
                    }>{`访问者:  允许查看、下载文件\n成员:  除访问者的权限外，还允许上传、改名、复制、移动\n管理员:  除成员的权限外，还允许删除文件、分配权限(只能分配访问者、成员)\n拥有者:  除管理员的权限外，还允许分配管理员和拥有者权限
              `}</span>
                }>
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          </div>
        );
      },
    },
    {
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupAuthGroup }) {
        return <span class={"text-ellipsis whitespace-pre"}>{rowData.desc || "-"} </span>;
      },
    },
    // {
    //   title: "父级权限",
    //   key: "parentDirRoles",
    //   dataKey: "parentDirRoles",
    //   width: 200,
    //   cellRenderer({ rowData }: { rowData: IGroupAuthGroup }) {
    //     console.log(rowData.parentDirRoles);
    //     return (
    //       <div>
    //         {rowData.parentDirRoles?.map((item) => {
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
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupAuthGroup }) {
        return <span>{toFullDate(rowData.updatedAt)}</span>;
      },
    },
    {
      title: "操作",
      key: "groupID",
      dataKey: "groupID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupAuthGroup }) {
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
                              Modal.confirm({
                                title: `确定修改权限为${label}?`,
                                closable: true,
                                icon: createVNode(ExclamationCircleOutlined),
                                onOk() {
                                  return bindGroupRole({
                                    groupID: rowData.groupID,
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
              <Button type={"link"} class={"p-0"}>
                {rowData.roleType ? "修改角色" : "添加角色"}
                <DownOutlined />
              </Button>
            </Dropdown>
            <AuthButton
              hasPermission={store?.roleType === "ADMIN" || store.roleType === "OWNER"}
              disabled={!rowData.roleType}
              class={"ml-2"}
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
                      groupID: rowData.groupID,
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
