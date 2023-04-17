import { displayGroupRoleType, IAccountUser, IGroupUser, putAccountState } from "@src/src-clients/storage";
import { createVNode } from "vue";
import { useRequest } from "vue-request";
import { Button, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useMembersStore } from "@src/pages/member";
export const useColumns = () => {
  const membersStore = useMembersStore();
  const { run: updateMemberState } = useRequest(putAccountState, {
    manual: true,
    onSuccess() {
      membersStore.refresh();
    },
  });
  return [
    {
      title: "成员名称",
      key: "name",
      dataKey: "name",
      width: 200,
    },
    {
      title: "成员角色",
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
      cellRenderer({ rowData }: { rowData: IAccountUser }) {
        const state = rowData.state === "ENABLE";
        return (
          <div class={"flex"}>
            <Button
              type={"link"}
              danger
              onClick={() => {
                Modal.confirm({
                  title: state ? "禁用成员" : "启用成员",
                  centered: true,
                  closable: true,
                  content: `是否确定${state ? "禁用" : "启用"}该成员？`,
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return updateMemberState({
                      accountID: rowData.accountID,
                      body: {
                        state: state ? "DISABLE" : "ENABLE",
                      },
                    });
                  },
                  okText: "确定",
                  cancelText: "取消",

                  onCancel() {
                    Modal.destroyAll();
                  },
                });
              }}>
              {state ? "禁用" : "启用"}
            </Button>
          </div>
        );
      },
    },
  ];
};
