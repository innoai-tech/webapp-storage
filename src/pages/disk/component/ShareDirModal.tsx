import { computed, defineComponent, ref } from "vue";
import { Button, DatePicker, Form, FormItem, message, Modal, Select, Tooltip } from "ant-design-vue";
import { useRequest } from "vue-request";
import { objectShare, ISharePower, SharePower, displaySharePower, getShareObject } from "@src/src-clients/storage";
import { toFullTime } from "@src/utils/date";
import { CopyOutlined } from "@ant-design/icons-vue";
import { writeText } from "@tauri-apps/api/clipboard";
import dayjs from "dayjs";
export const ShareDirModal = defineComponent({
  props: {
    path: {
      required: true,
      type: String,
    },
    isDir: {
      required: true,
      type: Boolean,
    },
    name: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    const formState = ref<{ expiredAt: string; powers: ISharePower[] }>({ powers: [SharePower.READ], expiredAt: "" });

    const loading = ref(false);
    const shareUrl = ref("");
    const authOptions = computed(() =>
      Object.keys(SharePower).map((key: unknown) => ({
        value: key as string,
        label: displaySharePower(key as ISharePower),
      })),
    );

    const { runAsync: share } = useRequest(objectShare, {
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
              share({
                path: props.path,
                body: {
                  isDir: props.isDir,
                  powers: formState.value.powers,
                  expiredAt: formState.value.expiredAt,
                },
              })
                .then((res) => {
                  shareUrl.value = `${
                    getShareObject.getConfig(
                      {
                        signature: res.signature,
                        shareID: res.shareID,
                        path: props.isDir ? undefined : `/${props.name}`,
                      },
                      false,
                    ).url
                  }&expiredAt=${dayjs(formState.value.expiredAt).toISOString()}`;
                  message.success("分享成功，请复制保存");
                })
                .finally(() => {
                  loading.value = false;
                });
            }}>
            {shareUrl.value ? (
              <div>
                <div>
                  分享地址: {shareUrl.value}
                  <Tooltip title={"复制地址"}>
                    <CopyOutlined
                      class={"ml-2"}
                      onClick={() => {
                        if (shareUrl.value) {
                          writeText(shareUrl.value);
                          message.success("复制成功");
                        }
                      }}
                    />
                  </Tooltip>
                </div>
                <div>过期时间：{toFullTime(formState.value.expiredAt)}</div>
                <div>分享权限：{formState.value.powers.map((item) => `${displaySharePower(item)}`).join("、")}</div>
              </div>
            ) : (
              <>
                <FormItem
                  required
                  label={"过期时间"}
                  name={"expiredAt"}
                  rules={[{ required: true, message: "请选择过期时间", trigger: "change" }]}>
                  <DatePicker
                    disabledDate={(date) => {
                      return dayjs().startOf("day").unix() - dayjs(date).unix() >= 0;
                    }}
                    style={{ width: "100%" }}
                    showTime={true}
                    v-model:value={formState.value.expiredAt}
                  />
                </FormItem>
                <FormItem
                  required
                  label={"分享权限"}
                  name={"powers"}
                  rules={[{ required: true, message: "请选择分享权限", trigger: "change" }]}>
                  <Select mode="multiple" options={authOptions.value} v-model:value={formState.value.powers} />
                </FormItem>
              </>
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
                  if (shareUrl.value) {
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
