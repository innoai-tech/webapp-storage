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
                title: "是否确定删除这些上传记录?",
                content: "删除下载记录并不会影响已上传的文件",
                closable: true,
                icon: createVNode(ExclamationCircleOutlined),
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
