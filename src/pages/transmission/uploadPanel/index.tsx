import { computed, createVNode, defineComponent } from "vue";
import { useTransmissionStore } from "@src/pages/transmission";
import { Table } from "@src/components/table";
import { useColumns, useUploadPanelCheckedStore } from "@src/pages/transmission/uploadPanel/useColumns";
import { Button, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

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
                content: "删除仅仅会删除记录而不会删除文件，如有需要请下载完成后再删除对应文件",
                onOk() {
                  transmissionStore.uploadList = transmissionStore.uploadList.filter(
                    (item) => !store.checkedMap[item.id],
                  );
                  store.checkedMap = {};
                },
              });
            }}>
            删除
          </Button>
          <span>{}</span>
        </div>
        <Table rowKey={"id"} columns={columns} data={transmissionStore.uploadList || []} />
      </div>
    );
  },
});
