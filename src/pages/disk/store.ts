import { defineStore } from "pinia";
import { computed, onUnmounted, ref, watch } from "vue";
import { IServerControllerObjectCtlObject, IRbacRoleType, listObjects, RbacRoleType } from "@src/src-clients/storage";
import { useRequest } from "vue-request";
import { useCurrentAccountStore } from "@src/pages/account";
import { debounce } from "@querycap/lodash";

export const usePathsStore = defineStore("paths", () => {
  const paths = ref<string[]>([]);

  return {
    paths: paths,
    setPaths(newPath: string[]) {
      paths.value = newPath;
    },
  };
});
export const useCurrentPath = () => {
  const paths = usePathsStore();
  return computed(() => (paths.paths?.length ? `/${paths.paths.join("/")}` : "/"));
};

interface IBreadCrumbPath {
  path: string;
  name: string;
  owner?: { accountID: string; name: string };
}

/*
 * 因为权限设计原因，面包屑展示的 path 不一定是真实 path，nane是用来展示的，path是实际请求的，点击面包屑后同步到usePathsStore里
 * */
export const useBreadCrumbPathsStore = defineStore("BreadCrumbPaths", () => {
  const paths = ref<IBreadCrumbPath[]>([{ path: "/", name: "/" }]);

  return {
    paths,
    setPaths(newPaths: IBreadCrumbPath[]) {
      paths.value = newPaths;
    },
  };
});

// 如果传入两个 path，第一个是当前 path，第二个是新 path，如果传入一个 path，就是新 path，拼接一下当前 path
export function joinPath(path: string): string;
export function joinPath(path: string, subPath: string): string;
// 处理 path 拼接容易重复//的问题，路径的拼接最好用这个函数
export function joinPath(path: string, subPath?: string) {
  const user = useCurrentAccountStore();

  if (subPath) {
    let _path = path;
    if (user.account?.isAdmin) {
      _path = path;
    } else if (path === "/" || path === "") {
      // 根目录拼接为当前用户uniqueCode
      _path = `/users/${user.account?.uniqueCode}`;
    }
    return `${_path === "/" ? "" : _path}${subPath?.startsWith("/") ? subPath : `/${subPath}`}`;
  }

  const currentPath = useCurrentPath();

  let _path = currentPath.value;
  if (user.account?.isAdmin) {
    _path = currentPath.value === "/" ? "" : currentPath.value;
  } else if (currentPath.value === "/" || currentPath.value === "") {
    // 根目录拼接为当前用户uniqueCode
    _path = `/users/${user.account?.uniqueCode}`;
  }

  return `${_path}${path?.startsWith("/") ? path : `/${path}`}`;
}

export const useDiskStore = defineStore("disk", () => {
  const size = ref(50);
  const offset = ref(0);
  const total = ref(0);
  const searchName = ref<string>("");
  const searchType = ref<"CURRENT" | "CHILD_DIR">("CURRENT");
  const roleType = ref<IRbacRoleType | undefined>();
  const renamedFile = ref<string>("");
  const currentPath = useCurrentPath();
  const objects = ref<IServerControllerObjectCtlObject[]>([]);
  const checkedMap = ref<Record<string, boolean>>({});
  const sort = ref<{ key: string; order: "asc" | "desc" }>({
    key: "createdAt",
    order: "asc",
  });

  onUnmounted(() => {
    renamedFile.value = "";
  });

  const {
    runAsync: getObjects,
    refresh,
    loading,
  } = useRequest(listObjects, {
    manual: true,
    debounceInterval: 100,
    onSuccess(res) {
      total.value = res.total || 0;
      roleType.value = res.roleType;
      objects.value = objects.value.concat(res.data || []);
      console.log(objects.value.length, "objects.value");
    },
  });

  // 离开的时候删除一下选中的数据
  watch(
    () => currentPath.value,
    () => {
      checkedMap.value = {};
    },
  );

  const getFile = debounce((newOffset: number) => {
    offset.value = newOffset;
    return getObjects({
      path: currentPath.value,
      size: size.value,
      keyword: searchName.value,
      sort: `${sort.value.key}!${sort.value.order}`,
      offset: offset.value,
    });
  }, 200);

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
    offset,
    searchName,
    setSearchName: (newName: string) => {
      searchName.value = newName;
      objects.value = [];
      offset.value = 0;
      getFile(0);
    },

    setCheckedMap,
    goToPath,
    loading,
    sort,
    total,
    checkedMap,
    roleType,
    size,
    searchType,
    renamedFile,
    getFiles: getFile,
    refreshFiles: () =>
      new Promise((resolve) => {
        objects.value = [];
        offset.value = 0;
        objects.value = [];
        total.value = 0;
        refresh();
        resolve("");
      }),
    clearObjects() {
      objects.value = [];
    },
    objects: objects,
  };
});
