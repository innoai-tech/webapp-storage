import { computed, defineComponent, onMounted, ref } from "vue";
import { useRequest } from "vue-request";
import { InputSearch } from "ant-design-vue";
import { defineStore } from "pinia";
import { listAccount } from "@src/src-clients/storage";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/member/useColumns";

export const useMembersStore = defineStore("members", () => {
  const {
    data: members,
    refresh,
    run,
  } = useRequest(() => listAccount({ size: -1 }), {
    refreshOnWindowFocus: true,
    manual: true,
  });
  return {
    members,
    refresh,
    getMembers: run,
  };
});

export const Member = defineComponent({
  setup() {
    const searchUsername = ref("");
    const membersStore = useMembersStore();

    onMounted(() => {
      membersStore.refresh();
    });

    const data = computed(() =>
      membersStore.members?.data?.filter(
        (item) => item.name.includes(searchUsername.value) || searchUsername.value.includes(item.name),
      ),
    );

    const columns = useColumns();

    onMounted(() => {
      membersStore.getMembers();
    });

    return () => {
      return (
        <div>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between"}>
              <div class={"flex gap-2"}></div>
              <div>
                <InputSearch
                  v-model:value={searchUsername.value}
                  class={"flex h-full items-center w-40"}
                  placeholder="请输入用户名称搜索"
                />
              </div>
            </div>
          </div>

          <Table rowKey={"accountID"} columns={columns} data={data?.value || []} />
        </div>
      );
    };
  },
});
