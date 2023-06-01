import { defineComponent, onMounted, ref, watch } from "vue";
import { useRequest } from "vue-request";
import { listOperation } from "@src/src-clients/storage";
import { Pagination, Select } from "ant-design-vue";
import { useMembersStore } from "@src/pages/member";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/taskLog/useColumns";

export const TaskLog = defineComponent({
  setup() {
    const membersStore = useMembersStore();
    const searchAccountID = ref<string | undefined>(undefined);
    const offset = ref(0);
    const size = ref(2000);
    const { data: taskLogs, refresh } = useRequest(
      () =>
        listOperation({
          size: size.value,
          offset: offset.value * size.value,
          accountID: searchAccountID.value,
        }),
      {
        refreshDeps: [searchAccountID, offset, size],
      },
    );
    onMounted(() => {
      refresh();

      // size 改变也刷新一下
      watch(
        () => size.value,
        () => {
          refresh();
        },
      );
    });

    const columns = useColumns();
    return () => {
      return (
        <>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-end flex-shrink-0"}>
              <Select
                allowClear
                options={membersStore.members?.data?.map((member) => ({
                  label: member.name,
                  value: member.accountID,
                }))}
                v-model:value={searchAccountID.value}
                class={"flex h-full items-center w-40"}
                placeholder="根据操作成员搜索"
                onChange={() => {
                  offset.value = 0;
                }}
              />
            </div>
          </div>

          <div class={"flex-1 flex flex-col"}>
            <Table rowKey={"operationID"} columns={columns} data={taskLogs.value?.data || []} />
            <div class={"mt-4 flex justify-end items-center"}>
              <span class="mr-2">{taskLogs.value?.total}条</span>
              <Pagination
                pageSizeOptions={[100, 500, 1000, 2000, 4000]}
                v-model:pageSize={size.value}
                current={offset.value + 1}
                total={taskLogs.value?.total}
                onChange={(newOffset) => {
                  offset.value = newOffset - 1;
                }}
              />
            </div>
          </div>
        </>
      );
    };
  },
});
