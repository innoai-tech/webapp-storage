import { defineComponent, onMounted, PropType, ref } from "vue";
import { Button, Form, FormItem, Input, message, Space, Tooltip } from "ant-design-vue";
import { useClientsStore } from "@src/pages/clientManage/index";
import { v4 as uuid } from "uuid";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { SecretContent } from "@src/pages/clientManage/SecretContent";
import { createGroupClient, IClientAccountClient, putGroupClient } from "@src/src-clients/storage";
import { useRequest } from "vue-request";
interface IFormState {
  clientID: string;
  desc: string;
  // permissions: { permission: string; id: string }[];
  whiteList: { ip: string; id: string }[];
}

export const CreateClientModal = defineComponent({
  props: {
    // 传入是更新和创建组织的
    groupID: {
      type: String,
      required: false,
    },
    // 有传入就是更新
    client: {
      type: Object as PropType<Omit<IClientAccountClient, "accountID">>,
      required: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const clientSecret = ref("");
    const clientID = ref("");
    const formState = ref<IFormState>({
      clientID: "",
      desc: "",
      // permissions: [{ id: uuid(), permission: "" }],
      whiteList: [{ id: uuid(), ip: "" }],
    });
    const loading = ref(false);
    const clientsStore = useClientsStore();

    onMounted(() => {
      if (props.client) {
        formState.value.clientID = props.client.clientID;
        formState.value.desc = props.client.desc;
        formState.value.whiteList =
          props.client.whiteList?.map((ip) => ({
            ip,
            id: uuid(),
          })) || formState.value.whiteList;
      }
    });

    const { runAsync: groupClientCreate } = useRequest(createGroupClient, {
      manual: true,
    });
    const { runAsync: groupClientPut } = useRequest(putGroupClient, {
      manual: true,
    });

    return () => {
      if (clientID.value && clientSecret.value) {
        return (
          <SecretContent
            clientID={clientID.value}
            secret={clientSecret.value}
            onClose={() => {
              emit("close");
            }}
          />
        );
      }
      return (
        <div>
          <Form
            layout={"vertical"}
            model={formState.value}
            onFinish={() => {
              if (!formState.value) return message.warn("请输入 Client ID");

              // 如果是编辑群组
              if (props.groupID) {
                if (props.client) {
                  groupClientPut({
                    groupID: props.groupID,
                    clientID: props.client.clientID,
                    body: {
                      desc: formState.value.desc,
                      // permissions: formState.value.permissions.map((item) => item.permission).filter((item) => item),
                      whiteList: formState.value.whiteList.map((item) => item.ip).filter((item) => item),
                    },
                  }).then(() => {
                    message.success("编辑成功");
                    emit("close");
                  });
                } else {
                  groupClientCreate({
                    groupID: props.groupID,
                    clientID: formState.value.clientID,
                    body: {
                      desc: formState.value.desc,
                      whiteList: formState.value.whiteList.map((item) => item.ip).filter((item) => item),
                    },
                  }).then((res) => {
                    clientSecret.value = res.clientSecret;
                    clientID.value = res.clientID;
                    message.success("创建成功");
                  });
                }
                return;
              }
              (props.client
                ? clientsStore
                    .updateClientRequest({
                      clientID: props.client.clientID,
                      body: {
                        desc: formState.value.desc,
                        // permissions: formState.value.permissions.map((item) => item.permission).filter((item) => item),
                        whiteList: formState.value.whiteList.map((item) => item.ip).filter((item) => item),
                      },
                    })
                    .then(() => {
                      clientsStore.refresh();
                      message.success("编辑成功");
                      emit("close");
                    })
                : clientsStore
                    .createClientRequest(formState.value.clientID, {
                      desc: formState.value.desc,
                      permissions: [],
                      // permissions: formState.value.permissions.map((item) => item.permission).filter((item) => item),
                      whiteList: formState.value.whiteList.map((item) => item.ip).filter((item) => item),
                    })
                    .then((res) => {
                      clientsStore.refresh();
                      clientSecret.value = res.clientSecret;
                      clientID.value = res.clientID;

                      message.success("创建成功");
                    })
              ).finally(() => {
                loading.value = false;
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
                  // @ts-ignore 禁用 mac 拼写提示
                  spellcheck="false"
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
                // @ts-ignore 禁用 mac 拼写提示
                spellcheck="false"
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
                    <Input
                      // @ts-ignore 禁用 mac 拼写提示
                      spellcheck="false"
                      disabled={loading.value}
                      placeholder={"请输入白名单 IP"}
                      v-model:value={item.ip}
                    />
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

            {/*{formState.value.permissions.map((item, index) => {*/}
            {/*  return (*/}
            {/*    <Space key={item.id} align="baseline" class={"flex w-full"}>*/}
            {/*      <FormItem labelCol={{ span: 4 }} name={["permissions", index]}>*/}
            {/*        <Input disabled={loading.value} placeholder={"请输入权限范围"} v-model:value={item.permission} />*/}
            {/*      </FormItem>*/}
            {/*      <Tooltip title={"删除此项"}>*/}
            {/*        <MinusCircleOutlined*/}
            {/*          onClick={() => {*/}
            {/*            if (loading.value) return;*/}
            {/*            formState.value.permissions = formState.value.permissions.filter(*/}
            {/*              (whiteItem) => whiteItem.id !== item.id,*/}
            {/*            );*/}
            {/*          }}*/}
            {/*        />*/}
            {/*      </Tooltip>*/}
            {/*    </Space>*/}
            {/*  );*/}
            {/*})}*/}

            {/*<FormItem>*/}
            {/*  <Button*/}
            {/*    type="dashed"*/}
            {/*    block*/}
            {/*    disabled={loading.value}*/}
            {/*    onClick={() => {*/}
            {/*      formState.value.permissions.push({ id: uuid(), permission: "" });*/}
            {/*    }}>*/}
            {/*    <PlusOutlined />*/}
            {/*    添加权限范围*/}
            {/*  </Button>*/}
            {/*</FormItem>*/}

            <div class={"flex items-center justify-end"}>
              <Button
                disabled={loading.value}
                onClick={() => {
                  emit("close");
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
