import { defineComponent, ref } from "vue";
import { Button, DatePicker, Form, FormItem, message, Modal, Tooltip } from "ant-design-vue";
import { useRequest } from "vue-request";
import { dirShare, IShareShareToken } from "@src/src-clients/storage";
import dayjs from "dayjs";
import { toFullTime } from "@src/utils/date";
import { CopyOutlined } from "@ant-design/icons-vue";
import { writeText } from "@tauri-apps/api/clipboard";
export const ShareDirModal = defineComponent({
  props: {
    path: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    const formState = ref<{ expiredAt: string }>({ expiredAt: "" });

    const loading = ref(false);
    const resData = ref<IShareShareToken | null>(null);

    const { runAsync: shareDir } = useRequest(dirShare, {
      manual: true,
    });
    return () => {
      return (
        <div>
          <Form
            layout={"vertical"}
            v-model:model={formState.value}
            onFinish={() => {
              if (!formState.value.expiredAt) {
                message.warn("请选择过期时间");
                return;
              }
              loading.value = true;
              shareDir({
                path: props.path,
                body: {
                  expiredAt: formState.value.expiredAt,
                },
              })
                .then((res) => {
                  resData.value = res;
                  message.success("分享成功，请复制保存");
                })
                .finally(() => {
                  loading.value = false;
                });
            }}>
            {resData.value ? (
              <div>
                <div>
                  Token: {resData.value?.shareToken}
                  <Tooltip title={"复制凭证"}>
                    <CopyOutlined
                      class={"ml-2"}
                      onClick={() => {
                        if (resData.value?.shareToken) {
                          writeText(resData.value?.shareToken);
                          message.success("复制成功");
                        }
                      }}
                    />
                  </Tooltip>
                </div>
                <div>过期时间：{toFullTime(dayjs().unix() + resData.value?.expiresIn)}</div>
              </div>
            ) : (
              <FormItem
                required
                label={"过期时间"}
                name={"expiredAt"}
                rules={[{ required: true, message: "请选择过期时间", trigger: "change" }]}>
                <DatePicker showTime={true} v-model:value={formState.value.expiredAt} />
              </FormItem>
            )}
            <div class={"flex items-center justify-end"}>
              <Button
                onClick={() => {
                  Modal.destroyAll();
                }}>
                取消
              </Button>
              <Button
                loading={loading.value}
                onClick={(e) => {
                  if (resData.value) {
                    e.preventDefault();
                    Modal.destroyAll();
                  }
                }}
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
