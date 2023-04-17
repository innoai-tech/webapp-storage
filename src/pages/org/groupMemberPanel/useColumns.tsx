import { displayGroupRoleType, IGroupUser, unBindGroupAccount } from "@src/src-clients/storage";
import { computed, createVNode } from "vue";
import { useRequest } from "vue-request";
import { message, Modal, Tooltip } from "ant-design-vue";
import { ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons-vue";
import { UpdateGroupMemberRoleModal } from "@src/pages/org/groupMemberPanel/UpdateMemberRole";
import { useGroupMemberPanelStore } from "@src/pages/org/groupMemberPanel/index";
import { AuthButton } from "@src/components/authButton";
import { useCurrentAccountStore } from "@src/pages/account";

export const useColumns = () => {
  const groupMemberPanelStore = useGroupMemberPanelStore();
  const { run: unBindMember } = useRequest(unBindGroupAccount, {
    manual: true,
    onSuccess() {
      groupMemberPanelStore.refresh();
      message.success("移除成功");
    },
  });
  const accountStore = useCurrentAccountStore();
  const memberPanelStore = useGroupMemberPanelStore();

  const currentUserRoleType = computed(
    () =>
      memberPanelStore.groupMembers?.data?.find((item) => item.accountID === accountStore.account?.accountID)?.roleType,
  );

  return [
    {
      title: "成员名称",
      key: "name",
      dataKey: "name",
      width: 200,
    },
    {
      title() {
        return (
          <div>
            用户角色
            <span class={"ml-2"}>
              <Tooltip
                title={
                  <span
                    class={
                      "whitespace-break-spaces"
                    }>{`拥有者：可以修改、删除组织，可以查看、添加、删除文件。可以添加管理员和普通成员。\n组织管理员：可以修改组织，查看、添加、删除文件。可以添加普通成员、移除普通成员。\n组织成员：可以查看、添加文件。无法添加、删除成员。
              `}</span>
                }>
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          </div>
        );
      },
      key: "roleType",
      dataKey: "roleType",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupUser }) {
        return <span>{displayGroupRoleType(rowData.roleType) || "-"}</span>;
      },
    },

    {
      title: "操作",
      key: "accountID",
      dataKey: "accountID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupUser }) {
        return (
          <div class={"flex"}>
            <AuthButton
              hasPermission={
                // 管理员和拥有者才可以编辑
                currentUserRoleType.value === "ADMIN" || currentUserRoleType.value === "OWNER"
              }
              type={"link"}
              onClick={() => {
                Modal.confirm({
                  title: "修改成员角色",
                  centered: true,
                  closable: true,
                  content: createVNode(
                    <UpdateGroupMemberRoleModal
                      accountID={rowData.accountID}
                      groupID={rowData.groupID}
                      subjectRoleType={rowData.roleType}
                      operatorRoleType={currentUserRoleType.value!}
                    />,
                  ),
                  icon: null,
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              修改权限
            </AuthButton>

            <AuthButton
              hasPermission={
                // 管理员和拥有者才可以移除成员
                currentUserRoleType.value === "ADMIN" || currentUserRoleType.value === "OWNER"
              }
              type={"link"}
              danger
              class={"ml-2"}
              onClick={() => {
                Modal.confirm({
                  title: "移除成员",
                  centered: true,
                  closable: true,
                  content: "是否确定移除该成员？移除后可重新添加",
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return unBindMember({
                      groupID: rowData.groupID,
                      accountID: rowData.accountID,
                    });
                  },
                  okText: "确定",
                  cancelText: "取消",

                  onCancel() {
                    Modal.destroyAll();
                  },
                });
              }}>
              移除成员
            </AuthButton>
          </div>
        );
      },
    },
  ];
};
