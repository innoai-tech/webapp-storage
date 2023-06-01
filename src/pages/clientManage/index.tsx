import { computed, createVNode, defineComponent, onMounted, ref } from "vue";
import { useRequest } from "vue-request";
import { InputSearch, Modal } from "ant-design-vue";
import { ApartmentOutlined } from "@ant-design/icons-vue";
import {
  createAccountClient,
  deleteAccountClient,
  listAccountClient,
  putAccountClient,
} from "@src/src-clients/storage";
import { defineStore } from "pinia";
import { Table } from "@src/components/table";
import { AuthButton } from "@src/components/authButton";
import { useColumns } from "@src/pages/clientManage/useColumns";
import { CreateClientModal } from "@src/pages/clientManage/CreateClient";

export const useClientsStore = defineStore("adminStore", () => {
  const searchClientID = ref("");
  const {
    data: clients,
    refresh,
    runAsync: getClients,
  } = useRequest(() => listAccountClient({ size: -1 }), {
    refreshOnWindowFocus: true,
  });

  const { runAsync: updateClientRequest } = useRequest(putAccountClient, {
    manual: true,
  });
  const { runAsync: createClientRequest } = useRequest(createAccountClient, {
    manual: true,
  });
  const { runAsync: deletePutRequest } = useRequest(deleteAccountClient, {
    manual: true,
  });

  return {
    clients,
    refresh,
    runAsync: getClients,
    searchClientID,
    setsearchClientID(newValue: string) {
      searchClientID.value = newValue;
    },
    updateClientRequest,
    createClientRequest(
      clientID: string,
      {
        desc,
        whiteList,
      }: {
        desc: string;
        permissions: string[];
        whiteList: string[];
      },
    ) {
      return createClientRequest({
        clientID,
        body: {
          desc: desc,
          whiteList: whiteList,
        },
      });
    },
    deleteClientRequest(clientID: string) {
      return deletePutRequest({ clientID });
    },
  };
});

export const ClientManage = defineComponent({
  setup() {
    const clientsStore = useClientsStore();

    onMounted(() => {
      clientsStore.refresh();
    });

    const data = computed(() =>
      clientsStore.clients?.data?.filter(
        (item) => !clientsStore.searchClientID || item.clientID?.includes(clientsStore.searchClientID),
      ),
    );

    const columns = useColumns();
    return () => {
      return (
        <div class={"flex-1  flex flex-col"}>
          <div class={"flex justify-end sticky top-0 bg-white mb-4"}>
            <div class={"flex flex-1 justify-between"}>
              <div class={"flex gap-2"}>
                <AuthButton
                  icon={<ApartmentOutlined />}
                  class={"flex items-center"}
                  onClick={() => {
                    Modal.confirm({
                      title: "",
                      closable: true,
                      centered: true,
                      content: createVNode(CreateClientModal),
                      icon: null,
                      cancelButtonProps: { style: { display: "none" } } as any,
                      okButtonProps: { style: { display: "none" } } as any,
                      wrapClassName: "confirmModal",
                    });
                  }}>
                  添加凭证
                </AuthButton>
              </div>
              <div>
                <InputSearch
                  // @ts-ignore 禁用 mac 拼写提示
                  spellcheck="false"
                  value={clientsStore.searchClientID}
                  onChange={(e) => {
                    clientsStore.setsearchClientID(e.target.value as string);
                  }}
                  class={"flex h-full items-center w-40"}
                  placeholder="请输入客户端ID搜索"
                />
              </div>
            </div>
          </div>

          <Table rowKey={"clientID"} columns={columns} data={data.value || []} />
        </div>
      );
    };
  },
});
