import { defineStore } from "pinia";
import { computed, onUnmounted, ref, watch } from "vue";
import { IObject, IObjectDirOwner, IRbacRoleType, listObjects, RbacRoleType } from "@src/src-clients/storage";
import { useRequest } from "vue-request";
import { isEqual } from "lodash-es";
import { useCurrentAccountStore } from "@src/pages/account";

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
  relativePath: string;
  owner?: IObjectDirOwner;
}

/*
 * 因为权限设计原因，面包屑展示的 path 不一定是真实 path，relativePath是用来展示的，path是实际请求的，点击面包屑后同步到usePathsStore里
 * */
export const useBreadCrumbPathsStore = defineStore("BreadCrumbPaths", () => {
  const paths = ref<IBreadCrumbPath[]>([{ path: "/", relativePath: "/" }]);

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
  const searchName = ref<string>("");
  const roleType = ref<IRbacRoleType | undefined>();
  const renamedFile = ref<string>("");
  const currentPath = useCurrentPath();
  const objects = ref<IObject[]>([]);
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
    onSuccess(res) {
      if (!isEqual(objects.value, res.data)) {
        objects.value = res.data || [];
      }

      roleType.value = res.roleType || RbacRoleType.GUEST;
    },
  });

  // 离开的时候删除一下选中的数据
  watch(
    () => currentPath.value,
    () => {
      checkedMap.value = {};
    },
  );

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
    setSearchName(newName: string) {
      searchName.value = newName;
    },
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
