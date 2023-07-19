import { Ref, computed, createVNode, defineComponent, ref, watch } from "vue";
import { Button, InputSearch, Modal, Space } from "ant-design-vue";
import { ApartmentOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Table } from "@src/components/table";
import { AuthButton } from "@src/components/authButton";
import { CreateClientModal } from "@src/pages/clientManage/CreateClient";
import { useRequest } from "vue-request";
import { IClientGroupClient, deleteGroupClient, listGroupClient } from "@src/src-clients/storage";
import { TextEllipsis } from "@src/components/textEllipsis";
import { SecretContent } from "@src/pages/clientManage/SecretContent";

export const OrgClientModal = defineComponent({
  props: {
    groupID: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const searchClientID = ref("");
    const {
      runAsync,
      refresh,
      data: clients,
    } = useRequest(listGroupClient, {
      manual: true,
    });
    const data = computed(() => ({
      ...clients.value,
      data: clients.value?.data?.filter((item) => item.clientID.includes(searchClientID.value)),
    }));

    watch(
      () => props.groupID,
      () => {
        if (props.groupID) {
          runAsync({ groupID: props.groupID });
        }
      },
      { immediate: true },
    );

    const columns = useColumns(
      computed(() => props.groupID),
      refresh,
    );

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
                    const modal = Modal.confirm({
                      title: "",
                      closable: true,
                      centered: true,
                      content: (
                        <CreateClientModal
                          groupID={props.groupID}
                          onClose={() => {
                            refresh();
                            modal.destroy();
                          }}
                        />
                      ),
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
                  value={searchClientID.value}
                  onChange={(e) => {
                    searchClientID.value = e.target.value as string;
                  }}
                  class={"flex h-full items-center w-40"}
                  placeholder="请输入客户端ID搜索"
                />
              </div>
            </div>
          </div>

          <Table rowKey={"clientID"} columns={columns} data={data.value?.data || []} />
        </div>
      );
    };
  },
});
function useColumns(groupID: Ref<string>, refresh: () => void) {
  const { runAsync: deleteClient } = useRequest(deleteGroupClient, {
    manual: true,
  });
  return [
    {
      title: "客户端ID",
      key: "clientID",
      dataKey: "clientID",
      width: 300,
    },
    {
      title: "客户端描述",
      key: "desc",
      dataKey: "desc",
      width: 200,
    },
    {
      title: "白名单地址",
      key: "whiteList",
      dataKey: "whiteList",
      width: 200,
      cellRenderer({ rowData }: { rowData: IClientGroupClient }) {
        if (!rowData.whiteList?.length) return null;
        return <TextEllipsis>{rowData.whiteList.join("、")}</TextEllipsis>;
      },
    },

    {
      title: "操作",
      key: "clientID",
      dataKey: "clientID",
      width: 200,
      cellRenderer({ rowData }: { rowData: IClientGroupClient }) {
        return (
          <Space>
            <Button
              type={"link"}
              onClick={() => {
                const modal = Modal.confirm({
                  title: "刷新密钥",
                  closable: true,
                  centered: true,
                  content: createVNode(
                    <SecretContent
                      groupID={groupID.value}
                      onClose={() => {
                        refresh();
                        modal.destroy();
                      }}
                      clientID={rowData.clientID}
                    />,
                  ),
                  icon: createVNode(ExclamationCircleOutlined),
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              刷新密钥
            </Button>
            <Button
              type={"link"}
              onClick={() => {
                const modal = Modal.confirm({
                  title: "编辑客户端",
                  closable: true,
                  centered: true,
                  content: createVNode(
                    <CreateClientModal
                      groupID={groupID.value}
                      client={rowData}
                      onClose={() => {
                        refresh();
                        modal.destroy();
                      }}
                    />,
                  ),
                  icon: null,
                  cancelButtonProps: { style: { display: "none" } } as any,
                  okButtonProps: { style: { display: "none" } } as any,
                  wrapClassName: "confirmModal",
                });
              }}>
              编辑
            </Button>
            <Button
              type={"link"}
              danger
              onClick={() => {
                Modal.confirm({
                  title: "删除客户端",
                  centered: true,
                  closable: true,
                  content: "是否确定删除该客户端？",
                  icon: createVNode(ExclamationCircleOutlined),
                  onOk() {
                    return deleteClient({ clientID: rowData.clientID, groupID: groupID.value }).then(() => {
                      refresh();
                    });
                  },
                  okText: "确定",
                  cancelText: "取消",
                });
              }}>
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
}
