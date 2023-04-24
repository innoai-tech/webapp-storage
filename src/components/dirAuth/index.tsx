import { computed, defineComponent, PropType, ref, watch } from "vue";
import { TabPane, Tabs } from "ant-design-vue";
import { defineStore } from "pinia";
import { GroupAuthPanel } from "./GroupAuthPanel";
import { AuthGroupMemberPanel } from "@src/components/dirAuth/MemberAuthPanel";
import { IGroup, IRbacRoleType, listDirGroupRole } from "@src/src-clients/storage";
import { useRequest } from "vue-request";
import { useRoute } from "vue-router";

enum Tab {
  GROUP = "GROUP",
  MEMBER = "MEMBER",
}
type ITab = keyof typeof Tab;
const displayTab = (key: ITab) =>
  ({
    GROUP: "组织权限管理",
    MEMBER: "用户权限管理",
  }[key]);

export interface IGroupAuthGroup extends IGroup {
  roleType: IRbacRoleType;
}
export const useDirAuthStore = defineStore("dirAuth", () => {
  const tab = ref<"GROUP" | "MEMBER">("GROUP");
  const route = useRoute();
  const currentDir = ref<{
    path: string;
    name: string;
  } | null>(null);

  const ready = computed(() => !!currentDir.value?.path);

  const { data: dirRoles, refresh: refreshDirRoles } = useRequest(
    () => listDirGroupRole({ path: currentDir.value!.path }),
    {
      ready: ready,
      refreshDeps: [tab],
    },
  );

  const currentDirGroupRoleMap = computed(() => {
    return (
      dirRoles.value?.data?.reduce(
        (p, c) => ({
          ...p,
          [c.groupID]: {
            roleType: c.roles.find((item) => item.path === currentDir.value?.path)?.roleType,
          },
        }),
        {} as IGroupAuthGroup,
      ) || ({} as IGroupAuthGroup)
    );
  });

  watch(
    () => route?.name,
    () => {
      refreshDirRoles();
    },
  );

  return {
    tab,
    currentDirGroupRoleMap,
    currentDir,
    refreshDirRoles,
    setTab(newTab: ITab) {
      tab.value = newTab;
    },
  };
});

export const DirAuthModal = defineComponent({
  props: {
    dir: {
      type: Object as PropType<{ name: string; path: string }>,
      required: true,
    },
  },
  setup(props) {
    const tabStore = useDirAuthStore();

    watch(
      () => props.dir,
      () => {
        tabStore.currentDir = props.dir;
      },
      {
        immediate: true,
      },
    );

    return () => {
      return (
        <div>
          <h4 class={"break-words"}>权限管理文件夹：{tabStore.currentDir?.name || "全部文件"}</h4>
          <Tabs
            activeKey={tabStore.tab}
            destroyInactiveTabPane={true}
            onChange={(tab) => {
              tabStore.setTab(tab as ITab);
            }}>
            <TabPane key={Tab.GROUP} tab={displayTab(Tab.GROUP)}>
              <GroupAuthPanel />
            </TabPane>

            <TabPane key={Tab.MEMBER} tab={displayTab(Tab.MEMBER)}>
              <AuthGroupMemberPanel />
            </TabPane>
          </Tabs>
        </div>
      );
    };
  },
});
