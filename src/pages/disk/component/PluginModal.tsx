import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { Button, Tabs, TabPane, Form, FormItem, message, Modal, Select, Pagination } from "ant-design-vue";
import { Table } from "@src/components/table";
import { useRequest } from "vue-request";
import { listPlugin, listPluginProvider, triggerDirPlugin } from "@src/src-clients/storage";
import { watch } from "vue";
import { useColumns } from "@src/pages/plugin/usePluginColumn";
export const PluginModal = defineComponent({
  props: {
    path: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    const loading = ref(false);
    const { runAsync: getPlugins, data: pluginsMap } = useRequest(listPluginProvider, {
      manual: true,
    });
    const { runAsync: triggerDirPluginReq } = useRequest(triggerDirPlugin, {
      manual: true,
    });
    onMounted(() => {
      getPlugins({});
    });
    const { data, refresh, runAsync } = useRequest(listPlugin, {
      refreshOnWindowFocus: true,
      manual: true,
    });
    const options = ref<{ label: string; value: string }[]>([]);

    watch(
      () => pluginsMap.value,
      () => {
        if (!pluginsMap.value?.plugin) return;
        options.value = Object.keys(pluginsMap.value.plugin).map((key) => {
          const item = pluginsMap.value!.plugin[key]!;
          return {
            value: key,
            label: item.desc || `未命名插件：${key}`,
          };
        });
      },
    );
    const formState = ref<{
      plugins: string;
    }>({
      plugins: "",
    });

    const currentTab = ref<"FORM" | "TABLE">("FORM");
    const column = useColumns();
    const size = ref(10);
    const offset = ref(0);

    onMounted(() => {
      watch(
        () => [props.path, currentTab.value, offset.value],
        () => {
          if (!props.path || currentTab.value !== "TABLE") return;
          runAsync({
            path: props.path,
            size: size.value,
            offset: offset.value * size.value,
          });
        },
        { immediate: true },
      );

      const timer = setInterval(() => {
        if (currentTab.value !== "TABLE") return;
        refresh();
      }, 3000);
      onBeforeUnmount(() => {
        clearInterval(timer);
      });
    });

    return () => {
      return (
        <div>
          <Tabs
            class={"flex-1"}
            activeKey={currentTab.value}
            destroyInactiveTabPane={true}
            onChange={(tab: any) => {
              currentTab.value = tab;
            }}>
            <TabPane key={"FORM"} tab={"触发插件"}>
              <Form
                layout={"vertical"}
                model={formState.value}
                onFinish={() => {
                  loading.value = true;
                  triggerDirPluginReq({
                    path: props.path,
                    body: {
                      name: formState.value.plugins,
                    },
                  })
                    .then(() => {
                      currentTab.value = "TABLE";
                      message.success("触发成功");
                    })
                    .finally(() => {
                      loading.value = false;
                    });
                }}>
                <FormItem required label={"选择需要触发的插件"} name={"plugins"}>
                  <Select
                    placeholder={"请选择需要触发的插件"}
                    disabled={loading.value}
                    options={options.value}
                    value={formState.value.plugins || undefined}
                    onChange={(val: unknown) => {
                      formState.value.plugins = val as string;
                    }}></Select>
                </FormItem>
                <div class={"flex items-center justify-end"}>
                  <Button
                    onClick={() => {
                      Modal.destroyAll();
                    }}>
                    取消
                  </Button>
                  <Button loading={loading.value} htmlType={"submit"} type={"primary"} class={"ml-2"}>
                    触发
                  </Button>
                </div>
              </Form>
            </TabPane>

            <TabPane key={"TABLE"} tab={"触发记录"}>
              <div class="flex flex-col h-[60vh]">
                <Table rowKey={"IPluginTaskID"} columns={column} data={data.value?.data || []} />
                <div class={"mt-4 flex justify-end items-center"}>
                  <span class="mr-2">{data.value?.total}条</span>
                  <Pagination
                    pageSizeOptions={[100, 500, 1000, 2000, 4000]}
                    pageSize={size.value}
                    current={offset.value + 1}
                    total={data.value?.total}
                    onChange={(newOffset) => {
                      offset.value = newOffset - 1;
                    }}
                  />
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      );
    };
  },
});
