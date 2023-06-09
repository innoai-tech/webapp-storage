import { defineComponent, ref } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue";
import { writeText } from "@tauri-apps/api/clipboard";
import { Button, message, Modal, Space } from "ant-design-vue";
import { useRequest } from "vue-request";
import { refreshAccountClientSecret, refreshGroupClientSecret } from "@src/src-clients/storage";
import { Tooltip } from "ant-design-vue";

export const SecretContent = defineComponent({
  props: {
    groupID: {
      type: String,
      required: false,
    },
    clientID: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      required: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const secret = ref(props.secret);
    const { runAsync: refreshSecret } = useRequest(refreshAccountClientSecret, { manual: true });
    const { runAsync: refreshGroupSecret } = useRequest(refreshGroupClientSecret, { manual: true });
    return () => {
      return (
        <div>
          <h2 class={"mt-0 mb-2"}>{props.secret ? "复制密钥" : ""}</h2>
          <div class={"mb-10"}>
            {secret.value ? (
              <>
                <div>secret:</div>
                <Space>
                  <div>{secret.value}</div>
                  <Tooltip title={"复制"}>
                    <CopyOutlined
                      class={"cursor-copy"}
                      onClick={() => {
                        writeText(secret.value!);
                        message.success("复制成功");
                      }}
                    />
                  </Tooltip>
                </Space>
              </>
            ) : (
              "是否确定刷新密钥？"
            )}
          </div>

          <div class={"flex justify-end gap-3"}>
            <Button
              onClick={() => {
                emit("close");
              }}>
              取消
            </Button>
            <Button
              type={"primary"}
              onClick={() => {
                if (secret.value) {
                  emit("close");
                } else {
                  if (props.groupID) {
                    refreshGroupSecret({ clientID: props.clientID, groupID: props.groupID }).then((res) => {
                      secret.value = res.clientSecret;
                      message.success("刷新成功，请复制 Secret");
                    });
                  } else {
                    refreshSecret({ clientID: props.clientID }).then((res) => {
                      secret.value = res.clientSecret;
                      message.success("刷新成功，请复制 Secret");
                    });
                  }
                }
              }}>
              确定
            </Button>
          </div>
        </div>
      );
    };
  },
});
