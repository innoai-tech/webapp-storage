import { computed, createVNode, defineComponent, onMounted, ref } from "vue";
import { useRequest } from "vue-request";
import { InputSearch, message, Modal } from "ant-design-vue";
import { UsergroupAddOutlined } from "@ant-design/icons-vue";
import { deleteAdmin, listAdmin, putAdmin } from "@src/src-clients/storage";
import { defineStore } from "pinia";
import { AddAdminModal, useAddAdminStore } from "@src/pages/admin/addAdminModal";
import { useCurrentAccountStore } from "@src/pages/account";
import { Table } from "@src/components/table";
import { useColumns } from "@src/pages/admin/useColumns";
import { AuthButton } from "@src/components/authButton";

export const useAdminStore = defineStore("adminStore", () => {
  const searchUsername = ref("");
  const { data: admins, refresh } = useRequest(() => listAdmin({ size: -1 }), {
    refreshOnWindowFocus: true,
  });
  const { runAsync: putAdminRequest } = useRequest(putAdmin, {
    manual: true,
  });
  const { runAsync: deleteAdminRequest } = useRequest(deleteAdmin, {
    manual: true,
  });

  return {
    admins,
    refresh,
    searchUsername,
    setSearchUsername(newValue: string) {
      searchUsername.value = newValue;
    },
    addAdminRequest(accountID: string) {
      return putAdminRequest({ accountID });
    },
    deleteAdminRequest(accountID: string) {
      return deleteAdminRequest({ accountID });
    },
  };
});

export const Admin = defineComponent({
  setup() {
    const addAdminStore = useAddAdminStore();
    const currentUser = useCurrentAccountStore();
    const adminStore = useAdminStore();

    onMounted(() => {
      adminStore.refresh();
    });

    const data = computed(() =>
      adminStore.admins?.data?.filter(
        (item) => item.name.includes(adminStore.searchUsername) || adminStore.searchUsername.includes(item.name),
      ),
    );

    const columns = useColumns();
    return () => {
      return (
        <div class={"flex flex-1 flex-col h-full"}>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between"}>
              <div class={"flex gap-2"}>
                <AuthButton
                  title={"普通用户无法添加成员"}
                  hasPermission={!currentUser.account?.isAdmin}
                  icon={<UsergroupAddOutlined />}
                  class={"flex items-center"}
                  onClick={() => {
                    Modal.confirm({
                      title: "添加管理员",
                      closable: true,
                      centered: true,
                      content: createVNode(AddAdminModal),
                      icon: null,
                      onOk() {
                        if (!addAdminStore.form.accountID) {
                          message.warn("请选择成员");
                          return Promise.reject();
                        }

                        return adminStore.addAdminRequest(addAdminStore.form.accountID!).then(() => {
                          adminStore.refresh();
                        });
                      },
                    });
                  }}>
                  添加成员
                </AuthButton>
              </div>
              <div>
                <InputSearch
                  // @ts-ignore 禁用 mac 拼写提示
                  spellcheck="false"
                  value={adminStore.searchUsername}
                  onChange={(e) => {
                    adminStore.setSearchUsername(e.target.value as string);
                    // memberPanelStore.setGroupID(groupID as string)
                  }}
                  class={"flex h-full items-center w-40"}
                  placeholder="请输入用户名称搜索"
                />
              </div>
            </div>
          </div>

          <div class={"flex-1"}>
            <Table rowKey={"accountID"} columns={columns} data={data.value || []} />
          </div>
        </div>
      );
    };
  },
});
