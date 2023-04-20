import { toFullTime } from "@src/utils/date";
import { Button, Checkbox, Modal, Tooltip } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { computed, createVNode, onMounted, unref } from "vue";
import { displayOperationState, IOperationOperationLogWithUser } from "@src/src-clients/storage";
import { useOperationLogStore } from "@src/pages/log/index";
import { useMembersStore } from "@src/pages/member";
import { TextEllipsis } from "@src/components/textEllipsis";

export const useColumns = () => {
  const operationLogStore = useOperationLogStore();
  const checkedMap = computed(() => operationLogStore.checkedMap);
  const allSelected = computed(() => {
    return (
      !!operationLogStore.logs?.data.length &&
      !operationLogStore.logs?.data?.filter((log) => !checkedMap.value[log.operationID])?.length
    );
  });
  const members = useMembersStore();
  const memberMap = computed(() => members.members?.data?.reduce((p, c) => ({ ...p, [c.accountID]: c }), {}));

  const containsChecked = computed(() => Object.values(checkedMap.value).includes(true));

  onMounted(() => {
    members.getMembers();
  });

  return [
    {
      key: "selection",
      width: 50,
      cellRenderer: ({ rowData }: { rowData: IOperationOperationLogWithUser }) => {
        const onChange = (e) => {
          const newMap = unref(checkedMap.value);
          const value = e.target.checked;
          newMap[rowData.operationID] = value as boolean;
          operationLogStore.setCheckedMap(newMap);
        };
        return (
          <Tooltip title={rowData.state === "DO" ? "" : "重做的操作无法选中"}>
            <Checkbox onChange={onChange} checked={checkedMap.value[rowData.operationID]} />
          </Tooltip>
        );
      },

      headerCellRenderer: () => {
        const onChange = (e) => {
          const value = e.target.checked;
          const newMap = unref(checkedMap.value);
          operationLogStore.logs?.data?.forEach((log) => {
            newMap[log.operationID] = value;
          });
          operationLogStore.setCheckedMap(newMap);
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
      title: "成员名称",
      key: "accountID",
      dataKey: "accountID",
      width: 300,
      cellRenderer({ rowData }: { rowData: IOperationOperationLogWithUser }) {
        return (
          <span class={"text-ellipsis overflow-hidden whitespace-pre"}>
            {memberMap.value?.[rowData.accountID]?.name || "-"}
          </span>
        );
      },
    },
    {
      title: "描述信息",
      key: "desc",
      dataKey: "desc",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLogWithUser }) {
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
      cellRenderer({ rowData }: { rowData: IOperationOperationLogWithUser }) {
        return <span>{displayOperationState(rowData.state) || "-"}</span>;
      },
    },
    {
      title: "操作时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLogWithUser }) {
        return <span>{toFullTime(rowData.updatedAt)}</span>;
      },
    },
    {
      title: "操作",
      key: "name",
      dataKey: "name",
      width: 200,
      cellRenderer({ rowData }: { rowData: IOperationOperationLogWithUser }) {
        return (
          <div class={"gap-2 flex items-center"}>
            <Tooltip title={rowData.state === "DO" ? "" : "当前状态无法撤销操作"}>
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
                      return operationLogStore.undo({
                        body: {
                          operationID: [rowData.operationID],
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
