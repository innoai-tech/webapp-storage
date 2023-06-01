import { computed, defineComponent, onMounted, ref } from "vue";
import { useRequest } from "vue-request";
import { defineStore } from "pinia";
import { listShare } from "@src/src-clients/storage";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/share/useColumns";

export const useListShareStore = defineStore("listShare", () => {
  const {
    data: shares,
    refresh,
    runAsync,
  } = useRequest(() => listShare({ size: -1 }), {
    refreshOnWindowFocus: true,
    manual: true,
  });
  return {
    shares,
    refresh,
    getMembers: runAsync,
  };
});

export const Share = defineComponent({
  setup() {
    const shareStore = useListShareStore();

    const data = computed(() => shareStore.shares?.data || []);

    const columns = useColumns();

    onMounted(() => {
      shareStore.getMembers();
    });

    return () => {
      return (
        <div class={"flex flex-1 flex-col"}>
          <Table rowKey={"accountID"} columns={columns} data={data?.value || []} />
        </div>
      );
    };
  },
});
