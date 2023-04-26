import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useBreadCrumbPathsStore, useCurrentPath, useDiskStore, usePathsStore } from "@src/pages/disk/store";
import { useColumns } from "@src/pages/disk/useColumns";
import { DiskMenus } from "@src/pages/disk/Menus";
import { Breadcrumb, BreadcrumbItem, Tooltip } from "ant-design-vue";
import { Table } from "@src/components/table";
import { useCurrentAccountStore } from "@src/pages/account";
import { IconSharedDir } from "@src/pages/disk/Icon";

export const replacePathName = (path = "") => {
  if (path === "/" || path === "") return "全部文件";

  return path.replace(new RegExp("^/"), "");
};

export const Disk = defineComponent({
  setup() {
    const currentUser = useCurrentAccountStore();
    const store = useDiskStore();
    const domRef = ref<HTMLDivElement | null>(null);
    const pathsStore = usePathsStore();
    const currentPath = useCurrentPath();

    const columns = useColumns();
    onMounted(() => {
      let timer: number | null = null;
      watch(
        () => currentPath.value,
        () => {
          store.getFiles();
        },
        { immediate: true },
      );

      timer = window.setInterval(() => {
        store.getFiles();
      }, 5000);

      onUnmounted(() => {
        if (timer) window.clearInterval(timer);
      });
    });
    const breadCrumbPathsStore = useBreadCrumbPathsStore();

    watch(
      () => store.objects,
      () => {
        console.log(store.objects, "store.objects");
      },
    );
    return () => {
      return (
        <div class={"w-full h-full flex flex-col"} ref={domRef}>
          <div class={"flex-shrink-0 mb-2 w-full"}>
            <Breadcrumb class={"mb-2"}>
              {/*兼容性*/}
              {breadCrumbPathsStore.paths.map(({ path, owner, relativePath }, index) => {
                return (
                  <BreadcrumbItem key={`${path}_${index}`}>
                    <a
                      href={"javascript:;"}
                      class={currentPath.value === path ? "cursor-default" : ""}
                      onClick={() => {
                        // 当前目录不操作
                        if (currentPath.value === path) return;

                        breadCrumbPathsStore.setPaths(breadCrumbPathsStore.paths.slice(0, index + 1));

                        const paths = path === "/" ? [] : path.split("/").filter((path) => path);
                        pathsStore.setPaths(paths);
                      }}>
                      <Tooltip
                        title={
                          currentPath.value === path ? "当前目录" : owner && owner.name ? `共享自${owner.name}` : ""
                        }>
                        <span class={""}>
                          {owner && owner.accountID !== currentUser.account?.accountID ? (
                            <IconSharedDir class={"align-middle mr-1"} />
                          ) : null}
                          {replacePathName(relativePath)}
                        </span>
                      </Tooltip>
                    </a>
                  </BreadcrumbItem>
                );
              })}
            </Breadcrumb>
          </div>

          <DiskMenus />

          <Table rowKey={"path"} data={store.objects} columns={columns}></Table>
        </div>
      );
    };
  },
});
