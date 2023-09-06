import { toFullTime } from "@src/utils/date";
import { Button, Modal } from "ant-design-vue";
import { createVNode, getCurrentInstance } from "vue";
import { displayOperationOperatorType, IOperationOperationWithOperatorName } from "@src/src-clients/storage";

import { TextEllipsis } from "@src/components/textEllipsis";
import { TaskLog } from "@src/pages/taskLog/taskLogDetails";

export const useColumns = () => {
  return [
    {
      title: "成员名称",
      key: "operatorName",
      dataKey: "operatorName",
      width: 150,
      cellRenderer({ rowData }: { rowData: IOperationOperationWithOperatorName }) {
        if (!rowData.operatorName) return <TextEllipsis>{rowData.operationID}</TextEllipsis>;
        return <TextEllipsis>{rowData.operatorName}</TextEllipsis>;
      },
    },
    {
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 500,
      cellRenderer({ rowData }: { rowData: IOperationOperationWithOperatorName }) {
        if (!rowData.desc) return "-";
        return <TextEllipsis>{rowData.desc}</TextEllipsis>;
      },
    },
    {
      title: "操作类型",
      key: "operatorType",
      dataKey: "operatorType",
      width: 500,
      cellRenderer({ rowData }: { rowData: IOperationOperationWithOperatorName }) {
        if (!rowData.operatorType) return "-";
        return displayOperationOperatorType(rowData.operatorType);
      },
    },

    {
      title: "操作时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationWithOperatorName }) {
        return <span>{toFullTime(rowData.createdAt)}</span>;
      },
    },
    {
      title: "操作",
      key: "name",
      dataKey: "name",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationWithOperatorName }) {
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
                  centered: true,
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
