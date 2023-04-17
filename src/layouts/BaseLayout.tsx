import { defineComponent } from "vue";
import { RouterView, useRoute } from "vue-router";
import "./baseLayout.less";
import { Sidenav } from "./Sidenav";

export const BaseLayout = defineComponent({
  setup() {
    const route = useRoute();
    return () => {
      return (
        <main class={["base-layout h-full flex relative"]}>
          {/*拖拽窗口*/}
          <div data-tauri-drag-region class={"absolute top-0 left-0 right-0 h-8 z-[99999999]"}></div>

          <Sidenav />

          <div class={"px-4 pb-2 pt-8 flex flex-col w-full h-full"}>
            {!!route.meta?.title && <h1 class={"flex-shrink-0 text-2xl"}>{route.meta?.title}</h1>}
            <section class={"w-full flex-1 bg-white flex flex-col"}>
              <RouterView></RouterView>
            </section>
          </div>
        </main>
      );
    };
  },
});
