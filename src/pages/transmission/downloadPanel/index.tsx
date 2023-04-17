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
                title: "是否确定删除这些下载记录?",
                content: "删除下载记录并不会影响本地文件",
                closable: true,
                icon: createVNode(ExclamationCircleOutlined),
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
