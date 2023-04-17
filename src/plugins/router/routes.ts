import { Index } from "@src/pages/login";
import { MustLogin } from "@src/plugins/auth/MustLogin";
import { BaseLayout } from "@src/layouts/BaseLayout";
import { Disk } from "@src/pages/disk";
import { Org } from "@src/pages/org";
import { Member } from "@src/pages/member";
import { Transmission } from "@src/pages/transmission";
import { Admin } from "@src/pages/admin";
import { Log } from "@src/pages/log";
import { Setting } from "@src/pages/setting";

export const routes = [
  { path: "/login", component: Index, name: "login" },

  {
    path: "",
    component: BaseLayout,
    name: "Layout",
    children: [
      {
        path: "",
        name: "mustLogin",
        component: MustLogin,
        children: [
          {
            path: "disk",
            component: Disk,
            name: "disk",
            children: [],
            meta: { title: "文件管理" },
          },
          {
            path: "org",
            component: Org,
            name: "org",
            children: [],
            meta: { title: "组织管理" },
          },
          {
            path: "member",
            component: Member,
            name: "member",
            children: [],
            meta: { title: "用户管理" },
          },
          {
            path: "admin",
            component: Admin,
            name: "admin",
            children: [],
            meta: { title: "管理员管理" },
          },
          {
            path: "transmission",
            component: Transmission,
            name: "transmission",
            children: [],
            meta: { title: "传输管理" },
          },
          {
            path: "log",
            component: Log,
            name: "log",
            children: [],
            meta: { title: "操作记录" },
          },
          {
            path: "setting",
            component: Setting,
            name: "setting",
            children: [],
            meta: { title: "系统设置" },
          },
          {
            path: ":matchAll(.*)",
            redirect: "disk",
            name: "anyPath",
          },
          {
            path: "",
            redirect: "disk",
            name: "anyPath",
          },
        ],
      },
    ],
  },
];
