import { toFullTime } from "@src/utils/date";
import { Button, Checkbox, Modal, Tooltip } from "ant-design-vue";
import { ITransmission } from "@src/pages/transmission/interface";
import { useTransmissionStore } from "@src/pages/transmission";
import { computed, createVNode, ref, toRefs, unref } from "vue";
import { defineStore } from "pinia";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { ErrorModal } from "@src/pages/transmission/compoment/ErrorModal";
import { invoke } from "@tauri-apps/api/tauri";

export const useDownloadedPanelCheckedStore = defineStore("downloadedPanelCheckedStore", () => {
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
  const store = useDownloadedPanelCheckedStore();
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
          transmissionStore.downloadList.forEach((item) => {
            newMap[item.id] = value;
          });
          checkedMap.value = newMap;
        };

        if (!transmissionStore.downloadList.length) return null;
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
      title: "下载进度",
      key: "progress",
      dataKey: "progress",
      width: 150,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return <span>{rowData.progress}%</span>;
      },
    },
    {
      title: "下载路径",
      key: "path",
      dataKey: "path",
      width: 300,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return (
          <Tooltip title={"打开本地下载位置"}>
            <span
              class={"cursor-pointer text-left break-words text-blue-500 ellipsis2"}
              onClick={() => {
                invoke("open_folder", { path: rowData.path });
              }}>
              {rowData.path}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "下载状态",
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
                wrapClassName: "contentModal",
                icon: createVNode(ExclamationCircleOutlined),
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
              transmissionStore.setDownload(transmissionStore.downloadList.filter((item) => item.id !== rowData.id));
            }}>
            删除
          </Button>
        );
      },
    },
  ];
};
