import { computed, createVNode, defineComponent, onMounted, ref, watch } from "vue";
import { useRequest } from "vue-request";
import { listOperationLog, operationUndo } from "@src/src-clients/storage";
import { message, Modal, Pagination, Tooltip } from "ant-design-vue";
import { TooltipButton } from "@src/components/tooltipsButton/index";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/taskLog/taskLogDetails/useColumns";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

export const TaskLog = defineComponent({
  props: {
    taskID: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const offset = ref(0);
    const size = ref(2000);
    const checkedMap = ref<Record<string, boolean>>({});
    const { data: logs, refresh } = useRequest(
      () =>
        listOperationLog({
          size: size.value,
          offset: offset.value * size.value,
          operationID: props.taskID,
        }),
      {
        refreshDeps: [offset, size],
      },
    );

    const checkedLogs = computed(() => logs.value?.data?.filter((log) => checkedMap.value[log.logID]));

    const { runAsync: undo } = useRequest(operationUndo, {
      manual: true,
      onSuccess() {
        refresh();
        message.success("撤销成功");
      },
    });

    onMounted(() => {
      // size 改变也刷新一下
      watch(
        () => size.value,
        () => {
          refresh();
        },
      );
    });

    const columns = useColumns({
      logs,
      checkedMap,
      refresh,
    });
    return () => {
      return (
        <>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between flex-shrink-0"}>
              <div class={"flex gap-2"}>
                <TooltipButton
                  danger
                  disabled={!checkedLogs.value?.length}
                  title={"未选中任何支持撤销的记录"}
                  onClick={() => {
                    Modal.confirm({
                      title: "确定撤销当前选中的所有记录吗?",
                      closable: true,
                      icon: createVNode(ExclamationCircleOutlined),
                      onOk() {
                        return undo({
                          operationID: props.taskID,
                          body: {
                            logIDs: checkedLogs.value!.map((log) => log.logID),
                          },
                        }).then(() => {
                          checkedMap.value = {};
                          refresh();
                        });
                      },
                    });
                  }}>
                  <Tooltip title={`撤销选中的${checkedLogs.value?.length || 0}条记录`}>撤销</Tooltip>
                </TooltipButton>
              </div>
            </div>
          </div>

          <div class={"flex-1 flex flex-col"}>
            <Table rowKey={"operationID"} columns={columns} data={logs.value?.data || []} />
            <div class={"mt-4 flex justify-end"}>
              <Pagination
                pageSizeOptions={[100, 500, 1000, 2000, 4000]}
                v-model:pageSize={size.value}
                current={offset.value + 1}
                total={logs.value?.total}
                onChange={(newOffset) => {
                  offset.value = newOffset - 1;
                }}
              />
            </div>
          </div>
        </>
      );
    };
  },
});
