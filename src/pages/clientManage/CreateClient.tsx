import { defineComponent, onMounted, PropType, ref } from "vue";
import { Button, Form, FormItem, Input, message, Modal, Space, Tooltip } from "ant-design-vue";
import { useClientsStore } from "@src/pages/clientManage/index";
import { v4 as uuid } from "uuid";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { IClient } from "@src/src-clients/storage";
interface IFormState {
  clientID: string;
  desc: string;
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
    const formState = ref<IFormState>({
      clientID: "",
      desc: "",
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

    return () => {
      return (
        <div>
          <Form
            layout={"vertical"}
            model={formState.value}
            onFinish={() => {
              if (!formState.value) return message.warn("请输入 Client ID");

              (props.client
                ? clientsStore.updateClientRequest({
                    clientID: props.client.clientID,
                    body: {
                      desc: formState.value.desc,
                      whiteList: formState.value.whiteList.map((item) => item.ip),
                    },
                  })
                : clientsStore.createClientRequest(formState.value.clientID, {
                    desc: formState.value.desc,
                    whiteList: formState.value.whiteList.map((item) => item.ip),
                  })
              )
                .finally(() => {
                  loading.value = false;
                })
                .then(() => {
                  clientsStore.refresh();
                  message.success("创建成功");
                  Modal.destroyAll();
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
                      if (!new RegExp(/^[^\d\u4e00-\u9fa5]+$/).test(val)) {
                        return Promise.reject("只允许字母或符号，不允许输入数字、中文");
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
                          if (!val) return Promise.reject("请输入Client ID");
                          if (!new RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/).test(val)) {
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
