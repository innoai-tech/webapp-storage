import { computed, createVNode, defineComponent } from "vue";
import { useTransmissionStore } from "@src/pages/transmission";
import { Table } from "@src/components/table";
import { useColumns, useUploadPanelCheckedStore } from "@src/pages/transmission/uploadPanel/useColumns";
import { Button, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { invoke } from "@tauri-apps/api/tauri";

export const UploadingListPanel = defineComponent({
  setup() {
    const transmissionStore = useTransmissionStore();
    const columns = useColumns();
    const store = useUploadPanelCheckedStore();
    const hasChecked = computed(() => Object.values(store.checkedMap).find((item) => !!item));
    return () => (
      <div>
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
                content: "清除仅仅会清除记录而不会清除文件，如有需要请下载完成后再清除对应文件",
                onOk() {
                  const checkedList = transmissionStore.uploadList.filter((item) => store.checkedMap[item.id]);
                  transmissionStore.uploadList = transmissionStore.uploadList.filter(
                    (item) => !store.checkedMap[item.id],
                  );
                  store.checkedMap = {};
                  invoke("remove_upload_task", { ids: checkedList.map((task) => task.id) });
                },
              });
            }}>
            清除
          </Button>
          <span>{}</span>
        </div>
        <Table rowKey={"id"} columns={columns} data={transmissionStore.uploadList || []} />
      </div>
    );
  },
});
