import { computed, createVNode, defineComponent, ref } from "vue";
import { useTransmissionStore } from "@src/pages/transmission";
import { Table } from "@src/components/table";
import { useColumns, useDownloadedPanelCheckedStore } from "@src/pages/transmission/downloadPanel/useColumns";
import { Button, Modal, Pagination } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

export const DownloadingListPanel = defineComponent({
  setup() {
    const transmissionStore = useTransmissionStore();
    const columns = useColumns();
    const store = useDownloadedPanelCheckedStore();
    const hasChecked = computed(() => Object.values(store.checkedMap).find((item) => !!item));

    return () => (
      <div class={"h-full flex flex-col"}>
        <div>
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
                content: "删除仅仅会删除记录而不会删除文件，如有需要请下载完成后再删除对应文件",
                onOk() {
                  transmissionStore.downloadList = transmissionStore.downloadList.filter(
                    (item) => !store.checkedMap[item.id],
                  );
                  store.checkedMap = {};
                },
              });
            }}>
            删除
          </Button>
        </div>
        <div class={"flex-1 flex flex-col"}>
          <Table rowKey={"id"} columns={columns} data={transmissionStore.downloadList || []} />
        </div>
      </div>
    );
  },
});
