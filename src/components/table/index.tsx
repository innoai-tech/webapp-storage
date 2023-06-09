import { DefineComponent, defineComponent, onMounted, onUnmounted, ref, VNode } from "vue";
import { ElTableV2 } from "element-plus";
import "element-plus/es/components/table-v2/style/index";
import { debounce } from "lodash-es";
import { CellRendererParams, Column } from "element-plus/es/components/table-v2/src/types";
// import zhCN from "element-plus/es/locale/lang/zh-cn";
/*
 * element plus 的部分定义有问题，修改一下
 * */
export declare type CellRenderer<T> = (params: CellRendererParams<T>) => string | Element | VNode | null;
export declare interface TableColumn<T = any> extends Omit<Column, "cellRenderer"> {
  /**
   * Renderers
   */
  cellRenderer?: CellRenderer<T>;
}

type TableType = {
  rowKey: string;
  filled?: boolean;
  columns: TableColumn[];
} & Omit<InstanceType<typeof ElTableV2>["$props"], "columns">;

export const Table = defineComponent({
  inheritAttrs: false,
  props: {
    rowKey: {
      required: true,
      type: String,
    },
    filled: {
      default: true,
      required: false,
      type: Boolean,
    },
  },
  setup(props, { slots, attrs }) {
    const domRef = ref<HTMLDivElement | null>(null);
    const width = ref(800);
    const height = ref(200);

    onMounted(() => {
      const dom = domRef.value;
      if (!dom) return;
      const getSize = debounce(
        () => {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        },
        500,
        { leading: true },
      );
      window.addEventListener("resize", getSize);
      onUnmounted(() => {
        window.removeEventListener("resize", getSize);
      });
      getSize();
    });

    return () => {
      return (
        <div class={"flex-1"} ref={domRef}>
          <ElTableV2
            {...attrs}
            width={width.value}
            height={height.value}
            rowKey={props.rowKey}
            columns={attrs.columns as any}
            data={attrs.data as any}>
            {slots.default?.()}
          </ElTableV2>
        </div>
      );
    };
  },
}) as DefineComponent<Omit<TableType, "width" | "height">>;
