import { defineComponent, onMounted, ref } from "vue";
import { TabPane, Tabs } from "ant-design-vue";
import { defineStore } from "pinia";
import { OrgPanel } from "./orgPanel";
import { GroupMemberPanel } from "./groupMemberPanel";

export enum OrgTab {
  GROUP = "GROUP",
  GROUP_MEMBER = "GROUP_MEMBER",
}
export type IOrgTab = keyof typeof OrgTab;

export const displayOrgTable = (tab: IOrgTab) =>
  ({
    [OrgTab.GROUP]: "组织管理",
    [OrgTab.GROUP_MEMBER]: "组织成员管理",
  }[tab]);
export const useOrgStore = defineStore("org", () => {
  const tab = ref<IOrgTab>("GROUP");

  function setTab(newTab: IOrgTab) {
    tab.value = newTab;
  }
  return { tab, setTab };
});
export const Org = defineComponent({
  setup() {
    const tabStore = useOrgStore();
    onMounted(() => {
      tabStore.setTab(OrgTab.GROUP);
    });
    return () => {
      return (
        <div>
          <Tabs
            activeKey={tabStore.tab}
            destroyInactiveTabPane={true}
            onChange={(tab) => {
              tabStore.setTab(tab as IOrgTab);
            }}>
            <TabPane key={OrgTab.GROUP} tab={displayOrgTable(OrgTab.GROUP)}>
              <OrgPanel />
            </TabPane>
            <TabPane key={OrgTab.GROUP_MEMBER} tab={displayOrgTable(OrgTab.GROUP_MEMBER)}>
              <GroupMemberPanel />
            </TabPane>
          </Tabs>
        </div>
      );
    };
  },
});
