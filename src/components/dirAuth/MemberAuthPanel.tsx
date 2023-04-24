import { computed, createVNode, defineComponent, onMounted, ref } from "vue";
import {
  bindDirUserRole,
  displayRbacRoleType,
  IAccountUser,
  IRbacAccountFull,
  IRbacRoleType,
  listDirUserRole,
  unBindDirUserRole,
} from "@src/src-clients/storage";
import { Button, Dropdown, InputSearch, Menu, MenuItem, message, Modal, Tooltip } from "ant-design-vue";
import { toFullDate } from "@src/utils/date";
import { useMembersStore } from "@src/pages/member";
import { defineStore } from "pinia";
import { useRequest } from "vue-request";
import { DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons-vue";
import { useDirAuthStore } from "@src/components/dirAuth/index";
import { useRoleOptions } from "@src/components/dirAuth/GroupAuthPanel";
import { Table } from "@src/components/table";
import { AuthButton } from "@src/components/authButton";
import { useDiskStore } from "@src/pages/disk/store";

const useAuthGroupMemberPanelStore = defineStore("authGroupMemberPanel", () => {
  const searchName = ref("");
  const dirAuthStore = useDirAuthStore();
  const currentDirPath = computed(() => dirAuthStore.currentDir?.path);
  const hasPath = computed(() => !!currentDirPath.value);
  const {
    data: userRoles,
    refresh,
    runAsync: getDirUserRoles,
  } = useRequest(() => listDirUserRole({ size: -1, path: currentDirPath.value! }), {
    refreshOnWindowFocus: true,
    manual: true,
    ready: hasPath,
  });
  const tabStore = useDirAuthStore();
  const userRoleTypeMap = computed<Record<string, IRbacRoleType>>(
    () =>
      userRoles.value?.data.reduce(
        (p, c) => ({ ...p, [c.accountID]: c.roles.find((item) => item.path === tabStore.currentDir?.path)?.roleType }),
        {},
      ) || {},
  );
  const userRolesMap = computed<Record<string, IRbacRoleType>>(
    () => userRoles.value?.data.reduce((p, c) => ({ ...p, [c.accountID]: c.roles }), {}) || {},
  );
  return {
    searchName,
    refresh,
    userRoleTypeMap,
    userRolesMap,
    getDirUserRoles,
  };
});

interface IUser extends IAccountUser {
  // 当前文件夹权限
  roleType: IRbacRoleType;

  // 包含父级文件夹传递的角色
  roles: IRbacAccountFull[];
}

export const AuthGroupMemberPanel = defineComponent({
  setup() {
    const memberStore = useMembersStore();
    const authGroupMemberPanelStore = useAuthGroupMemberPanelStore();
    const members = computed(
      () =>
        memberStore.members?.data
          ?.filter(
            (item) =>
              item.name.includes(authGroupMemberPanelStore.searchName) ||
              authGroupMemberPanelStore.searchName.includes(item.name),
          )
          ?.map((item) => ({
            ...item,
            roleType: authGroupMemberPanelStore.userRoleTypeMap[item.accountID],
          })) as IUser[],
    );

    onMounted(() => {
      authGroupMemberPanelStore.getDirUserRoles();
      memberStore.getMembers();
    });

    const columns = useColumns();
    return () => {
      return (
        <div>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between"}>
              <div class={"flex gap-2"}></div>
              <div>
                <InputSearch
                  v-model:value={authGroupMemberPanelStore.searchName}
                  class={"flex h-full items-center w-50"}
                  placeholder="请输入用户名称搜索"
                />
              </div>
            </div>
          </div>

          {/*element 的虚拟表格在 modal 内表现异常，cellrender 会报错，替换为啊 antdvue*/}
          <Table filled={false} rowKey={"accountID"} data={members.value || []} columns={columns} />
        </div>
      );
    };
  },
});

function useColumns() {
  const roleOptions = useRoleOptions();
  const dirAuthStore = useDirAuthStore();
  const store = useDiskStore();
  const authGroupMemberPanelStore = useAuthGroupMemberPanelStore();
  const { runAsync: bindDirUserRoleRequest } = useRequest(bindDirUserRole, {
    manual: true,
    onSuccess() {
      message.success("修改成功");
      authGroupMemberPanelStore.refresh();
    },
  });
  const { runAsync: unBindDirUserRoleRequest } = useRequest(unBindDirUserRole, {
    manual: true,
    onSuccess() {
      message.success("修改成功");
      authGroupMemberPanelStore.refresh();
    },
  });

  return [
    {
      title: "用户名称",
      key: "name",
      dataKey: "name",
      width: 200,
    },
    {
      key: "roles",
      dataKey: "roles",
      width: 200,
      headerCellRenderer() {
        return (
          <div>
            用户角色
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
      cellRenderer({ rowData }: { rowData: IUser }) {
        return <span>{displayRbacRoleType(rowData.roleType) || "-"} </span>;
      },
    },
    {
      title: "状态",
      key: "state",
      dataKey: "state",
      width: 200,
      cellRenderer({ rowData }: { rowData: IUser }) {
        return <span class={"text-ellipsis whitespace-pre"}>{rowData.state === "ENABLE" ? "启用" : "禁用"} </span>;
      },
    },
    {
      title: "更新时间",
      key: "updatedAt",
      dataKey: "updatedAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IUser }) {
        return <span>{toFullDate(rowData.updatedAt)}</span>;
      },
    },

    {
      title: "操作",
      key: "accountID",
      dataKey: "accountID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IUser }) {
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
                                  if (!dirAuthStore.currentDir?.path) return;
                                  return bindDirUserRoleRequest({
                                    accountID: rowData.accountID,
                                    path: dirAuthStore.currentDir.path,
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
              hasPermission={store.roleType === "ADMIN" || store.roleType === "OWNER"}
              class={"ml-2"}
              disabled={!rowData.roleType}
              type={"link"}
              danger
              onClick={() => {
                Modal.confirm({
                  title: "确定删除当前用户的权限吗?",
                  closable: true,
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    if (!dirAuthStore.currentDir?.path) return;
                    return unBindDirUserRoleRequest({
                      accountID: rowData.accountID,
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
