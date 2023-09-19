import { defineComponent, onMounted, ref, watch } from "vue";
import { useRequest } from "vue-request";
import { defineStore } from "pinia";
import { listPlugin } from "@src/src-clients/storage";
import { Table } from "@src/components/table";
import { Pagination } from "ant-design-vue";
import { useColumns } from "@src/pages/plugin/usePluginColumn";

export const useListPluginStore = defineStore("listUpload", () => {
  const size = ref(10);
  const offset = ref(0);
  const { data, refresh, runAsync } = useRequest(listPlugin, {
    refreshOnWindowFocus: true,
    manual: true,
  });
  watch(
    () => offset.value,
    () => {
      runAsync({
        size: size.value,
        offset: offset.value * size.value,
      });
    },
  );

  return {
    size,
    offset,
    data,
    refresh,
    onChangeOffset(newOffset: number) {
      offset.value = newOffset;
    },
    getData() {
      return runAsync({ size: size.value, offset: offset.value * size.value });
    },
  };
});

export const PluginLog = defineComponent({
  setup() {
    const pluginStore = useListPluginStore();

    const columns = useColumns();

    onMounted(() => {
      pluginStore.getData();
    });

    return () => {
      return (
        <div class={"flex flex-1 flex-col h-full"}>
          <Table rowKey={"IPluginTaskID"} columns={columns} data={pluginStore.data?.data || []} />
          <div class={"mt-4 flex justify-end items-center"}>
            <span class="mr-2">{pluginStore.data?.total}条</span>
            <Pagination
              pageSizeOptions={[100, 500, 1000, 2000, 4000]}
              v-model:pageSize={pluginStore.size}
              current={pluginStore.offset + 1}
              total={pluginStore.data?.total}
              onChange={(newOffset) => {
                pluginStore.onChangeOffset(newOffset - 1);
              }}
            />
          </div>
        </div>
      );
    };
  },
});
