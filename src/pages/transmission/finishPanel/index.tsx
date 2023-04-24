import { computed, createVNode, defineComponent, onMounted, ref, watch } from "vue";
import { useTransmissionStore } from "@src/pages/transmission";
import { Table } from "@src/components/table";
import { useColumns, useFinishedPanelCheckedStore } from "@src/pages/transmission/finishPanel/useColumns";
import { Button, Modal, Pagination, Tooltip } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

export const FinishedPanel = defineComponent({
  setup() {
    const transmissionStore = useTransmissionStore();
    const maxLength = computed(() => transmissionStore.finishedList.length);
    const columns = useColumns();
    const store = useFinishedPanelCheckedStore();
    const checkLength = computed(() => Object.values(store.checkedMap).filter((item) => item).length);
    const hasChecked = computed(() => checkLength.value >= 1);
    onMounted(() => {
      // 标为已读
      transmissionStore.hasNewFinished = false;
    });
    return () => (
      <div class={"h-full flex flex-col"}>
        <div class={"flex justify-between items-end"}>
          <Tooltip title={hasChecked.value ? "仅清除记录，不会清除文件" : ""}>
            <Button
              type={"primary"}
              danger
              disabled={!hasChecked.value}
              onClick={() => {
                Modal.confirm({
                  title: "提示",
                  closable: true,
                  wrapClassName: "contentModal",
                  icon: createVNode(ExclamationCircleOutlined),
                  content: "清除仅仅会清除记录而不会清除文件，如有需要请下载完成后再清除对应文件",
                  onOk() {
                    transmissionStore.finishedList = transmissionStore.finishedList.filter(
                      (item) => !store.checkedMap[item.id],
                    );
                    store.checkedMap = {};
                  },
                });
              }}>
              清除
            </Button>
          </Tooltip>
          <span>
            {checkLength.value}/{maxLength.value}
            <span class={"text-sm text-gray-400"} v-show={maxLength.value >= 5000}>
              （最多展示 5000 条记录）
            </span>
          </span>
        </div>
        <div class={"flex-1 flex flex-col"}>
          <Table rowKey={"id"} columns={columns} data={transmissionStore.finishedList || []} />
        </div>
      </div>
    );
  },
});
