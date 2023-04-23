import { toFullTime } from "@src/utils/date";
import { Button, Modal, Tooltip } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { computed, createVNode, getCurrentInstance, onMounted } from "vue";
import { displayOperationOperationState, IOperationOperationLog } from "@src/src-clients/storage";

import { TextEllipsis } from "@src/components/textEllipsis";
import { TaskLog } from "@src/pages/taskLog/taskLogDetails";

export const useColumns = () => {
  return [
    {
      title: "成员名称",
      key: "operatorName",
      dataKey: "operatorName",
      width: 150,
    },
    {
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 500,
      cellRenderer({ rowData }: { rowData: IOperationOperationLog }) {
        if (!rowData.desc) return "-";
        return <TextEllipsis>{rowData.desc}</TextEllipsis>;
      },
    },

    {
      title: "操作时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLog }) {
        return <span>{toFullTime(rowData.createdAt)}</span>;
      },
    },
    {
      title: "操作",
      key: "name",
      dataKey: "name",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLog }) {
        return (
          <div class={"gap-2 flex items-center"}>
            <Button
              type={"link"}
              class={"p-0"}
              onClick={() => {
                Modal.confirm({
                  title: `${rowData.desc}详情`,
                  closable: true,
                  width: "80vw",
                  appContext: getCurrentInstance()?.appContext,
                  icon: null,
                  content: createVNode(<TaskLog taskID={rowData.operationID} />),
                  cancelButtonProps: { style: { display: "none" } } as any,
                  onOk() {
                    Modal.destroyAll();
                  },
                });
              }}>
              查看详情
            </Button>
          </div>
        );
      },
    },
  ];
};
