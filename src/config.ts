export const ENVS = {
  DEMO: "demo",
  RELEASE: "release",
  STRGING: "staging",
  TEST: "test",
  ONLINE: "online",
  MASTER: "master",
};

export const APP_MANIFEST = {
  name: "IOT 设备群组",
  short_name: "storage",
  description: "",
  background_color: "#fff",
  crossorigin: "use-credentials",
  private: "false",
};

export const GROUP = "iot";

export const APP_CONFIG = {
  // app 名称
  APP_NAME: () => {
    return APP_MANIFEST.short_name;
  },
  // 当前环境，不需要设置
  ENV: (env: string) => {
    return env.toLowerCase();
  },

  //后端请求地址
  SRV_STORAGE: () => {
    // @ts-ignore
    if ((import.meta as any).env.PROD) {
      return "https://storage.dev.innoai.tech";
    }
    return "http://172.20.30.92:8090";
  },
};

const getDevKitValue = (key: string) => {
  return globalThis.document?.querySelector(`meta[name="devkit:${key}"]`)?.getAttribute("content") || "";
};
export type Config = { [k: string]: string };
export const appConf = () => {
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const isBase64 = (v: string): boolean => {
    if (v === "") {
      return false;
    }
    return base64regex.test(v);
  };
  const parse = (s: string) => {
    const kvs = s.split(",");
    const c: Config = {};

    kvs.forEach((kv) => {
      if (kv == "") {
        return;
      }

      const [k, ...vs] = kv.split("=");
      const v = vs.join("=");

      if (isBase64(v)) {
        c[k] = atob(v);
      } else {
        c[k] = v;
      }
    });

    return c;
  };
  const app = parse(getDevKitValue("app"));
  const config = parse(getDevKitValue("config"));

  return {
    ...config,
    ...app,
  };
};
