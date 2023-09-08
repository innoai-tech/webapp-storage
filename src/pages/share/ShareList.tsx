import { computed, defineComponent, onMounted, ref } from "vue";
import { useRequest } from "vue-request";
import { defineStore } from "pinia";
import { listShareLink } from "@src/src-clients/storage";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/share/useShareColumns";
import { Pagination } from "ant-design-vue";
import { watch } from "vue";

export const useListShareStore = defineStore("listShare", () => {
  const size = ref(10);
  const offset = ref(0);
  const {
    data: shares,
    refresh,
    runAsync,
  } = useRequest(listShareLink, {
    refreshOnWindowFocus: true,
    manual: true,
  });

  watch(
    () => offset.value,
    () => {
      runAsync({ size: size.value, offset: offset.value * size.value });
    },
  );
  return {
    size,
    offset,
    shares,
    refresh,
    getMembers() {
      runAsync({ size: size.value, offset: offset.value * size.value });
    },
    onChangeOffset(newOffset: number) {
      offset.value = newOffset;
    },
  };
});

export const ShareList = defineComponent({
  setup() {
    const shareStore = useListShareStore();

    const data = computed(() => shareStore.shares?.data || []);

    const columns = useColumns();

    onMounted(() => {
      shareStore.getMembers();
    });

    return () => {
      return (
        <div class={"flex flex-1 flex-col h-full"}>
          <Table rowKey={"shareID"} columns={columns} data={data?.value || []} />
          <div class={"mt-4 flex justify-end items-center"}>
            <span class="mr-2">{shareStore.shares?.total}条</span>
            <Pagination
              pageSizeOptions={[100, 500, 1000, 2000, 4000]}
              v-model:pageSize={shareStore.size}
              current={shareStore.offset + 1}
              total={shareStore.shares?.total}
              onChange={(newOffset) => {
                shareStore.onChangeOffset(newOffset - 1);
                console.log(shareStore.offset);
              }}
            />
          </div>
        </div>
      );
    };
  },
});
