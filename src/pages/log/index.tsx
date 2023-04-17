import { computed, createVNode, defineComponent, onMounted, ref, watch } from "vue";
import { useRequest } from "vue-request";
import { listOperationLog, operationUndo } from "@src/src-clients/storage";
import { message, Modal, Pagination, Select, Tooltip } from "ant-design-vue";
import { defineStore } from "pinia";
import { useMembersStore } from "@src/pages/member";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { TooltipButton } from "@src/components/tooltipsButton/index";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/log/useColumns";

export const useOperationLogStore = defineStore("operationLog", () => {
  const searchAccountID = ref<string | undefined>(undefined);
  const offset = ref(0);
  const size = ref(2000);
  const checkedMap = ref<Record<string, boolean>>({});
  const { data: logs, refresh } = useRequest(
    () =>
      listOperationLog({
        size: size.value,
        offset: offset.value * size.value,
        accountID: searchAccountID.value,
      }),
    {
      refreshDeps: [searchAccountID, offset, size],
    },
  );

  const { runAsync: undo } = useRequest(operationUndo, {
    manual: true,
    onSuccess() {
      refresh();
      message.success("撤销成功");
    },
  });

  function setCheckedMap(newCheckedMap?: Record<string, boolean>) {
    checkedMap.value = newCheckedMap || {};
  }
  return {
    logs,
    size,
    offset,
    checkedMap,
    setCheckedMap,
    changeOffset(newOffset) {
      offset.value = newOffset;
    },
    searchAccountID,
    refresh,
    undo,
  };
});

export const Log = defineComponent({
  setup() {
    const membersStore = useMembersStore();
    const operationLogStore = useOperationLogStore();
    const checkedMap = computed(() => operationLogStore.checkedMap);
    const checkedOperationIDs = computed(() => Object.keys(checkedMap.value).filter((key) => checkedMap.value[key]));
    const hasChecked = computed(() => checkedOperationIDs.value);

    onMounted(() => {
      operationLogStore.refresh();

      // size 改变也刷新一下
      watch(
        () => operationLogStore.size,
        () => {
          operationLogStore.refresh();
        },
      );
    });

    const columns = useColumns();
    return () => {
      return (
        <>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between flex-shrink-0"}>
              <div class={"flex gap-2"}>
                <TooltipButton
                  danger
                  disabled={!hasChecked.value}
                  title={"未选中任何支持撤销的记录"}
                  onClick={() => {
                    Modal.confirm({
                      title: "确定撤销当前选中的所有记录吗?",
                      closable: true,
                      icon: createVNode(ExclamationCircleOutlined),
                      onOk() {
                        return operationLogStore
                          .undo({
                            body: {
                              operationID: checkedOperationIDs.value,
                            },
                          })
                          .then(() => {
                            operationLogStore.setCheckedMap({});
                          });
                      },
                    });
                  }}>
                  <Tooltip title={`撤销选中的${checkedOperationIDs.value.length}条记录`}>撤销</Tooltip>
                </TooltipButton>
              </div>
              <div>
                <Select
                  allowClear
                  options={membersStore.members?.data?.map((member) => ({
                    label: member.name,
                    value: member.accountID,
                  }))}
                  v-model:value={operationLogStore.searchAccountID}
                  class={"flex h-full items-center w-40"}
                  placeholder="根据操作成员搜索"
                  onChange={() => {
                    operationLogStore.setCheckedMap({});
                    operationLogStore.changeOffset(0);
                  }}
                />
              </div>
            </div>
          </div>

          <div class={"flex-1 flex flex-col"}>
            <Table rowKey={"operationID"} columns={columns} data={operationLogStore.logs?.data || []} />
            <div class={"mt-4 flex justify-end"}>
              <Pagination
                pageSizeOptions={[100, 500, 1000, 2000, 4000]}
                v-model:pageSize={operationLogStore.size}
                current={operationLogStore.offset + 1}
                total={operationLogStore.logs?.total}
                onChange={(offset) => {
                  operationLogStore.changeOffset(offset - 1);
                }}
              />
            </div>
          </div>
        </>
      );
    };
  },
});
