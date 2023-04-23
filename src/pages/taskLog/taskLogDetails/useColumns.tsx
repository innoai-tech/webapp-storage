import { toFullTime } from "@src/utils/date";
import { Button, Checkbox, message, Modal, Tooltip } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { computed, createVNode, onMounted, Ref, unref } from "vue";
import {
  displayOperationOperationState,
  IOperationOperationLog,
  IOperationOperationLogDataList,
  operationUndo,
} from "@src/src-clients/storage";
import { useMembersStore } from "@src/pages/member";
import { TextEllipsis } from "@src/components/textEllipsis";
import { useRequest } from "vue-request";

export const useColumns = ({
  logs,
  checkedMap,
  refresh,
}: {
  logs: Ref<IOperationOperationLogDataList | undefined>;
  checkedMap: Ref<Record<string, boolean>>;
  refresh: () => void;
}) => {
  const allSelected = computed(() => {
    return !!logs.value?.data.length && !logs.value?.data?.filter((log) => !checkedMap.value[log.operationID])?.length;
  });
  const members = useMembersStore();
  const memberMap = computed(() => members.members?.data?.reduce((p, c) => ({ ...p, [c.accountID]: c }), {}));

  const containsChecked = computed(() => Object.values(checkedMap.value).includes(true));

  onMounted(() => {
    members.getMembers();
  });

  const { runAsync: undo } = useRequest(operationUndo, {
    manual: true,
    onSuccess() {
      refresh();
      message.success("撤销成功");
    },
  });

  return [
    {
      key: "selection",
      width: 50,
      cellRenderer: ({ rowData }: { rowData: IOperationOperationLog }) => {
        const onChange = (e) => {
          const newMap = unref(checkedMap.value);
          const value = e.target.checked;
          newMap[rowData.logID] = value as boolean;
          checkedMap.value = { ...newMap };
        };
        return (
          <Tooltip title={rowData.state === "DO" ? "" : "重做的操作无法选中"}>
            <Checkbox onChange={onChange} checked={checkedMap.value[rowData.logID]} />
          </Tooltip>
        );
      },

      headerCellRenderer: () => {
        const onChange = (e) => {
          const value = e.target.checked;
          const newMap = unref(checkedMap.value);
          logs.value?.data?.forEach((log) => {
            newMap[log.operationID] = value;
          });
          checkedMap.value = { ...newMap };
        };

        return (
          <Checkbox
            onChange={onChange}
            checked={allSelected.value}
            indeterminate={containsChecked.value && !allSelected.value}
          />
        );
      },
    },
    {
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLog }) {
        if (!rowData.desc) return "-";
        return <TextEllipsis>{rowData.desc}</TextEllipsis>;
      },
    },
    {
      title: "状态",
      key: "状态",
      dataKey: "状态",
      width: 200,
      align: "center" as const,
      cellRenderer({ rowData }: { rowData: IOperationOperationLog }) {
        return <span>{displayOperationOperationState(rowData.state) || "-"}</span>;
      },
    },
    {
      title: "操作时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLog }) {
        return <span>{toFullTime(rowData.updatedAt)}</span>;
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
            <Tooltip title={rowData.state === "DO" ? "" : "当前为撤销状态，无法操作"}>
              <Button
                type={"link"}
                disabled={rowData.state !== "DO"}
                danger
                class={"p-0"}
                onClick={() => {
                  Modal.confirm({
                    title: "确定撤销当前操作吗?",
                    closable: true,
                    icon: createVNode(ExclamationCircleOutlined),
                    onOk() {
                      return undo({
                        operationID: rowData.operationID,
                        body: {
                          logIDs: [rowData.logID],
                        },
                      });
                    },
                  });
                }}>
                撤销
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];
};
