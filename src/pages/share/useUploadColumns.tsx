import { ILinkUploadWithUser, putUploadLinkState, uploadByLinkUpload } from "@src/src-clients/storage";
import { computed, createVNode, onMounted } from "vue";
import { useRequest } from "vue-request";
import { Button, message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { toFullTime } from "@src/utils/date";
import { useMembersStore } from "@src/pages/member";
import { useCurrentAccountStore } from "@src/pages/account";
import { writeText } from "@tauri-apps/api/clipboard";
import dayjs from "dayjs";
import { useListUploadStore } from "@src/pages/share/UploadList";
import { Text } from "@src/components/Text";

export const useColumns = () => {
  const shareStore = useListUploadStore();
  const { run: sharePutState } = useRequest(putUploadLinkState, {
    manual: true,
    onSuccess() {
      message.success("操作已成功");
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
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return <Text text={rowData.path || "-"}>{}</Text>;
      },
    },
    {
      title: "分享人",
      key: "accountID",
      dataKey: "accountID",
      width: 200,
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return <span>{memberMap.value?.[rowData.accountID] || "-"}</span>;
      },
    },
    {
      title: "状态",
      key: "accountID",
      dataKey: "accountID",
      width: 100,
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return <span>{rowData.state === "ENABLE" ? "启用" : "禁用"}</span>;
      },
    },

    {
      title: "创建时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return <span>{toFullTime(rowData.createdAt) || "-"}</span>;
      },
    },
    {
      title: "过期时间",
      key: "expiredAt",
      dataKey: "expiredAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return <span>{toFullTime(rowData.expiredAt) || "-"}</span>;
      },
    },

    {
      title: "操作",
      key: "shareID",
      dataKey: "shareID",
      width: 200,
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return (
          <div class={"flex gap-4"}>
            <Button
              type={"link"}
              danger={rowData.state === "ENABLE"}
              onClick={() => {
                Modal.confirm({
                  title: `是否确定${rowData.state === "ENABLE" ? "禁用" : "启用"}当前文件夹的上传`,
                  centered: true,
                  closable: true,
                  content: null,
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return sharePutState({
                      uploadID: rowData.uploadID,
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
            <Button
              type={"link"}
              onClick={() => {
                const url = `${
                  uploadByLinkUpload.getConfig(
                    {
                      signature: rowData.signature,
                      uploadID: rowData.uploadID,
                    } as any,
                    false,
                  ).url
                }&expiredAt=${dayjs(rowData.expiredAt).toISOString()}`;
                writeText(url);
                message.success("复制成功");
              }}>
              复制链接
            </Button>
          </div>
        );
      },
    },
  ].filter((item) => item.key !== "accountID" || currentUserStore.account?.isAdmin);
};
