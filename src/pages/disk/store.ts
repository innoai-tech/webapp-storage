import { defineStore } from "pinia";
import { computed, onUnmounted, ref, unref, watch } from "vue";
import { IObjectObjectInfo, IRbacRoleType, listObjects } from "@src/src-clients/storage";
import { useRequest } from "vue-request";
import { isEqual } from "lodash-es";

export const usePathsStore = defineStore(
  "paths",
  () => {
    const paths = ref<string[]>([]);

    return {
      paths: paths,
      setPaths(newPath: string[]) {
        paths.value = newPath;
      },
    };
  },
  { persist: { enabled: true } },
);
export const useCurrentPath = () => {
  const paths = usePathsStore();
  return computed(() => (paths.paths?.length ? `/${paths.paths.join("/")}` : "/"));
};

export function joinPath(path: string): string;
export function joinPath(path: string, subPath: string): string;
export function joinPath(path: string, subPath?: string) {
  if (subPath) {
    return `${path === "/" ? "" : path}${subPath?.startsWith("/") ? subPath : `/${subPath}`}`;
  }
  const currentPath = useCurrentPath();
  return `${currentPath.value === "/" ? "" : currentPath.value}${path?.startsWith("/") ? path : `/${path}`}`;
}

export const useDiskStore = defineStore("disk", () => {
  const searchName = ref<string>("");
  const roleType = ref<IRbacRoleType | undefined>();
  const renamedFile = ref<string>("");
  const currentPath = useCurrentPath();
  const objects = ref<IObjectObjectInfo[]>([]);
  const checkedMap = ref<Record<string, boolean>>({});

  // 过滤掉搜索项
  const objectsFilter = computed(
    () =>
      objects.value?.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchName.value?.toLowerCase()) ||
          searchName.value?.toLowerCase().includes(item.name?.toLowerCase()),
      ) || [],
  );
  onUnmounted(() => {
    renamedFile.value = "";
  });

  const { runAsync: getObjects, loading } = useRequest(listObjects, {
    manual: true,
    debounceInterval: 100,
    pollingInterval: 5000,
    onSuccess(res) {
      if (!isEqual(objects.value, res.data)) {
        objects.value = res.data || [];
      }
      if (roleType.value !== res.roleType) {
        roleType.value = res.roleType;
      }
    },
  });

  // 离开的时候删除一下选中的数据
  watch(
    () => currentPath.value,
    () => {
      checkedMap.value = {};
    },
  );

  // 测试代码，遍历获取文件夹下所有文件
  // onMounted(async () => {
  //   let count = 0;
  //   const onFetch = async (path: string) => {
  //     await listObjects({ path }).then((res) => {
  //       if (!res.data?.length) return;
  //       count += res.data.filter((item) => !item.isDir).length || 0;
  //       console.log(count);
  //       res.data
  //         .filter((item) => item.isDir)
  //         .forEach(async (item) => {
  //           await onFetch(item.path);
  //         });
  //     });
  //   };
  //   await onFetch("/新川");
  // });

  function getFile() {
    return getObjects({ path: currentPath.value });
  }

  function goToPath(path: string) {
    // 把根目录的 "" 替换为 "/"
    return path.split("/").filter((path) => {
      return !!path;
    });
  }

  function setCheckedMap(newCheckedMap?: Record<string, boolean>) {
    checkedMap.value = newCheckedMap || {};
  }

  return {
    searchName,
    setCheckedMap,
    goToPath,
    loading,
    checkedMap,
    roleType,
    renamedFile,
    getFiles: getFile,
    refreshFiles: getFile,
    objects: objectsFilter,
  };
});
