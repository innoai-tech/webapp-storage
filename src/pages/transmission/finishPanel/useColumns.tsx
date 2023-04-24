import { toFullTime } from "@src/utils/date";
import { Button, Checkbox, Modal, Tooltip } from "ant-design-vue";
import { ITransmission } from "@src/pages/transmission/interface";
import { computed, createVNode, ref, toRefs, unref } from "vue";
import { defineStore } from "pinia";
import { useTransmissionStore } from "@src/pages/transmission";
import { useRouter } from "vue-router";
import { usePathsStore } from "@src/pages/disk/store";
import { invoke } from "@tauri-apps/api/tauri";
import { ErrorModal } from "@src/pages/transmission/compoment/ErrorModal";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

export const useFinishedPanelCheckedStore = defineStore("finishedPanelCheckedStore", () => {
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
  const router = useRouter();
  const pathsStore = usePathsStore();
  const store = useFinishedPanelCheckedStore();
  const transmissionStore = useTransmissionStore();
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
          checkedMap.value = { ...newMap };
        };
        return <Checkbox onChange={onChange} checked={checkedMap.value[rowData.id]} />;
      },

      headerCellRenderer: () => {
        const onChange = (e) => {
          const value = e.target.checked as boolean;
          const newMap = {};
          transmissionStore.finishedList.forEach((item) => {
            newMap[item.id] = value;
          });
          checkedMap.value = newMap;
        };

        if (!transmissionStore.finishedList.length) return null;
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
      title: "传输进度",
      key: "progress",
      dataKey: "progress",
      width: 150,
      cellRenderer() {
        return <span>100%</span>;
      },
    },
    {
      title: "存储路径",
      key: "path",
      dataKey: "path",
      width: 300,
      cellRenderer({ rowData }: { rowData: ITransmission }) {
        return (
          <Tooltip title={rowData.type === "UPLOAD" ? "打开上传路径" : "打开本地路径"}>
            <span
              class={"p-0 m-0 cursor-pointer w-full align-left text-blue-500 ellipsis2"}
              onClick={() => {
                if (rowData.type === "UPLOAD") {
                  // 设置 path
                  pathsStore.setPaths(rowData.path.split("/").slice(1));
                  router.push({ name: "disk" });
                } else {
                  invoke("open_folder", { path: rowData.path });
                }
              }}>
              <span class={"text-ellipsis overflow-hidden w-full text-left"}>{rowData.path}</span>
            </span>
          </Tooltip>
        );
      },
    },

    {
      title: "传输状态",
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
                content: "清除仅仅会清除记录而不会清除文件，如有需要请下载完成后再清除对应文件",
                onOk() {
                  transmissionStore.setFinishedList(
                    transmissionStore.finishedList.filter((item) => item.id !== rowData.id),
                  );
                },
              });
            }}>
            清除
          </Button>
        );
      },
    },
  ];
};
