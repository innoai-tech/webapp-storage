import { defineComponent, PropType } from "vue";
import { Button, message } from "ant-design-vue";
import { writeText } from "@tauri-apps/api/clipboard";
export const ErrorModal = defineComponent({
  props: {
    errs: {
      type: Array as PropType<string[]>,
    },
  },
  setup(props) {
    return () => {
      return (
        <div class={"h-80 w-full flex flex-col"}>
          <div class={"flex justify-end mb-4"}>
            <Button
              type={"primary"}
              onClick={() => {
                if (props.errs?.length) {
                  writeText(props.errs.join("\n"));
                  message.success("已复制到剪切板");
                }
              }}>
              COPY
            </Button>
          </div>
          <div class={"flex-1 overflow-auto"} id={"errors"}>
            {props.errs?.map((err, index) => {
              return (
                <code class={"mb-4 flex whitespace-pre break-words"} key={`${err}_${index}`}>
                  {err}
                </code>
              );
            })}
          </div>
        </div>
      );
    };
  },
});
