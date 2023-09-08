import { defineComponent, ref } from "vue";
import { Button, DatePicker, Form, FormItem, message, Modal, Tooltip } from "ant-design-vue";
import { useRequest } from "vue-request";
import {
  getShareObject,
  createObjectShareLink,
  createObjectUploadLink,
  uploadByLinkUpload,
} from "@src/src-clients/storage";
import { toFullTime } from "@src/utils/date";
import { CopyOutlined } from "@ant-design/icons-vue";
import { writeText } from "@tauri-apps/api/clipboard";
import dayjs, { Dayjs } from "dayjs";

export const CreateDirUploadLinkModal = defineComponent({
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
    const formState = ref<{ expiredAt: Dayjs }>({
      expiredAt: dayjs(),
    });

    const loading = ref(false);
    const shareUrl = ref("");

    const { runAsync: createUploadLink } = useRequest(createObjectUploadLink, {
      manual: true,
    });

    const setExpiredAt = (duration) => {
      const expiredAt = dayjs().add(duration, "day");
      formState.value.expiredAt = expiredAt;
    };
    const setLongTerm = () => {
      const longTermDate = dayjs("2099-12-31 59:59:59");
      formState.value.expiredAt = longTermDate;
    };

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
              createUploadLink({
                path: props.path,
                body: {
                  isDir: props.isDir,
                  expiredAt: formState.value.expiredAt.toISOString(),
                },
              })
                .then((res) => {
                  shareUrl.value = `${
                    uploadByLinkUpload.getConfig(
                      {
                        uploadID: res.uploadID,
                        signature: res.signature,
                      } as any,
                      false,
                    ).url
                  }&expiredAt=${dayjs(formState.value.expiredAt).toISOString()}`;
                  message.success("上传成功，请复制保存");
                })
                .finally(() => {
                  loading.value = false;
                });
            }}>
            {shareUrl.value ? (
              <div>
                <div>
                  上传地址: {shareUrl.value}
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
                <div>过期时间：{toFullTime(dayjs(formState.value.expiredAt).toISOString())}</div>
                {/* <div>分享权限：{formState.value.powers.map((item) => `${displaySharePower(item)}`).join("、")}</div> */}
              </div>
            ) : (
              <>
                <FormItem
                  required
                  label={"过期时间"}
                  name={"expiredAt"}
                  rules={[{ required: true, message: "请选择过期时间", trigger: "change" }]}>
                  <DatePicker
                    v-slots={{
                      renderExtraFooter() {
                        return (
                          <div class="flex align-middle gap-6">
                            <Button type="link" onClick={() => setExpiredAt(1)}>
                              一天
                            </Button>
                            <Button type="link" onClick={() => setExpiredAt(7)}>
                              一周
                            </Button>
                            <Button type="link" onClick={() => setExpiredAt(30)}>
                              一月
                            </Button>
                            <Button type="link" onClick={() => setExpiredAt(90)}>
                              三月
                            </Button>
                            <Button type="link" onClick={() => setExpiredAt(180)}>
                              六月
                            </Button>
                            <Button type="link" onClick={() => setExpiredAt(365)}>
                              一年
                            </Button>
                            <Button type="link" onClick={() => setExpiredAt(3650)}>
                              十年
                            </Button>
                            <Button type="link" onClick={setLongTerm}>
                              长期
                            </Button>
                          </div>
                        );
                      },
                    }}
                    showNow={false}
                    disabledDate={(date) => {
                      return dayjs().startOf("day").unix() - dayjs(date).unix() >= 0;
                    }}
                    style={{ width: "100%" }}
                    showTime={true}
                    v-model:value={formState.value.expiredAt}
                  />
                </FormItem>
                {/* <FormItem
                  required
                  label={"分享权限"}
                  name={"powers"}
                  rules={[{ required: true, message: "请选择分享权限", trigger: "change" }]}>
                  <Select mode="multiple" options={authOptions.value} v-model:value={formState.value.powers} />
                </FormItem> */}
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
                {shareUrl.value ? "确定" : "创建"}
              </Button>
            </div>
          </Form>
        </div>
      );
    };
  },
});
