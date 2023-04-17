import { defineComponent, onMounted, ref, watch } from "vue";
import { useCurrentPath, useDiskStore, usePathsStore } from "@src/pages/disk/store";
import { useColumns } from "@src/pages/disk/useColumns";
import { DiskMenus } from "@src/pages/disk/Menus";
import { Breadcrumb, BreadcrumbItem } from "ant-design-vue";
import { Table } from "@src/components/table";

export const replacePathName = (path = "") => {
  if (path === "/" || path === "") return "全部文件";

  return path.replace(new RegExp("^/"), "");
};

export const Disk = defineComponent({
  setup() {
    const store = useDiskStore();
    const domRef = ref<HTMLDivElement | null>(null);
    const pathsStore = usePathsStore();
    const currentPath = useCurrentPath();

    const columns = useColumns();
    onMounted(() => {
      watch(
        () => currentPath.value,
        () => {
          store.getFiles();
        },
        { immediate: true },
      );
    });

    return () => {
      return (
        <div class={"w-full h-full flex flex-col"} ref={domRef}>
          <div class={"flex-shrink-0 mb-2 w-full"}>
            <Breadcrumb class={"mb-2"}>
              {/*兼容性*/}
              {["/"].concat(pathsStore.paths).map((path, index) => {
                return (
                  <BreadcrumbItem key={`${path}_${index}`}>
                    <a
                      href={"javascript:;"}
                      onClick={() => {
                        // 因为拼接了一个 ['/']，所以 index 比实际索引大 1，这里就不需要+1 了
                        pathsStore.setPaths(pathsStore.paths.slice(0, index));
                      }}>
                      {replacePathName(path)}
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
