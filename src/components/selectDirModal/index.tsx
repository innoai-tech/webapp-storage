import { computed, defineComponent, onMounted, PropType, ref, watch } from "vue";
import { useRequest } from "vue-request";
import { dirCopy, dirMove, listObjects, objectsCopy, objectsMove } from "@src/src-clients/storage";
import { Breadcrumb, BreadcrumbItem, Button, message, Modal, Tooltip } from "ant-design-vue";
import { replacePathName } from "@src/pages/disk";
import { joinPath, useCurrentPath, useDiskStore } from "@src/pages/disk/store";
import { last } from "lodash-es";

export const CopyAndMoveDirFilesModal = defineComponent({
  props: {
    okText: {
      type: String,
      required: true,
    },
    mode: {
      type: String as PropType<"MOVE" | "COPY">,
      required: true,
    },
    objects: {
      type: Array as PropType<{ name: string; path: string; isDir: boolean }[]>,
      required: true,
    },
  },
  setup(props) {
    const { run, data: list } = useRequest(listObjects, {
      manual: true,
      refreshOnWindowFocus: true,
    });
    const loading = ref(false);
    const paths = ref(["/"]);
    const currentPath = useCurrentPath();
    const { runAsync: copyDirs } = useRequest(dirCopy, { manual: true });
    const { runAsync: moveDirs } = useRequest(dirMove, { manual: true });
    const { runAsync: copyFiles } = useRequest(objectsCopy, { manual: true });
    const { runAsync: moveFiles } = useRequest(objectsMove, { manual: true });

    const diskStore = useDiskStore();
    const dirs = computed(() => list.value?.data?.filter((item) => item.isDir));

    onMounted(() => {
      watch(
        () => paths.value,
        () => {
          run({ path: paths.value.join("/") || "/" });
        },
        { immediate: true },
      );
    });

    return () => (
      <div onClick={(e) => e.stopPropagation()}>
        <div class={"p-2 mb-2 bg-gray-100 rounded"}>
          <Breadcrumb>
            {paths.value.map((path, index) => {
              return (
                <BreadcrumbItem key={`${path}_${index}`}>
                  <a
                    href={"javascript:;"}
                    onClick={() => {
                      paths.value = paths.value.slice(0, index + 1);
                    }}>
                    {replacePathName(path)}
                  </a>
                </BreadcrumbItem>
              );
            })}
          </Breadcrumb>
        </div>
        {dirs.value?.length ? (
          <ul class={"h-60 overflow-y-auto"}>
            {dirs.value?.map((dir) => {
              const currentLocation = dir.path === props.objects?.find((file) => file.path === dir.path)?.path;
              return (
                <Tooltip
                  title={
                    currentLocation ? `无法${props.mode === "COPY" ? "复制" : "移动"}到此` : `进入文件夹：${dir.name}`
                  }>
                  <li
                    key={dir.path}
                    class={`cursor-pointer p-2 hover:bg-gray-100 rounded text-ellipsis ${
                      currentLocation ? "cursor-no-drop text-gray-400" : ""
                    }`}
                    onClick={() => {
                      paths.value = dir.path.split("/");
                    }}>
                    {dir.name} <span class={"ml-4 text-sm"}>{currentLocation ? "当前位置" : ""}</span>
                  </li>
                </Tooltip>
              );
            })}
          </ul>
        ) : (
          <div class={"flex items-center flex-col pt-10 opacity-70"}>
            <p class={"text-gray-400"}>
              {props.mode === "COPY" ? "复制" : "移动"}到 {last(paths.value)} 文件夹
            </p>
          </div>
        )}

        <div class={"flex items-center justify-end"}>
          <Button
            onClick={() => {
              Modal.destroyAll();
            }}>
            取消
          </Button>
          <Button
            loading={loading.value}
            htmlType={"submit"}
            type={"primary"}
            class={"ml-2"}
            onClick={() => {
              const files = props.objects.filter((item) => !item.isDir);
              const dirs = props.objects.filter((item) => item.isDir);
              if (props.mode === "MOVE") {
                Promise.all(
                  [
                    files.length
                      ? moveFiles({
                          path: currentPath.value,
                          body: {
                            targetPath: paths.value.join("/") || "/",
                            file: files.map(({ name }) => name),
                          },
                        })
                      : Promise.resolve(),
                  ].concat(
                    dirs.length
                      ? dirs.map((dir) =>
                          moveDirs({
                            path: dir.path,
                            body: {
                              newPath: joinPath(paths.value.join("/") || "/", dir.name),
                            },
                          }),
                        )
                      : [],
                  ),
                )
                  .finally(() => {
                    loading.value = false;
                  })
                  .then(() => {
                    message.success("移动成功");
                    // 移动后文件会变化，所以刷新一下
                    diskStore.refreshFiles();
                    Modal.destroyAll();
                  });
              } else if (props.mode === "COPY") {
                Promise.all(
                  [
                    files.length
                      ? copyFiles({
                          path: currentPath.value,
                          body: {
                            targetPath: paths.value.join("/") || "/",
                            file: files.map(({ name }) => name),
                          },
                        })
                      : Promise.resolve(),
                  ].concat(
                    dirs.length
                      ? dirs.map((dir) =>
                          copyDirs({
                            path: dir.path,
                            body: {
                              newPath: joinPath(paths.value.join("/") || "/", dir.name),
                            },
                          }),
                        )
                      : [],
                  ),
                )
                  .then(() => {
                    message.success("复制成功");
                    Modal.destroyAll();
                  })
                  .finally(() => {
                    loading.value = false;
                  });
              }
            }}>
            {props.okText}
          </Button>
        </div>
      </div>
    );
  },
});
