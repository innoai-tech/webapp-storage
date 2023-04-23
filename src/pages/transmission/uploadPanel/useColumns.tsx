import { toFullTime } from "@src/utils/date";
import { Button, Checkbox, Modal, Tooltip } from "ant-design-vue";
import { ITransmission } from "@src/pages/transmission/interface";
import { useTransmissionStore } from "@src/pages/transmission";
import { computed, createVNode, ref, toRefs, unref } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { usePathsStore } from "@src/pages/disk/store";
import { ErrorModal } from "@src/pages/transmission/compoment/ErrorModal";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { invoke } from "@tauri-apps/api/tauri";

export const useUploadPanelCheckedStore = defineStore("uploadPanelCheckedStore", () => {
  const checkedMap = ref<Record<string, boolean>>({});
  const allSelected = computed(() => {
    const values = Object.values(checkedMap.value);
    return !!values.length && !values.includes(false);
  });
  const containsChecked = computed(() => Object.values(checkedMap.value).includes(true));
  return {
    containsChecked,
    allSelected,
    checkedMap,
  };
});

export const useColumns = () => {
  const transmissionStore = useTransmissionStore();
  const store = useUploadPanelCheckedStore();
  const router = useRouter();
  const pathsStore = usePathsStore();
  const { containsChecked, allSelected, checkedMap } = toRefs(store);
  return [
    {
      key: "selection",
      width: 50,
      cellRenderer: ({ rowData }: { rowData: ITransmission }) => {
        const onChange = (e) => {
          const newMap = unref(checkedMap.value);
          const value = e.target.checked;
          newMap[rowData.id] = value as boolean;
          checkedMap.value = newMap;
        };
        return <Checkbox onChange={onChange} checked={checkedMap.value[rowData.id]} />;
      },

      headerCellRenderer: () => {
        const onChange = (e) => {
          const value = e.target.checked as boolean;
          const newMap = {};
          transmissionStore.uploadList.forEach((item) => {
            newMap[item.id] = value;
          });
          checkedMap.value = newMap;
        };

        if (!transmissionStore.uploadList.length) return null;
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
      title: "文件名称",
      key: "name",
      dataKey: "name",
      width: 300,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return <span class={rowData.errs?.length ? "text-red-500 ellipsis2" : "ellipsis2"}>{rowData.name}</span>;
      },
    },
    {
      title: "创建时间",
      key: "created",
      dataKey: "created",
      width: 200,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return <span>{toFullTime(rowData.created) || "-"}</span>;
      },
    },
    {
      title: "上传进度",
      key: "progress",
      dataKey: "progress",
      width: 150,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return <span>{rowData.progress}%</span>;
      },
    },
    {
      title: "上传路径",
      key: "path",
      dataKey: "path",
      width: 300,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return (
          <Tooltip title={"前往上传路径"}>
            <span
              class={"cursor-pointer text-left break-words text-blue-500 ellipsis2"}
              onClick={() => {
                // 设置 path
                pathsStore.setPaths(rowData.path.split("/").slice(1));
                router.push({ name: "disk" });
              }}>
              {rowData.path}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "上传状态",
      key: "errs",
      dataKey: "errs",
      width: 200,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        if (!rowData.errs?.length) {
          return <span>正常</span>;
        }
        return (
          <Button
            type={"link"}
            danger
            class={"cursor-pointer"}
            onClick={() => {
              Modal.confirm({
                title: "错误信息",
                closable: true,
                width: "800px",
                wrapClassName: "contentModal",
                content: createVNode(<ErrorModal errs={rowData.errs} />),
              });
            }}>
            错误
          </Button>
        );
      },
    },
    {
      title: "操作",
      key: "id",
      dataKey: "id",
      width: 200,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return (
          <Button
            type={"link"}
            danger
            onClick={() => {
              Modal.confirm({
                title: "提示",
                closable: true,
                wrapClassName: "contentModal",
                icon: createVNode(ExclamationCircleOutlined),
                content: "删除仅仅会删除记录而不会删除文件，如有需要请下载完成后再删除对应文件",
                onOk() {
                  transmissionStore.setUpload(transmissionStore.uploadList.filter((item) => item.id !== rowData.id));
                  invoke("remove_upload_task", { ids: [rowData.id] });
                },
              });
            }}>
            删除
          </Button>
        );
      },
    },
  ];
};
