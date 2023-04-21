import { generateClientFromConfig } from "@querycap-dev/generate-client"; //xx
import * as path from "path";
import { APP_CONFIG, APP_MANIFEST, appConf } from "../../config";
import { startsWith } from "@querycap/lodash";
(async () => {
  const app = {
    GROUP: "sentry",
    ENVS: {
      STAGING: "staging",
      DEMO: "demo",
      LOCAL: "local",
      ONLINE: "online",
    },
    APP_MANIFEST: APP_MANIFEST,
    APP_CONFIG: APP_CONFIG,
    conf: appConf(),
    name: "obs",
    index: 1,
  };

  const appConfig = app.APP_CONFIG;

  const conf = {} as { [key: string]: string };
  for (const i in appConfig) {
    if (startsWith(i, "SRV_")) {
      const getValue = (appConfig as any)[i];
      conf[i] = `${getValue("", "")}/api`;
    }
  }

  await generateClientFromConfig(conf, {
    cwd: path.join(__dirname, "../../"),
    clientCreator: "@src/plugins/request.createApiInstance",
    force: true,
  });
})();
