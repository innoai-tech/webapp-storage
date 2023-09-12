import { computed, defineComponent, onMounted, ref, unref, watch } from "vue";
import { notification, TabPane, Tabs } from "ant-design-vue";
import { defineStore } from "pinia";
import { FinishedPanel } from "@src/pages/transmission/finishPanel";
import { DownloadingListPanel } from "@src/pages/transmission/downloadPanel";
import { UploadingListPanel } from "@src/pages/transmission/uploadPanel";
import { CheckOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { ITransmission } from "@src/pages/transmission/interface";
import { listen } from "@tauri-apps/api/event";
import { useDownloadedPanelCheckedStore } from "@src/pages/transmission/downloadPanel/useColumns";
import { useUploadPanelCheckedStore } from "@src/pages/transmission/uploadPanel/useColumns";
import localforage from "localforage";
export enum TransmissionTab {
  DOWNLOADING = "DOWNLOADING",
  UPLOADING = "UPLOADING",
  FINISHED = "FINISHED",
}

export type ITransmissionTab = keyof typeof TransmissionTab;
export const displayTransmissionTab = (tab: ITransmissionTab) =>
  ({
    [TransmissionTab.DOWNLOADING]: "正在下载",
    [TransmissionTab.UPLOADING]: "正在上传",
    [TransmissionTab.FINISHED]: "传输完成",
  }[tab]);

// 这个 store 比较特殊，数据太大了，不用 store 默认的存储，单独走localforage使用 indexdb存储性能好点
const storeKey = "transmission";
export const useTransmissionStore = defineStore(storeKey, () => {
  const tab = ref<ITransmissionTab>("DOWNLOADING");
  const downloadList = ref<ITransmission[]>([]);
  const uploadList = ref<ITransmission[]>([]);
  const finishedList = ref<ITransmission[]>([]);
  const downloadedPanelStore = useDownloadedPanelCheckedStore();
  const uploadedPanelStore = useUploadPanelCheckedStore();

  function setTab(newTab: ITransmissionTab) {
    tab.value = newTab;
  }

  const downloading = computed(() => !!downloadList.value.length);
  const uploading = computed(() => !!uploadList.value.length);
  const hasNewFinished = ref(false);

  // 读取一下缓存
  localforage.getItem(`${storeKey.toLocaleUpperCase()}`).then((res) => {
    if (res && typeof res === "string") {
      try {
        const data = JSON.parse(res);
        downloadList.value = data.downloadList || [];
        finishedList.value = data.finishedList || [];
        uploadList.value = data.uploadList || [];
      } catch (err) {
        console.error(err);
      }
    }
  });
  // 更新的时候设置一下缓存
  watch([downloadList, finishedList, uploadList], () => {
    const data = JSON.stringify({
      downloadList: downloadList.value,
      finishedList: finishedList.value,
      uploadList: uploadList.value,
    });
    localforage.setItem(`${storeKey.toLocaleUpperCase()}`, data);
  });

  return {
    tab,
    setTab,
    hasNewFinished,
    finishedList,
    downloadList,
    uploading,
    uploadList,
    downloading,
    setDownload(newList: ITransmission[]) {
      downloadList.value = newList;
    },
    setFinishedList(newList: ITransmission[]) {
      finishedList.value = newList;
    },
    setUpload(newList: ITransmission[]) {
      uploadList.value = newList;
    },
    listen() {
      listen("tauri://transmission-upload-emit", (res) => {
        const resData = res.payload as {
          upload_complete_infos: { id: string; size: number; errors?: string[] }[];
          upload_progress: { id: string; size: number; progress: number; errors: string[] }[];
        };
        if (resData.upload_complete_infos?.length) {
          const infoMap: Record<string, ITransmission> = {};
          // 本次完成的信息
          const map: Record<
            string,
            {
              size: number;
              errors?: string[];
            }
          > = {};
          resData.upload_complete_infos.forEach(({ id, size, errors }) => {
            map[id] = {
              size,
              errors,
            };
          });

          // uploadList 清除掉已完成的数据，同时把这些信息放入 map
          uploadList.value = uploadList.value.filter((item) => {
            // 如果已经上传完毕就记录一下完整信息
            if (map[item.id]) {
              infoMap[item.id] = {
                ...item,
                size: item.size,
                errs: map[item.id].errors,
              };

              //   如果在选中状态，就取消选中
              if (uploadedPanelStore.checkedMap[item.id]) {
                const newMap = unref(uploadedPanelStore.checkedMap);
                delete newMap[item.id];
                uploadedPanelStore.checkedMap = { ...newMap };
              }
            }

            // 只保留未上传的
            return !map[item.id];
          });
          if (!uploadList.value.length) {
            notification.open({
              message: "上传完毕",
              type: "success",
              description: "当前所有文件已全部上传完毕",
            });
          }

          if (tab.value !== "FINISHED") {
            hasNewFinished.value = true;
          }

          // 塞入已完成列表
          finishedList.value = resData.upload_complete_infos
            .map((item) => infoMap[item.id])
            .filter((item) => item)
            .concat(finishedList.value)
            .slice(0, 5000);
        }

        // 更新一下上传进度
        if (resData.upload_progress?.length) {
          const map: Record<
            string,
            {
              progress: number;
              size: number;
              errors?: string[];
            }
          > = {};
          resData.upload_progress.forEach((item) => {
            map[item.id] = {
              size: item.size,
              progress: item.progress,
              errors: item.errors,
            };
          });

          uploadList.value = uploadList.value.map((item) => {
            if (map[item.id]?.progress !== undefined) {
              return {
                ...item,
                size: map[item.id].size,
                errs: map[item.id].errors || item.errs,
                progress: getProgress(map[item.id].progress),
              };
            }
            return item;
          });
        }
      });
      listen("tauri://transmission-download-emit", (res) => {
        const resData = res.payload as {
          download_progress: { id: string; progress: number; errors: string[] }[];
          download_complete_infos: { id: string; errors?: string[] }[];
        };

        //   下载部分
        if (resData.download_complete_infos?.length) {
          const infoMap: Record<string, ITransmission> = {};
          // 本次完成的信息
          const map: Record<
            string,
            {
              errors?: string[];
            }
          > = {};
          resData.download_complete_infos.forEach(({ id, errors }) => {
            map[id] = {
              errors,
            };
          });

          // uploadList 清除掉已完成的数据，同时把这些信息放入 map
          downloadList.value = downloadList.value.filter((item) => {
            // 如果已经上传完毕就记录一下完整信息
            if (map[item.id]) {
              infoMap[item.id] = {
                ...item,
                errs: map[item.id].errors,
              };

              //   如果在选中状态，就取消选中
              if (downloadedPanelStore.checkedMap[item.id]) {
                const newMap = unref(uploadedPanelStore.checkedMap);
                delete newMap[item.id];
                downloadedPanelStore.checkedMap = { ...newMap };
              }
            }

            // 只保留未上传的
            return !map[item.id];
          });

          if (!downloadList.value.length) {
            notification.open({
              message: "下载完毕",
              type: "success",
              description: "当前所有文件已全部下载完毕",
            });
          }

          if (tab.value !== "FINISHED") {
            hasNewFinished.value = true;
          }
          // 塞入已完成列表
          finishedList.value = resData.download_complete_infos
            .map((item) => infoMap[item.id])
            .filter((item) => item)
            .concat(finishedList.value)
            .slice(0, 5000);
        }

        // 更新一下下载进度
        if (resData.download_progress?.length) {
          const map: Record<
            string,
            {
              progress: number;
              errors?: string[];
            }
          > = {};
          resData.download_progress.forEach((item) => {
            map[item.id] = {
              progress: item.progress,
              errors: item.errors,
            };
          });

          downloadList.value = downloadList.value.map((item) => {
            if (map[item.id]?.progress !== undefined) {
              return {
                ...item,
                errs: map[item.id].errors || item.errs,
                progress: getProgress(map[item.id].progress),
              };
            }
            return item;
          });
        }
      });
    },
  };
});

export const Transmission = defineComponent({
  setup() {
    const store = useTransmissionStore();

    onMounted(() => {
      store.setTab(TransmissionTab.FINISHED);
    });
    return () => {
      return (
        <div class={"h-full"}>
          <Tabs
            activeKey={store.tab}
            destroyInactiveTabPane={true}
            class={"h-full"}
            onChange={(tab) => {
              store.setTab(tab as ITransmissionTab);
            }}>
            <TabPane
              key={TransmissionTab.FINISHED}
              tab={
                <span class={"flex items-center"}>
                  {displayTransmissionTab(TransmissionTab.FINISHED)}
                  {store.hasNewFinished && (
                    <span class={"ml-2 text-blue-400"}>
                      <CheckOutlined />
                    </span>
                  )}
                </span>
              }>
              <FinishedPanel />
            </TabPane>
            <TabPane
              key={TransmissionTab.DOWNLOADING}
              tab={
                <span class={"flex items-center"}>
                  {displayTransmissionTab(TransmissionTab.DOWNLOADING)}

                  {store.downloading && (
                    <span class={"ml-2"}>
                      <LoadingOutlined />
                    </span>
                  )}
                </span>
              }>
              <DownloadingListPanel />
            </TabPane>
            <TabPane
              key={TransmissionTab.UPLOADING}
              tab={
                <span class={"flex items-center"}>
                  {displayTransmissionTab(TransmissionTab.UPLOADING)}
                  {store.uploading && (
                    <span class={"ml-2"}>
                      <LoadingOutlined />
                    </span>
                  )}
                </span>
              }>
              <UploadingListPanel />
            </TabPane>
          </Tabs>
        </div>
      );
    };
  },
});

/*上传如果出错，会导致进度可能超出 100%，虽然最后会修正，但是为了不出现明显错误，强制超过 100 的显示 99*/
function getProgress(progress: number) {
  // if (progress > 1) {
  //   return 99;
  // }
  return Number(`${(progress * 100).toFixed(2)}`.replaceAll(".00", ""));
}
