import { IShareShareWithUser, putShareState } from "@src/src-clients/storage";
import { computed, createVNode, onMounted } from "vue";
import { useRequest } from "vue-request";
import { Button, message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { toFullTime } from "@src/utils/date";
import { useListShareStore } from "@src/pages/share";
import { useMembersStore } from "@src/pages/member";
import { useCurrentAccountStore } from "@src/pages/account";
export const useColumns = () => {
  const shareStore = useListShareStore();
  const { run: sharePutState } = useRequest(putShareState, {
    manual: true,
    onSuccess() {
      message.success("已停止分享");
      shareStore.refresh();
    },
  });
  const currentUserStore = useCurrentAccountStore();
  const memberStore = useMembersStore();

  onMounted(() => {
    memberStore.getMembers();
  });
  const memberMap = computed<{ [accountID: string]: string }>(
    () => memberStore.members?.data?.reduce((p, c) => ({ ...p, [c.accountID]: c.name }), {}) || {},
  );
  return [
    {
      title: "文件路径",
      key: "path",
      dataKey: "path",
      width: 200,
    },
    {
      title: "分享人",
      key: "accountID",
      dataKey: "accountID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IShareShareWithUser }) {
        return <span>{memberMap.value?.[rowData.accountID] || "-"}</span>;
      },
    },
    {
      title: "状态",
      key: "accountID",
      dataKey: "accountID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IShareShareWithUser }) {
        return <span>{rowData.state === "ENABLE" ? "启用" : "禁用"}</span>;
      },
    },
    {
      title: "创建时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IShareShareWithUser }) {
        return <span>{toFullTime(rowData.createdAt) || "-"}</span>;
      },
    },
    {
      title: "过期时间",
      key: "expiredAt",
      dataKey: "expiredAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IShareShareWithUser }) {
        return <span>{toFullTime(rowData.expiredAt) || "-"}</span>;
      },
    },

    {
      title: "操作",
      key: "shareID",
      dataKey: "shareID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IShareShareWithUser }) {
        return (
          <div class={"flex"}>
            <Button
              type={"link"}
              danger={rowData.state === "ENABLE"}
              onClick={() => {
                Modal.confirm({
                  title: `是否确定${rowData.state === "ENABLE" ? "禁用" : "启用"}当前文件夹的分享`,
                  centered: true,
                  closable: true,
                  content: null,
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return sharePutState({
                      shareID: rowData.shareID,
                      body: {
                        State: rowData.state === "ENABLE" ? "DISABLE" : "ENABLE",
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
              {rowData.state === "ENABLE" ? "禁用" : "启用"}
            </Button>
          </div>
        );
      },
    },
  ].filter((item) => item.key !== "accountID" || currentUserStore.account?.isAdmin);
};
