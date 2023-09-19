import {
  displayPluginState,
  ILinkUploadWithUser,
  IPluginPluginWithUser,
  listPluginProvider,
} from "@src/src-clients/storage";
import { computed, onMounted } from "vue";
import { toFullTime } from "@src/utils/date";
import { useMembersStore } from "@src/pages/member";
import { Text } from "@src/components/Text";
import { useRequest } from "vue-request";
import { useRouter } from "vue-router";
import { usePathsStore } from "@src/pages/disk/store";

export const useColumns = () => {
  const memberStore = useMembersStore();
  const { data: pluginMap } = useRequest(() => listPluginProvider({}));
  const pathsStore = usePathsStore();
  onMounted(() => {
    memberStore.getMembers();
  });
  const router = useRouter();
  const memberMap = computed<{ [accountID: string]: string }>(
    () => memberStore.members?.data?.reduce((p, c) => ({ ...p, [c.accountID]: c.name }), {}) || {},
  );
  return [
    {
      title: "文件路径",
      key: "path",
      dataKey: "path",
      width: 200,
      cellRenderer({ rowData }: { rowData: IPluginPluginWithUser }) {
        return (
          <Text
            text={rowData.path || "-"}
            class={"text-blue-500 cursor-pointer"}
            onClick={() => {
              pathsStore.setPaths(rowData.path.split("/").slice(1));
              router.push({ name: "disk" });
            }}></Text>
        );
      },
    },
    {
      title: "插件名称",
      key: "name",
      dataKey: "name",
      width: 200,
      cellRenderer({ rowData }: { rowData: IPluginPluginWithUser }) {
        return <span>{pluginMap.value?.plugin?.[rowData.name]?.desc || rowData.name}</span>;
      },
    },
    {
      title: "操作人",
      key: "accountID",
      dataKey: "accountID",
      width: 100,
      cellRenderer({ rowData }: { rowData: ILinkUploadWithUser }) {
        return <span>{memberMap.value?.[rowData.accountID] || "-"}</span>;
      },
    },
    {
      title: "状态",
      key: "state",
      dataKey: "state",
      width: 100,
      cellRenderer({ rowData }: { rowData: IPluginPluginWithUser }) {
        return <span>{displayPluginState(rowData.state)}</span>;
      },
    },

    {
      title: "进度",
      key: "progress",
      dataKey: "progress",
      width: 200,
      cellRenderer({ rowData }: { rowData: IPluginPluginWithUser }) {
        return (
          <div>
            {rowData.progress?.map((item) => (
              <div key={item.name}>
                {rowData.progress?.length > 1 && (
                  <span>{pluginMap.value?.plugin?.[rowData.name]?.desc || rowData.name}:</span>
                )}
                {item.message} {`${(item.progress || 0) * 100}%`}
              </div>
            )) || "-"}
          </div>
        );
      },
    },
    {
      title: "创建时间",
      key: "createdAt",
      dataKey: "createdAt",
      width: 250,
      cellRenderer({ rowData }: { rowData: IPluginPluginWithUser }) {
        return <span>{toFullTime(rowData.createdAt) || "-"}</span>;
      },
    },
  ];
};
