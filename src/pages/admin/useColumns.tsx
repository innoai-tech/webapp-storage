import { toFullTime } from "@src/utils/date";
import { Button, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { createVNode } from "vue";
import { useAdminStore } from "@src/pages/admin/index";
import { IAdminUser } from "@src/src-clients/storage";

export const useColumns = () => {
  const adminStore = useAdminStore();
  return [
    {
      title: "管理员名称",
      key: "name",
      dataKey: "name",
      width: 300,
    },
    {
      title: "状态",
      key: "state",
      dataKey: "state",
      width: 200,
      cellRenderer({ rowData }: { rowData: IAdminUser }) {
        return (
          <span class={rowData.state === "ENABLE" ? "" : "text-gray-400"}>
            {rowData.state === "ENABLE" ? "已启用" : "已禁用"}
          </span>
        );
      },
    },
    {
      title: "手机号",
      key: "mobile",
      dataKey: "mobile",
      width: 200,
    },
    {
      title: "更新时间",
      key: "updatedAt",
      dataKey: "updatedAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IAdminUser }) {
        return <span>{toFullTime(rowData.updatedAt)}</span>;
      },
    },
    {
      title: "操作",
      key: "name",
      dataKey: "name",
      width: 200,
      cellRenderer({ rowData }: { rowData: IAdminUser }) {
        return (
          <Button
            type={"link"}
            danger
            onClick={() => {
              Modal.confirm({
                title: "删除管理员",
                centered: true,
                closable: true,
                content: "是否确定删除该成员的管理员权限？",
                icon: createVNode(ExclamationCircleOutlined),
                onOk() {
                  return adminStore.deleteAdminRequest(rowData.accountID).then(() => {
                    adminStore.refresh();
                  });
                },
                okText: "确定",
                cancelText: "取消",
              });
            }}>
            解除权限
          </Button>
        );
      },
    },
  ];
};
