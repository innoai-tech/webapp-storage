import { createVNode, defineComponent, onMounted, PropType, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal, Space, Tooltip } from "ant-design-vue";
import { useClientsStore } from "@src/pages/clientManage/index";
import { v4 as uuid } from "uuid";
import { ExclamationCircleOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { IClient } from "@src/src-clients/storage";
import { SecretContent } from "@src/pages/clientManage/SecretContent";
interface IFormState {
  clientID: string;
  desc: string;
  permissions: { permission: string; id: string }[];
  whiteList: { ip: string; id: string }[];
}

export const CreateClientModal = defineComponent({
  props: {
    // 有传入就是更新
    client: {
      type: Object as PropType<IClient>,
      required: false,
    },
  },
  setup(props) {
    const clientSecret = ref("");
    const clientID = ref("");
    const formState = ref<IFormState>({
      clientID: "",
      desc: "",
      permissions: [{ id: uuid(), permission: "" }],
      whiteList: [{ id: uuid(), ip: "" }],
    });
    const loading = ref(false);
    const clientsStore = useClientsStore();

    onMounted(() => {
      if (props.client) {
        formState.value.clientID = props.client.clientID;
        formState.value.permissions =
          props.client.permissions?.map((permission) => ({
            permission,
            id: uuid(),
          })) || formState.value.permissions;
        formState.value.desc = props.client.desc;
        formState.value.whiteList =
          props.client.whiteList?.map((ip) => ({
            ip,
            id: uuid(),
          })) || formState.value.whiteList;
      }
    });

    return () => {
      if (clientID.value && clientSecret.value) {
        return <SecretContent clientID={clientID.value} secret={clientSecret.value} />;
      }
      return (
        <div>
          <Form
            layout={"vertical"}
            model={formState.value}
            onFinish={() => {
              if (!formState.value) return message.warn("请输入 Client ID");

              (props.client
                ? clientsStore
                    .updateClientRequest({
                      clientID: props.client.clientID,
                      body: {
                        desc: formState.value.desc,
                        permissions: formState.value.permissions.map((item) => item.permission).filter((item) => item),
                        whiteList: formState.value.whiteList.map((item) => item.ip).filter((item) => item),
                      },
                    })
                    .then(() => {
                      message.success("编辑成功");
                    })
                : clientsStore
                    .createClientRequest(formState.value.clientID, {
                      desc: formState.value.desc,
                      permissions: formState.value.permissions.map((item) => item.permission).filter((item) => item),
                      whiteList: formState.value.whiteList.map((item) => item.ip).filter((item) => item),
                    })
                    .then((res) => {
                      clientSecret.value = res.clientSecret;
                      clientID.value = res.clientID;
                      message.success("创建成功");
                    })
              )
                .finally(() => {
                  loading.value = false;
                })
                .then(() => {
                  Modal.destroyAll();
                  clientsStore.refresh();
                });
            }}>
            <Tooltip title={props.client ? "无法修改Client ID" : ""}>
              <FormItem
                required
                label={"客户端 ID"}
                name={"clientID"}
                rules={[
                  {
                    required: true,
                    validator(_, val) {
                      if (!val) return Promise.reject("请输入Client ID");
                      if (!new RegExp(/^[\da-zA-Z]+$/).test(val)) {
                        return Promise.reject("数字和字母，不允许输入符号、中文");
                      }
                      return Promise.resolve();
                    },
                    trigger: "change",
                  },
                ]}>
                <Input
                  disabled={loading.value || !!props.client}
                  placeholder={"请输入Client ID"}
                  v-model:value={formState.value.clientID}
                />
              </FormItem>
            </Tooltip>

            <FormItem
              required
              label={"描述信息"}
              name={"desc"}
              rules={[{ required: true, message: "请输入描述信息", trigger: "change" }]}>
              <Input.TextArea
                disabled={loading.value}
                v-model:value={formState.value.desc}
                placeholder={"请输入描述信息"}></Input.TextArea>
            </FormItem>

            {formState.value.whiteList.map((item, index) => {
              return (
                <Space key={item.id} align="baseline" class={"flex w-full"}>
                  <FormItem
                    labelCol={{ span: 4 }}
                    name={["whiteList", index]}
                    required={true}
                    rules={[
                      {
                        required: true,
                        validator(_, item) {
                          const val = item.ip;
                          if (!val) return Promise.reject("请输入 IP");
                          if (!new RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/).test(val?.trim())) {
                            return Promise.reject("只允许IPV4地址，比如192.168.1.1");
                          }
                          return Promise.resolve();
                        },
                        trigger: "change",
                      },
                    ]}>
                    <Input disabled={loading.value} placeholder={"请输入白名单 IP"} v-model:value={item.ip} />
                  </FormItem>
                  <Tooltip title={"删除此项"}>
                    <MinusCircleOutlined
                      onClick={() => {
                        if (loading.value) return;
                        formState.value.whiteList = formState.value.whiteList.filter(
                          (whiteItem) => whiteItem.id !== item.id,
                        );
                      }}
                    />
                  </Tooltip>
                </Space>
              );
            })}
            <FormItem>
              <Button
                type="dashed"
                block
                disabled={loading.value}
                onClick={() => {
                  formState.value.whiteList.push({ id: uuid(), ip: "" });
                }}>
                <PlusOutlined />
                添加 IP
              </Button>
            </FormItem>

            {formState.value.permissions.map((item, index) => {
              return (
                <Space key={item.id} align="baseline" class={"flex w-full"}>
                  <FormItem labelCol={{ span: 4 }} name={["permissions", index]}>
                    <Input disabled={loading.value} placeholder={"请输入权限范围"} v-model:value={item.permission} />
                  </FormItem>
                  <Tooltip title={"删除此项"}>
                    <MinusCircleOutlined
                      onClick={() => {
                        if (loading.value) return;
                        formState.value.permissions = formState.value.permissions.filter(
                          (whiteItem) => whiteItem.id !== item.id,
                        );
                      }}
                    />
                  </Tooltip>
                </Space>
              );
            })}

            <FormItem>
              <Button
                type="dashed"
                block
                disabled={loading.value}
                onClick={() => {
                  formState.value.permissions.push({ id: uuid(), permission: "" });
                }}>
                <PlusOutlined />
                添加权限范围
              </Button>
            </FormItem>

            <div class={"flex items-center justify-end"}>
              <Button
                disabled={loading.value}
                onClick={() => {
                  Modal.destroyAll();
                }}>
                取消
              </Button>
              <Button
                disabled={loading.value}
                loading={loading.value}
                htmlType={"submit"}
                type={"primary"}
                class={"ml-2"}>
                保存
              </Button>
            </div>
          </Form>
        </div>
      );
    };
  },
});
