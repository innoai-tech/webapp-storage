import { PiniaPluginContext } from "pinia";
import { green } from "colorette";

/*
 * dev 环境打印一下状态更新，方便 debug
 * */
export default ({ store }: PiniaPluginContext): void => {
  // 只有开发环境打印
  // @ts-ignore
  if ((!import.meta as any).env) return;
  const state = true;
  store.$subscribe(() => {
    if (state) return;
    const storeKey = store.$id;
    // 转化为一个普通对象，方便打印查看
    const storeVal = Object.assign({}, store.$state);

    console.log(green(`[state change] ${storeKey}:`), storeVal);
  });
};
