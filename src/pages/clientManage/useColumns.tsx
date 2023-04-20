import { Button, Modal, Space, Tooltip } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { createVNode, unref } from "vue";
import { IClient } from "@src/src-clients/storage";
import { useClientsStore } from "@src/pages/clientManage/index";
import { CreateClientModal } from "@src/pages/clientManage/CreateClient";
import { TextEllipsis } from "@src/components/textEllipsis";

export const useColumns = () => {
  const clientsStore = useClientsStore();
  return [
    {
      title: "客户端ID",
      key: "clientID",
      dataKey: "clientID",
      width: 300,
    },
    {
      title: "客户端描述",
      key: "desc",
      dataKey: "desc",
      width: 200,
    },
    {
      title: "白名单地址",
      key: "whiteList",
      dataKey: "whiteList",
      width: 200,
      cellRenderer({ rowData }: { rowData: IClient }) {
        if (!rowData.whiteList?.length) return null;
        return <TextEllipsis>{rowData.whiteList.join("、")}</TextEllipsis>;
      },
    },

    {
      title: "操作",
      key: "clientID",
      dataKey: "clientID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IClient }) {
        return (
          <Space>
            <Button
              type={"link"}
              onClick={() => {
                Modal.confirm({
                  title: "编辑客户端",
                  closable: true,
                  centered: true,
                  content: createVNode(<CreateClientModal client={unref(rowData)} />),
                  icon: null,
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              编辑
            </Button>
            <Button
              type={"link"}
              danger
              onClick={() => {
                Modal.confirm({
                  title: "删除客户端",
                  centered: true,
                  closable: true,
                  content: "是否确定删除该客户端？",
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return clientsStore.deleteClientRequest(rowData.clientID).then(() => {
                      clientsStore.refresh();
                    });
                  },
                  okText: "确定",
                  cancelText: "取消",
                });
              }}>
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
};
