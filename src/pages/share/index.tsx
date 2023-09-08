import { defineComponent, ref } from "vue";
import { TabPane, Tabs } from "ant-design-vue";
import { ShareList } from "@src/pages/share/ShareList";
import { UploadList } from "@src/pages/share/UploadList";

export const Share = defineComponent({
  setup() {
    const currentTable = ref<"SHARE" | "UPLOAD">("SHARE");

    return () => {
      return (
        <div class={"flex flex-1 flex-col h-full"}>
          <Tabs
            class={"flex flex-1 flex-col"}
            activeKey={currentTable.value}
            destroyInactiveTabPane={true}
            onChange={(tab) => {
              currentTable.value = tab as any;
            }}>
            <TabPane key={"SHARE"} tab={"分享链接"}>
              <ShareList />
            </TabPane>
            <TabPane key={"UPLOAD"} tab={"上传链接"}>
              <UploadList />
            </TabPane>
          </Tabs>
        </div>
      );
    };
  },
});
