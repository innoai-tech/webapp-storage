import { CellRendererParams } from "element-plus/es/components/table-v2/src/types";
import { toFullTime } from "@src/utils/date";
import { deleteDir, deleteObject, IObjectObjectInfo } from "@src/src-clients/storage";
import { useCurrentPath, useDiskStore, usePathsStore } from "@src/pages/disk/store";
import { computed, unref, createVNode, getCurrentInstance } from "vue";
import { ExclamationCircleOutlined, MoreOutlined } from "@ant-design/icons-vue";
import { Button, Checkbox, Dropdown, Menu, MenuItem, message, Modal, Tooltip } from "ant-design-vue";
import { downloadDirs, downloadFiles } from "@src/plugins/download";
import { CopyAndMoveDirFilesModal } from "@src/components/selectDirModal";
import { useRequest } from "vue-request";
import { RenameFileModal } from "@src/pages/disk/component/RenameFileModal";
import { getFileSize } from "@src/utils/getFileSize";
import { DirAuthModal, useDirAuthStore } from "@src/components/dirAuth";
import { useImagesViewerStore } from "@src/components/imagesviewer";
import {
  IconCode,
  IconDir,
  IconExcel,
  IconImage,
  IconMusic,
  IconPDF,
  IconPPT,
  IconTxt,
  IconUnknown,
  IconVideo,
  IconZip,
  isImage,
  isVideo,
} from "@src/pages/disk/Icon";
import { useVideosViewerStore } from "@src/components/videosviewer";
import { AuthButton } from "@src/components/authButton";

export const useColumns = () => {
  const pathsStore = usePathsStore();
  const store = useDiskStore();
  const checkedMap = computed(() => store.checkedMap);
  const allSelected = computed(() => {
    const values = Object.values(checkedMap.value);
    return !!values.length && !values.includes(false);
  });

  const containsChecked = computed(() => Object.values(checkedMap.value).includes(true));
  const currentPath = useCurrentPath();
  const dirAuthStore = useDirAuthStore();
  const videosViewerStore = useVideosViewerStore();
  const imagesViewerStore = useImagesViewerStore();
  const { runAsync: dirDelete } = useRequest(deleteDir, {
    manual: true,
    onSuccess() {
      message.success("删除成功");
      store.refreshFiles();
    },
  });
  const { runAsync: objectDelete } = useRequest(deleteObject, {
    manual: true,
    onSuccess() {
      message.success("删除成功");
      store.refreshFiles();
    },
  });

  return [
    {
      key: "selection",
      width: 50,
      cellRenderer: ({ rowData }: { rowData: IObjectObjectInfo }) => {
        const onChange = (e) => {
          const newMap = unref(checkedMap.value);
          const value = e.target.checked;
          newMap[rowData.path] = value as boolean;
          store.setCheckedMap({ ...newMap });
        };
        return <Checkbox onChange={onChange} checked={checkedMap.value[rowData.path]} />;
      },

      headerCellRenderer: () => {
        const onChange = (e) => {
          const value = e.target.checked as boolean;
          const newMap = {};
          store.objects.forEach((item) => {
            newMap[item.path] = value;
          });
          store.setCheckedMap(newMap);
        };

        if (!store.objects.length) {
          return null;
        }
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
      title: "名称",
      key: "name",
      dataKey: "name",
      width: 400,
      cellRenderer({ rowData }: { rowData: IObjectObjectInfo }) {
        const isImg = isImage(rowData["content-type"]);
        return (
          <span
            class={`flex items-center gap-2 w-full ${rowData.isDir || isImg ? "hover:underline cursor-pointer" : ""}`}
            onClick={() => {
              if (rowData.isDir) {
                pathsStore.setPaths(store.goToPath(rowData.path));
              } else if (isImg) {
                imagesViewerStore.setCurrentPath(rowData.path);
              }
            }}>
            {getFileType({ rowData: rowData })}
            <span class={"flex-1 text-ellipsis whitespace-pre overflow-hidden"} title={rowData.name}>
              <span>{rowData.name}</span>
            </span>
          </span>
        );
      },
    },
    {
      title: "创建时间",
      key: "createAt",
      dataKey: "createAt",
      width: 200,
      cellRenderer({ cellData }: CellRendererParams<any>) {
        return <span>{toFullTime(cellData)}</span>;
      },
    },
    {
      title: "种类",
      key: "content-type",
      dataKey: "content-type",
      width: 140,
      cellRenderer({ cellData, rowData }: CellRendererParams<IObjectObjectInfo>) {
        if (rowData.isDir) {
          return <span>文件夹</span>;
        }
        return <span>{cellData || "-"}</span>;
      },
    },
    {
      title: "大小",
      key: "size",
      dataKey: "size",
      width: 140,
      cellRenderer({ rowData }: { rowData: IObjectObjectInfo }) {
        return <span>{getFileSize(rowData.size) || "-"}</span>;
      },
    },
    {
      title: "操作",
      key: "path",
      dataKey: "path",
      width: 140,
      align: "center" as const,
      cellRenderer({ rowData }: { rowData: IObjectObjectInfo }) {
        const disabled = !rowData.isDir && !isImage(rowData["content-type"]) && !isVideo(rowData["content-type"]);
        return (
          <div class={"flex"}>
            <Tooltip title={disabled ? "此类型无法在线查看" : ""}>
              <Button
                type={"link"}
                disabled={disabled}
                onClick={() => {
                  if (rowData.isDir) {
                    pathsStore.setPaths(store.goToPath(rowData.path));
                  } else if (isImage(rowData["content-type"])) {
                    imagesViewerStore.setCurrentPath(rowData.path);
                  } else if (isVideo(rowData["content-type"])) {
                    videosViewerStore.setCurrentPath(rowData.path);
                  }
                }}>
                查看
              </Button>
            </Tooltip>

            <Button
              class={"ml-2"}
              type={"link"}
              onClick={() => {
                if (rowData.isDir) {
                  downloadDirs([rowData]);
                } else {
                  downloadFiles([rowData]);
                }
              }}>
              下载
            </Button>

            <Dropdown
              trigger={"click"}
              class={"ml-2"}
              v-slots={{
                overlay() {
                  return (
                    <Menu>
                      <MenuItem>
                        <Button
                          class={"m-0 p-0"}
                          type={"link"}
                          onClick={() => {
                            Modal.confirm({
                              title: "复制文件",
                              width: "40rem",
                              icon: null,
                              content: createVNode(
                                <CopyAndMoveDirFilesModal
                                  objects={[{ ...rowData, isDir: Boolean(rowData.isDir) }]}
                                  mode={"COPY"}
                                  okText={"复制至此"}
                                />,
                              ),
                              closable: true,
                              cancelButtonProps: { style: { display: "none" } } as any,
                              okButtonProps: { style: { display: "none" } } as any,
                              wrapClassName: "confirmModal",
                            });
                          }}>
                          复制
                        </Button>
                      </MenuItem>
                      <MenuItem>
                        <Button
                          type={"link"}
                          onClick={() => {
                            Modal.confirm({
                              title: "复制文件",
                              width: "40rem",
                              icon: null,
                              content: createVNode(
                                <CopyAndMoveDirFilesModal
                                  objects={[{ ...rowData, isDir: Boolean(rowData.isDir) }]}
                                  mode={"MOVE"}
                                  okText={"复制至此"}
                                />,
                              ),
                              closable: true,
                              cancelButtonProps: { style: { display: "none" } } as any,
                              okButtonProps: { style: { display: "none" } } as any,
                              wrapClassName: "confirmModal",
                            });
                          }}>
                          移动
                        </Button>
                      </MenuItem>
                      <MenuItem>
                        <AuthButton
                          type={"link"}
                          hasPermission={dirAuthStore.currentUserRole !== "MEMBER"}
                          onClick={() => {
                            Modal.confirm({
                              title: "重命名",
                              content: createVNode(
                                <RenameFileModal
                                  path={rowData.path}
                                  name={rowData.name}
                                  mode={rowData.isDir ? "DIR" : "FILE"}
                                />,
                              ),
                              closable: true,
                              cancelButtonProps: { style: { display: "none" } } as any,
                              okButtonProps: { style: { display: "none" } } as any,
                              wrapClassName: "confirmModal",
                            });
                          }}>
                          重命名
                        </AuthButton>
                      </MenuItem>
                      {rowData.isDir && (
                        <MenuItem>
                          <AuthButton
                            type={"link"}
                            hasPermission={dirAuthStore.currentUserRole !== "MEMBER"}
                            danger
                            onClick={() => {
                              Modal.confirm({
                                title: "权限管理",
                                icon: null,
                                width: "100rem",
                                closable: true,
                                appContext: getCurrentInstance()?.appContext,
                                content: createVNode(<DirAuthModal dir={{ name: rowData.name, path: rowData.path }} />),
                                cancelButtonProps: { style: { display: "none" } } as any,
                                okButtonProps: { style: { display: "none" } } as any,
                                wrapClassName: "confirmModal",
                              });
                            }}>
                            修改权限
                          </AuthButton>
                        </MenuItem>
                      )}
                      <MenuItem>
                        <AuthButton
                          type={"link"}
                          hasPermission={dirAuthStore.currentUserRole !== "MEMBER"}
                          danger
                          onClick={() => {
                            Modal.confirm({
                              title: "是否确定删除当前文件",
                              icon: createVNode(ExclamationCircleOutlined),
                              content: "删除后无法恢复",
                              closable: true,
                              onOk() {
                                const clearCheckedMap = () => {
                                  const map = unref(store.checkedMap);
                                  delete map[rowData.path];
                                  store.setCheckedMap({ ...map });
                                };
                                if (rowData.isDir) {
                                  return dirDelete({ path: rowData.path }).then(clearCheckedMap);
                                }
                                return objectDelete({ path: currentPath.value, file: [rowData.name] }).then(
                                  clearCheckedMap,
                                );
                              },
                            });
                          }}>
                          删除
                        </AuthButton>
                      </MenuItem>
                    </Menu>
                  );
                },
              }}>
              <Button type={"link"} class={"ml-1"}>
                <MoreOutlined title={"更多操作"} />
              </Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];
};

function getFileType({ rowData }: { rowData: IObjectObjectInfo }) {
  let type = "";

  if (rowData.isDir) {
    type = "DIR";
  } else if (rowData["content-type"]?.includes("image")) {
    type = "IMAGE";
  } else if (rowData["content-type"]?.includes("java") || rowData["content-type"]?.includes("python")) {
    type = "CODE";
  } else if (rowData["content-type"]?.includes("music")) {
    type = "MUSIC";
  } else if (rowData["content-type"]?.includes("mp3")) {
    type = "MP3";
  } else if (rowData["content-type"]?.includes("txt") || rowData["content-type"]?.includes("text")) {
    type = "TXT";
  } else if (rowData["content-type"]?.includes("ppt")) {
    type = "PPT";
  } else if (rowData["content-type"]?.includes("zip")) {
    type = "ZIP";
  } else if (rowData["content-type"]?.includes("pdf")) {
    type = "PDF";
  } else if (rowData["content-type"]?.includes("mp4")) {
    type = "MP4";
  }

  if (type === "DIR") {
    return <IconDir />;
  }
  if (type === "IMAGE" && isImage(rowData["content-type"])) {
    return <IconImage imageData={rowData} />;
  }
  if (type === "CODE") {
    return <IconCode />;
  }
  if (type === "MP3") {
    return <IconMusic />;
  }
  if (type === "TXT") {
    return <IconTxt />;
  }
  if (type === "PPT") {
    return <IconPPT />;
  }
  if (type === "PDF") {
    return <IconPDF />;
  }
  if (type === "MP4") {
    return <IconVideo />;
  }
  if (type === "ZIP") {
    return <IconZip />;
  }
  if (type === "EXCEL") {
    return <IconExcel />;
  }
  return <IconUnknown />;
}
