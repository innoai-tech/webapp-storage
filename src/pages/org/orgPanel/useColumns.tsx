import { toFullTime } from "@src/utils/date";
import { deleteGroup, IGroupGroupWithRole } from "@src/src-clients/storage";
import { createVNode, getCurrentInstance } from "vue";
import { useRequest } from "vue-request";
import { message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useGroupsStore } from "@src/pages/org/orgPanel/index";
import { UpdateOrgModal } from "@src/pages/org/orgPanel/UpdateOrgModal";
import { AuthButton } from "@src/components/authButton";
import { OrgClientModal } from "@src/pages/org/orgPanel/OrgClientModal";

export const useColumns = () => {
  const groupsStore = useGroupsStore();
  const { runAsync: deleteGroupRequest } = useRequest(deleteGroup, {
    manual: true,
    onSuccess() {
      message.success("删除成功");
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
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 400,
      cellRenderer({ rowData }: { rowData: IGroupGroupWithRole }) {
        return <span>{rowData.desc || "-"}</span>;
      },
    },
    {
      title: "创建时间",
      key: "createAt",
      dataKey: "createAt",
      width: 300,
      cellRenderer({ rowData }: { rowData: IGroupGroupWithRole }) {
        return <span>{toFullTime(rowData.createdAt)}</span>;
      },
    },

    {
      title: "操作",
      key: "groupID",
      dataKey: "groupID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IGroupGroupWithRole }) {
        return (
          <div class={"flex gap-2"}>
            <AuthButton
              type={"link"}
              hasPermission={
                // 管理员和拥有者才可以编辑
                rowData.roleType === "ADMIN" || rowData.roleType === "OWNER"
              }
              onClick={() => {
                const appContext = getCurrentInstance()?.appContext;
                Modal.confirm({
                  title: "编辑组织",
                  appContext,
                  centered: true,
                  closable: true,
                  content: createVNode(
                    <UpdateOrgModal name={rowData.name} groupID={rowData.groupID} desc={rowData.desc} />,
                  ),
                  icon: null,
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              编辑
            </AuthButton>
            <AuthButton
              type={"link"}
              hasPermission={
                // 管理员和拥有者才可以编辑
                rowData.roleType === "ADMIN" || rowData.roleType === "OWNER"
              }
              onClick={() => {
                Modal.confirm({
                  title: "凭证管理",
                  closable: true,
                  width: "80vw",
                  appContext: getCurrentInstance()?.appContext,
                  icon: null,
                  centered: true,
                  content: createVNode(<OrgClientModal groupID={rowData.groupID} />),
                  cancelButtonProps: { style: { display: "none" } } as any,
                  onOk() {
                    Modal.destroyAll();
                  },
                });
              }}>
              凭证管理
            </AuthButton>
            <AuthButton
              hasPermission={
                // 拥有者才可以删除
                rowData.roleType === "OWNER"
              }
              type={"link"}
              danger
              onClick={() => {
                Modal.confirm({
                  title: "删除组织",
                  centered: true,
                  closable: true,
                  content: "是否确定删除该组织？删除后无法找回",
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return deleteGroupRequest({ groupID: rowData.groupID }).then(() => {
                      groupsStore.refresh();
                    });
                  },
                  okText: "确定",
                  cancelText: "取消",

                  onCancel() {
                    Modal.destroyAll();
                  },
                });
              }}>
              删除
            </AuthButton>
          </div>
        );
      },
    },
  ];
};
