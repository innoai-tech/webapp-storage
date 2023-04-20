import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ApartmentOutlined,
  CheckOutlined,
  CodepenOutlined,
  LoadingOutlined,
  LogoutOutlined,
  ReconciliationOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import { useCurrentAccountStore } from "@src/pages/account";
import { useTransmissionStore } from "@src/pages/transmission";
import { Button } from "ant-design-vue";
import { useAuth } from "@src/plugins/auth";

export const Sidenav = defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentUserStore = useCurrentAccountStore();
    const transmissionStore = useTransmissionStore();
    const authStore = useAuth();
    return () => {
      const menus = [
        {
          icon: <CodepenOutlined />,
          label: "文件管理",
          key: "disk",
        },
        {
          icon: <ThunderboltOutlined />,
          label: "传输管理",
          key: "transmission",
          stateIcon:
            transmissionStore.downloading || transmissionStore.uploading ? (
              <LoadingOutlined />
            ) : transmissionStore.hasNewFinished ? (
              <CheckOutlined />
            ) : null,
        },
        {
          icon: <ApartmentOutlined />,
          label: "组织管理",
          key: "org",
        },
        {
          icon: <UserOutlined />,
          label: "用户管理",
          key: "member",
          show: currentUserStore.account?.isAdmin,
        },
        {
          icon: <UserAddOutlined />,
          label: "管理员列表",
          key: "admin",
          show: currentUserStore.account?.isAdmin,
        },
        {
          icon: <ReconciliationOutlined />,
          label: "操作记录",
          key: "log",
          show: currentUserStore.account?.isAdmin,
        },
        {
          icon: <ApartmentOutlined />,
          label: "客户端管理",
          key: "clientManage",
          show: currentUserStore.account?.isAdmin,
        },
      ];
      return (
        <div class={"base-layout-side flex-shrink-0 w-60 relative"}>
          <div class={"h-full bg-[#D7D1D3] w-full py-4 px-2 pt-8"}>
            <ul class={""}>
              {menus.map((menu) => {
                if (menu.show === false) return null;
                return (
                  <li
                    key={menu.key}
                    class={`text-[13px] transition-all text-gray-700 mb-2 px-4 py-2 hover:text-blue-500 cursor-pointer rounded-md ${
                      route.name === menu.key ? "text-white bg-blue-500 hover:text-white" : ""
                    }`}
                    onClick={() => {
                      router.push({ name: menu.key });
                    }}>
                    <span class={"flex items-center gap-2"}>
                      {menu.icon}
                      <span>{menu.label}</span>
                      <span>{menu.stateIcon}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <Button
            type={"link"}
            class={"absolute bottom-10 left-4 text-xs"}
            onClick={() => {
              authStore.setAccess(null);
            }}>
            <LogoutOutlined />
            退出登录
          </Button>
        </div>
      );
    };
  },
});
