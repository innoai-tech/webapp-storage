import { defineComponent, PropType, ref } from "vue";
import { message, Modal, Progress } from "ant-design-vue";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { useAuthorization } from "@src/plugins/request/axios";
import { useCurrentPath, useDiskStore } from "@src/pages/disk/store";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { v4 as uuid } from "uuid";
import { downloadDir } from "@tauri-apps/api/path";
import { last } from "lodash-es";
import { useTransmissionStore } from "@src/pages/transmission";
import { ITransmission } from "@src/pages/transmission/interface";
import dayjs from "dayjs";
import { useSettingStore } from "@src/pages/setting";
import { useRequest } from "vue-request";
import { createDir } from "@src/src-clients/storage";

export const replaceFileName = (name: string): string => {
  return name?.replaceAll(":", "：").replaceAll("/", "_");
};

export const UploadModal = defineComponent({
  props: {
    mode: {
      type: String as PropType<"DIR" | "FILE">,
      required: true,
    },
  },
  setup(props) {
    const currentPath = useCurrentPath();
    const getAuthorization = useAuthorization();
    const files = ref<
      {
        id: string;
        file: File;
      }[]
    >([]);
    const getFileDomID = (id: string) => `upload_file_${id}`;
    const errorMap = ref<Record<string, string>>({});
    const percentMap = ref<Record<string, number>>({});
    const transmissionStore = useTransmissionStore();
    const settingStore = useSettingStore();
    const diskStore = useDiskStore();
    const { runAsync: createDirAsync } = useRequest(createDir, {
      manual: true,
      onSuccess() {
        diskStore.refreshFiles();
      },
    });

    return () => (
      <div>
        <div
          onClick={async () => {
            const path = await open({
              title: "选择下载位置",
              directory: props.mode === "DIR",
              defaultPath: await downloadDir(),
              // 文件夹暂时不支持多选上传
              multiple: props.mode !== "DIR",
            });
            const baseUrl = settingStore.host;
            if (path?.length) {
              if (props.mode === "FILE") {
                // 只有文件支持多个
                if (Array.isArray(path) && path.length > 1) {
                  // 多文件上传
                  const files = path.map((item) => {
                    const fileName = replaceFileName(last(item.split("/")) || "");
                    const filePath = `${currentPath.value === "/" ? "" : currentPath.value}/${fileName}`;
                    const checkObjectUrl = `${baseUrl}/api/storage/v0/objects/check?authorization=${getAuthorization()}&path=${filePath}`;

                    const id = uuid();
                    const uploadData: ITransmission = {
                      id,
                      size: 0,
                      type: "UPLOAD",
                      path: currentPath.value,
                      name: fileName,
                      progress: 0,
                      created: dayjs().format("YYYY-MM-DD HH:mm"),
                    };
                    return {
                      uploadData,
                      checkObjectUrl,
                      url: `${baseUrl}/api/storage/v0/objects/upload`,
                      originPath: `${currentPath.value === "/" ? "" : currentPath.value}/${fileName}`,
                      auth: getAuthorization(),
                      localPath: item,
                      id,
                    };
                  });
                  transmissionStore.setUpload(
                    files.map((file) => file.uploadData).concat(transmissionStore.uploadList),
                  );

                  // 序列化数组必须下划线
                  invoke("upload_files", {
                    filesJsonStr: JSON.stringify(
                      files.map((file) => ({
                        check_object_url: file.checkObjectUrl,
                        url: file.url,
                        auth: file.auth,
                        origin_path: file.originPath,
                        local_path: file.localPath,
                        id: file.id,
                      })),
                    ),
                  }).then(() => {
                    message.success("文件已开始上传");
                    Modal.destroyAll();
                  });
                } else {
                  const _path = Array.isArray(path) ? path[0] : path;
                  //   单文件上传
                  const fileName = replaceFileName(last(_path.split("/")) || "");
                  if (diskStore.objects.find((item) => !item.isDir && item.name === fileName)) {
                    return message.warn("文件已存在");
                  }
                  const filePath = `${currentPath.value === "/" ? "" : currentPath.value}/${fileName}`;
                  const checkObjectUrl = `${baseUrl}/api/storage/v0/objects/check`;
                  const id = uuid();
                  const uploadData: ITransmission = {
                    id,
                    size: 0,
                    name: fileName,
                    type: "UPLOAD",
                    path: currentPath.value,
                    progress: 0,
                    created: dayjs().format("YYYY-MM-DD HH:mm"),
                  };
                  transmissionStore.setUpload([uploadData].concat(transmissionStore.uploadList));
                  invoke("upload_file", {
                    checkObjectUrl,
                    origin_path: filePath,
                    url: `${baseUrl}/api/storage/v0/objects/upload`,
                    auth: getAuthorization(),
                    originPath: `${currentPath.value === "/" ? "" : currentPath.value}/${fileName}`,
                    localPath: _path,
                    id,
                  }).then(() => {
                    message.success("文件已开始上传");
                    Modal.destroyAll();
                  });
                }
              } else {
                // 文件夹上传
                const _path = Array.isArray(path) ? path[0] : path;
                let dirName = last(_path.split("/"))!;
                // 如果重名了
                if (diskStore.objects.filter((item) => item.isDir).find((dir) => dir.name === dirName)) {
                  dirName = `${dirName}_${dayjs().format("YYYY_MM_DD_HH_mm")}`;
                }
                const newDirPath = `${currentPath.value === "/" ? "" : currentPath.value}/${dirName}`;
                // 创建文件夹
                createDirAsync({ path: newDirPath }).then(
                  () => {
                    const id = uuid();
                    const checkObjectUrl = `${baseUrl}/api/storage/v0/objects/check`;
                    const url = `${baseUrl}/api/storage/v0/objects/upload`;
                    invoke("upload_dir", {
                      checkObjectUrl,
                      url,
                      auth: getAuthorization(),
                      dirPath: _path,
                      originPath: newDirPath,
                      id,
                    }).then(() => {
                      transmissionStore.setUpload(
                        [
                          {
                            id,
                            path: newDirPath,
                            type: "UPLOAD",
                            size: 0,
                            name: dirName,
                            progress: 0,
                            created: dayjs().format("YYYY-MM-DD HH:mm"),
                          } as ITransmission,
                        ].concat(transmissionStore.uploadList),
                      );
                      Modal.destroyAll();
                      message.success("文件夹已开始下载");
                    });
                  },
                  () => {
                    message.warn("上传文件夹失败，请稍后再试");
                  },
                );
              }
            }
          }}
          class={
            "flex items-center flex-col justify-center mb-4 h-40 border border-gray-300 border-dashed bg-neutral-100 hover:border-blue-300 transition-all ease-in duration-150 rounded cursor-pointer"
          }>
          <p class="ant-upload-drag-icon text-5xl text-blue-400 m-0 mb-3">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text mb-1 text-base">点击上传文件{props.mode === "DIR" ? "夹" : ""}</p>
          <p class="ant-upload-hint text-gray-500">
            {props.mode === "DIR" ? "仅支持单个文件夹" : "支持单个或批量上传"}
          </p>
        </div>

        {!!files.value?.length && (
          <ul
            class={"max-h-40 overflow-y-auto bg-gray-100  border border-gray-300 border-dashed bg-neutral-100 p-2 m-0"}>
            {files.value.map((file) => {
              return (
                <li class={"group last:mb-1"} key={file.id} id={getFileDomID(file.id)}>
                  <div class={"w-full flex items-center -mb-2"}>
                    <LoadingOutlined />
                    <span class={"ml-2 w-full text-ellipsis overflow-hidden whitespace-pre"}>{file.file.name}</span>
                  </div>
                  {!!errorMap.value[file.id] && <span class={"text-s text-red-500"}>{errorMap.value[file.id]}</span>}
                  <Progress
                    percent={percentMap.value[file.id] || 0}
                    success={{ percent: percentMap.value[file.id] || 0 }}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
});
