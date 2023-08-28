import { computed, createVNode, defineComponent, getCurrentInstance, ref, watch } from "vue";
import {
  Button,
  Checkbox,
  Dropdown,
  InputSearch,
  Menu,
  MenuItem,
  message,
  Modal,
  Select,
  Tooltip,
} from "ant-design-vue";
import { UploadModal } from "@src/pages/disk/upload";
import {
  CloudDownloadOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  KeyOutlined,
  MoreOutlined,
  RedoOutlined,
  SlidersOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import { TooltipButton } from "@src/components/tooltipsButton/index";
import { CreateDirModal } from "@src/pages/disk/component/createDirModal";
import { downloadDirs, downloadFiles } from "@src/plugins/download";
import { CopyAndMoveDirFilesModal } from "@src/components/selectDirModal";
import { DirAuthModal } from "@src/components/dirAuth";
import { useBreadCrumbPathsStore, useCurrentPath, useDiskStore, usePathsStore } from "@src/pages/disk/store";
import { useRequest } from "vue-request";
import {
  IObjectObjectSearchDataList,
  deleteDir,
  deleteObject,
  dirSearch,
  dirStatistics,
} from "@src/src-clients/storage";
import { AuthButton } from "@src/components/authButton";
import { last } from "lodash-es";
import { open } from "@tauri-apps/api/dialog";
import { downloadDir } from "@tauri-apps/api/path";
import { getFileSize } from "@src/utils/getFileSize";
import { debounce } from "@querycap/lodash";
import { TextEllipsis } from "@src/components/textEllipsis";

export const DiskMenus = defineComponent({
  setup() {
    const pathsStore = usePathsStore();
    const store = useDiskStore();
    const checkedMap = computed(() => store.checkedMap);
    const hasChecked = computed(() => Object.values(checkedMap.value).includes(true));
    const hasAuth = computed(() => store.roleType !== "GUEST" && store.roleType !== "MEMBER");
    const currentPath = useCurrentPath();
    const selectedObjects = computed(() => store.objects.filter((object) => !!checkedMap.value[object.path]));
    const breadCrumbPathsStore = useBreadCrumbPathsStore();
    const onlyDir = ref(false);
    const { runAsync: objectDelete } = useRequest(deleteObject, {
      manual: true,
    });
    const {
      runAsync: getDirStatistics,
      cancel: cancelGetDirStatistics,
      loading: getDirStatisticsLoading,
    } = useRequest(dirStatistics, {
      manual: true,
    });

    const searchDirs = ref<IObjectObjectSearchDataList | null>(null);
    const {
      runAsync: searchDir,

      loading: searchDirLoading,
    } = useRequest(dirSearch, {
      manual: true,
      onSuccess(res) {
        searchDirs.value = { total: res.total, data: res.data?.filter((item) => item.name && item.path) || [] };
      },
    });

    // 变更目录后取消统计请求
    watch(
      () => currentPath.value,
      () => {
        if (getDirStatisticsLoading) {
          cancelGetDirStatistics();
        }
      },
    );

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
              onClick={async () => {
                const files = store.objects.filter((obj) => !obj.isDir && checkedMap.value[obj.path]);
                const dirs = store.objects.filter((obj) => obj.isDir && checkedMap.value[obj.path]);
                const path = await open({
                  title: "选择下载位置",
                  directory: true,
                  defaultPath: await downloadDir(),
                });
                if (path?.length) {
                  const _path = Array.isArray(path) ? path[0] : path;
                  if (files.length) {
                    downloadFiles(files, _path);
                  }
                  if (dirs.length) {
                    downloadDirs(dirs, _path);
                  }
                } else {
                  message.warn("未选择任何路径");
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
                  centered: true,
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
                                    objectDelete({ path: currentPath.value, file: files }).then((res) => {
                                      resolve("");
                                    });
                                  } else {
                                    resolve("");
                                  }
                                }),
                                ...(dirs || []).map(
                                  (dir) =>
                                    new Promise((resolve) => {
                                      deleteDir({ path: dir }).then(() => {
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

            <Tooltip title={getDirStatisticsLoading.value ? "统计中" : "统计"}>
              <Button
                class={"ml-2"}
                disabled={getDirStatisticsLoading.value}
                onClick={() => {
                  getDirStatistics({ path: currentPath.value }).then((res) => {
                    Modal.confirm({
                      title: "文件统计",
                      closable: true,
                      icon: null,
                      content: () => (
                        <div>
                          <div class={"flex"}>
                            <div>文件夹数量：</div>
                            {res.dirCount}
                          </div>
                          <div class={"flex"}>
                            <div>文件数量：</div>
                            {res.fileCount}
                          </div>
                          <div class={"flex"}>
                            <div>文件大小：</div>
                            {getFileSize(res.fileSize)}
                          </div>
                        </div>
                      ),
                    });
                  });
                }}>
                {<SlidersOutlined />}
              </Button>
            </Tooltip>

            {!!store.total && <div class={"ml-2"}>{store.total}条</div>}
          </div>
          <div class={" flex align-items gap-2"}>
            {store.searchType !== "CURRENT" && (
              <div class="flex  items-center whitespace-pre">
                <Checkbox
                  value={onlyDir.value}
                  onChange={(e) => {
                    onlyDir.value = !e.target.value;
                  }}>
                  仅文件夹
                </Checkbox>
              </div>
            )}
            <div class="w-48">
              <Dropdown
                visible={store.searchType !== "CURRENT" && !!searchDirs.value?.data?.length}
                trigger={"click"}
                v-slots={{
                  overlay() {
                    return (
                      <Menu class={"h-48 overflow-scroll"}>
                        {searchDirs.value?.data.map((item) => {
                          return (
                            <MenuItem
                              key={item.path}
                              onClick={() => {
                                // 搜索中退出
                                if (store.loading) return;

                                // 拼出来从当前路径到搜索到的目录之间所有路径的完整信息，key 是文件夹名字，value 是 path
                                const pathMap: { [name: string]: string } = {};

                                let paths = `${item.path}`
                                  .replace(`${currentPath.value || "/"}`, "")
                                  .split("/")
                                  .filter((name) => !!name);
                                // 最后一个是文件名，删除掉
                                if (!item.isDir) {
                                  paths = paths.slice(0, paths.length - 1);
                                }

                                paths.reduce(
                                  (parentPath, name) => {
                                    const currentPath = `${parentPath}/${name}`;
                                    pathMap[name] = currentPath;
                                    return currentPath;
                                  },
                                  currentPath.value === "/" || !currentPath.value ? "" : currentPath.value,
                                );

                                breadCrumbPathsStore.setPaths(
                                  breadCrumbPathsStore.paths.concat(
                                    paths.map((name) => {
                                      return {
                                        name: `/${name}`,
                                        path: pathMap[name],
                                      };
                                    }),
                                  ),
                                );
                                searchDirs.value = null;

                                if (item.isDir) {
                                  pathsStore.setPaths(store.goToPath(item.path));
                                } else {
                                  // 文件进入父级路径，也就是之前整理的路径里最后一个的绝对路径
                                  const path = pathMap[last(paths)!];
                                  pathsStore.setPaths(store.goToPath(path));
                                }

                                // 修改搜索数据，文件修改为文件名，文件夹直接情况
                                if (!item.isDir) {
                                  // 设置为搜索当前文件，同时跳转到文件所属目录
                                  store.searchType = "CURRENT";
                                  store.setSearchName(item.name);
                                } else {
                                  store.setSearchName("");
                                }
                              }}>
                              <div class="w-60 mb-2">
                                <TextEllipsis class="mb-1">{item.name}</TextEllipsis>
                                <div class="text-xs text-color text-gray-600">
                                  <div>类型: {item.isDir ? "文件夹" : "文件"}</div>

                                  <div class="whitespace-pre-wrap" title={item.path}>
                                    <span class={"whitespace-pre"}>路径: </span>

                                    {`${item.path}`.replace(`${currentPath.value || "/"}`, "")}
                                  </div>
                                </div>
                              </div>
                            </MenuItem>
                          );
                        })}
                        {searchDirs.value?.data.length !== searchDirs.value?.total && (
                          <MenuItem>
                            <span class="text-xs text-color text-gray-600">
                              共{searchDirs.value?.total}条记录，最多显示 100 条
                            </span>
                          </MenuItem>
                        )}
                      </Menu>
                    );
                  },
                }}>
                <InputSearch
                  loading={searchDirLoading.value}
                  class={"rounded-none"}
                  // @ts-ignore 禁用 mac 拼写提示
                  spellcheck="false"
                  value={store.searchName}
                  onChange={(e) => {
                    const value = (e.target as any).value;
                    store.searchName = value;
                  }}
                  onBlur={() => {
                    // 延迟 300，不然点击文件夹进去的时候会错误（点击的时候已经触发 blur 了）
                    setTimeout(() => {
                      searchDirs.value = null;
                    }, 300);
                  }}
                  onInput={debounce((e) => {
                    const value = (e.target as any).value;
                    if (store.searchType === "CHILD_DIR") {
                      if (value) {
                        searchDir({
                          onlyDir: onlyDir.value,
                          path: currentPath.value,
                          keyword: value,
                        });
                      }
                    } else {
                      store.setSearchName(value);
                    }
                  }, 300)}
                  prefix={
                    <Dropdown
                      trigger={"click"}
                      v-slots={{
                        overlay() {
                          return (
                            <Menu>
                              <MenuItem
                                onClick={() => {
                                  store.searchType = "CURRENT";
                                  // 切换的时候触发一下搜索
                                  store.setSearchName(store.searchName);

                                  // 清空搜索列表
                                  searchDirs.value = null;
                                }}>
                                <span>当前列表搜索</span>
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  store.searchType = "CHILD_DIR";
                                  // 切换的时候触发一下搜索
                                  if (currentPath.value) {
                                    searchDir({
                                      onlyDir: onlyDir.value,
                                      path: currentPath.value,
                                      keyword: store.searchName,
                                    });
                                  }
                                }}>
                                <span>子文件列表搜索</span>
                              </MenuItem>
                            </Menu>
                          );
                        },
                      }}>
                      <div class={"pr-2"}>{store.searchType === "CURRENT" ? "当前" : "子级"}</div>
                    </Dropdown>
                  }
                  placeholder={"输入名称后回车筛选"}
                />
              </Dropdown>
            </div>
          </div>
        </div>
      );
    };
  },
});
