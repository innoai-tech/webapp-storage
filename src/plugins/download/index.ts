import { open } from "@tauri-apps/api/dialog";
import { downloadDir } from "@tauri-apps/api/path";
import { createOperationTask, getObject, IObjectObjectInfo, listObjects } from "@src/src-clients/storage";
import { invoke } from "@tauri-apps/api/tauri";
import { useAuthorization } from "@src/plugins/request/axios";
import { useTransmissionStore } from "@src/pages/transmission";
import { ITransmission } from "@src/pages/transmission/interface";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { toFullTime } from "@src/utils/date";

export const downloadFiles = async (files: { name: string; size: number; path: string }[], path: string) => {
  const getAuthorization = useAuthorization();
  const transmissionStore = useTransmissionStore();
  const _files = files.map((item) => {
    const auth = getAuthorization();
    const url = getObject.getConfig({
      path: item.path,
    }).url;
    const download: ITransmission = {
      id: uuid(),
      size: item.size,
      type: "DOWNLOAD",
      path: path,
      name: item.name,
      progress: 0,
      created: dayjs().format("YYYY-MM-DD HH:mm"),
    };
    return {
      download,
      url: url,
      auth: auth,
      localPath: path,
      fileName: `${download.name}`,
      id: download.id,
      size: item.size,
    };
  });
  if (_files.length) {
    transmissionStore.setDownload(_files.map((item) => item.download).concat(transmissionStore.downloadList));

    // 必须要下划线
    invoke("download_files", {
      filesJsonStr: JSON.stringify(
        _files.map((file) => ({
          url: file.url,
          size: file.size,
          auth: file.auth,
          file_name: file.fileName,
          local_path: file.localPath,
          id: file.id,
        })),
      ),
    });
  }
};

export const downloadDirs = async (dirs: IObjectObjectInfo[], path: string) => {
  const getAuthorization = useAuthorization();
  const transmissionStore = useTransmissionStore();

  const _dirs = dirs.map((item) => {
    const download: ITransmission = {
      id: uuid(),
      size: item.size,
      type: "DOWNLOAD",
      path: path,
      name: item.name,
      progress: 0,
      created: dayjs().format("YYYY-MM-DD HH:mm"),
    };
    return {
      download,
      id: download.id,
      path: item.path,
      name: item.name,
    };
  });
  if (_dirs.length) {
    transmissionStore.setDownload(_dirs.map((item) => item.download).concat(transmissionStore.downloadList));

    // 必须要下划线
    invoke("download_dirs", {
      dirsJsonStr: JSON.stringify({
        // url里的 path 给rust 拼接，不需要前端拼接，所以
        get_files_base_url: listObjects.getConfig({ path: "" }).baseUrl,
        download_files_base_url: getObject.getConfig({ path: "" }).baseUrl,
        local_path: path,
        auth: getAuthorization(),
        dirs: _dirs.map((item) => ({
          create_task_url: createOperationTask.getConfig({ body: { desc: "" } }).url,
          name: item.name,
          path: item.path,
          id: item.id,
        })),
      }),
    });
  }
};
