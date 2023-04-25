import { computed, createVNode, defineComponent, getCurrentInstance, watch } from "vue";
import { Button, Dropdown, InputSearch, Menu, MenuItem, message, Modal, Tooltip } from "ant-design-vue";
import { UploadModal } from "@src/pages/disk/upload";
import {
  CloudDownloadOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  KeyOutlined,
  MoreOutlined,
  RedoOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import { TooltipButton } from "@src/components/tooltipsButton/index";
import { CreateDirModal } from "@src/pages/disk/component/createDirModal";
import { downloadDirs, downloadFiles } from "@src/plugins/download";
import { CopyAndMoveDirFilesModal } from "@src/components/selectDirModal";
import { DirAuthModal } from "@src/components/dirAuth";
import { useCurrentPath, useDiskStore } from "@src/pages/disk/store";
import { useRequest } from "vue-request";
import { deleteDir, deleteObject } from "@src/src-clients/storage";
import { AuthButton } from "@src/components/authButton";
import { last } from "lodash-es";

export const DiskMenus = defineComponent({
  setup() {
    const store = useDiskStore();
    const checkedMap = computed(() => store.checkedMap);
    const hasChecked = computed(() => Object.values(checkedMap.value).includes(true));
    const hasAuth = computed(() => store.roleType !== "GUEST" && store.roleType !== "MEMBER");
    const currentPath = useCurrentPath();
    const selectedObjects = computed(() => store.objects.filter((object) => !!checkedMap.value[object.path]));

    const { runAsync: objectDelete } = useRequest(deleteObject, {
      manual: true,
    });

    return () => {
      return (
        <div class={"flex-shrink-0 mb-2 flex justify-between w-full items-center"}>
          <div class={"flex-shrink-0 mb-2 flex-1 flex items-center flex-nowrap"}>
            <Dropdown
              trigger={"click"}
              v-slots={{
                overlay() {
                  return (
                    <Menu>
                      <MenuItem
                        onClick={() => {
                          Modal.confirm({
                            title: "上传文件",
                            closable: true,
                            centered: true,
                            content: createVNode(<UploadModal mode={"FILE"} />),
                            icon: null,
                            cancelButtonProps: { style: { display: "none" } } as any,
                            okButtonProps: { style: { display: "none" } } as any,
                            wrapClassName: "confirmModal",
                          });
                        }}>
                        上传文件
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          Modal.confirm({
                            title: "上传文件夹",
                            closable: true,
                            centered: true,
                            content: createVNode(<UploadModal mode={"DIR"} />),
                            icon: null,
                            cancelButtonProps: { style: { display: "none" } } as any,
                            okButtonProps: { style: { display: "none" } } as any,
                            wrapClassName: "confirmModal",
                          });
                        }}>
                        上传文件夹
                      </MenuItem>
                    </Menu>
                  );
                },
              }}>
              <AuthButton type={"primary"} hasPermission={store.roleType !== "GUEST"}>
                上传
                <span class={"pl-1"}>
                  <UploadOutlined />
                </span>
              </AuthButton>
            </Dropdown>

            <AuthButton
              hasPermission={true}
              icon={<FileAddOutlined />}
              class={"flex items-center ml-2"}
              onClick={() => {
                Modal.confirm({
                  title: "新建文件夹",
                  centered: true,
                  closable: true,
                  icon: createVNode(FolderAddOutlined),
                  content: createVNode(CreateDirModal),
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              新建文件夹
            </AuthButton>

            <TooltipButton
              title={"请选中后操作"}
              class={"ml-2"}
              disabled={!hasChecked.value}
              onClick={() => {
                const files = store.objects.filter((obj) => !obj.isDir && checkedMap.value[obj.path]);
                const dirs = store.objects.filter((obj) => obj.isDir && checkedMap.value[obj.path]);
                if (files.length) {
                  downloadFiles(files);
                }
                if (dirs.length) {
                  downloadDirs(dirs);
                }
              }}>
              下载
              <span class={"pl-1"}>
                <CloudDownloadOutlined />
              </span>
            </TooltipButton>

            <AuthButton
              class={"ml-2"}
              adminHasPermission={false}
              hasPermission={hasAuth.value && currentPath.value !== "/" && currentPath.value !== ""}
              title={currentPath.value === "/" || currentPath.value === "" ? "根目录无法操作" : ""}
              onClick={() => {
                Modal.confirm({
                  title: "权限管理",
                  icon: null,
                  width: "100rem",
                  closable: true,
                  appContext: getCurrentInstance()?.appContext,
                  content: createVNode(
                    <DirAuthModal dir={{ name: last(currentPath.value.split("/")) || "/", path: currentPath.value }} />,
                  ),
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              权限管理
              <span class={"pl-1"}>
                <KeyOutlined />
              </span>
            </AuthButton>
            <Dropdown
              trigger={"click"}
              v-slots={{
                overlay() {
                  return (
                    <Menu>
                      <MenuItem
                        onClick={() => {
                          Modal.confirm({
                            title: "复制文件",
                            width: "40rem",
                            icon: null,
                            content: createVNode(
                              <CopyAndMoveDirFilesModal
                                objects={
                                  selectedObjects.value?.map((item) => ({ ...item, isDir: Boolean(item.isDir) })) || []
                                }
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
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          Modal.confirm({
                            title: "移动文件",
                            width: "40rem",
                            icon: null,
                            content: createVNode(
                              <CopyAndMoveDirFilesModal
                                objects={
                                  selectedObjects.value?.map((item) => ({ ...item, isDir: Boolean(item.isDir) })) || []
                                }
                                mode={"MOVE"}
                                okText={"移动至此"}
                              />,
                            ),
                            closable: true,
                            cancelButtonProps: { style: { display: "none" } } as any,
                            okButtonProps: { style: { display: "none" } } as any,
                            wrapClassName: "confirmModal",
                          });
                        }}>
                        移动
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          Modal.confirm({
                            title: "是否确定删除选中的文件",
                            icon: createVNode(ExclamationCircleOutlined),
                            content: "删除后无法恢复，请慎重操作",
                            closable: true,
                            async onOk() {
                              const files = selectedObjects.value
                                .filter((item) => !item.isDir)
                                .map((item) => item.name);
                              const dirs = selectedObjects.value.filter((item) => item.isDir).map((item) => item.path);
                              return Promise.all([
                                new Promise((resolve) => {
                                  if (files.length) {
                                    objectDelete({ path: currentPath.value, file: files }).finally(() => {
                                      resolve("");
                                    });
                                  } else {
                                    resolve("");
                                  }
                                }),
                                ...(dirs || []).map(
                                  (dir) =>
                                    new Promise((resolve) => {
                                      deleteDir({ path: dir }).finally(() => {
                                        resolve("");
                                      });
                                    }),
                                ),
                              ]).then(() => {
                                // 清除选中的数据
                                store.setCheckedMap({});
                                message.success("删除成功");
                                store.refreshFiles();
                              });
                            },
                          });
                        }}>
                        <span class={"text-red-500"}>删除</span>
                      </MenuItem>
                    </Menu>
                  );
                },
              }}>
              <Tooltip title={selectedObjects.value.length ? "" : "请选择文件后再操作"}>
                <AuthButton
                  hasPermission={store.roleType !== "GUEST"}
                  class={"ml-2"}
                  disabled={!selectedObjects.value.length}>
                  <MoreOutlined title={"更多操作"} />
                </AuthButton>
              </Tooltip>
            </Dropdown>

            <Tooltip title={store.loading ? "刷新中..." : "刷新"}>
              <Button
                class={"ml-2"}
                disabled={store.loading}
                onClick={() => {
                  store.refreshFiles().then(() => {
                    message.success("已刷新");
                  });
                }}>
                {<RedoOutlined />}
              </Button>
            </Tooltip>
          </div>
          <div class={"w-48"}>
            <InputSearch
              defaultValue={store.searchName}
              onBlur={(e) => {
                store.setSearchName((e.target as any).value);
              }}
              onSearch={(val) => {
                store.setSearchName(val);
              }}
              placeholder={"输入名称后回车筛选"}
            />
          </div>
        </div>
      );
    };
  },
});
