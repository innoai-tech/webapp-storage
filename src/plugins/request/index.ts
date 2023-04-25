// import { appConf } from "@src/config";
import { axiosRequester, trimString, useAuthorization, useTalkErrorMsgStore } from "./axios";
import { stringify } from "qs";
import { AxiosResponseHeaders, AxiosRequestConfig } from "axios";
import { toSearchString } from "../router/helpers";
import { useSettingStore } from "@src/pages/setting";
import { fetch, Body, ResponseType } from "@tauri-apps/api/http";
import { StatusUnauthorized } from "@src/plugins/request/status";
import { useAuth } from "@src/plugins/auth";
declare type IMethod = "GET" | "DELETE" | "HEAD" | "POST" | "PUT" | "PATCH";
export interface IRequestOpts {
  method: IMethod | "";
  url: string;
  headers?: AxiosResponseHeaders | { "Content-Type": string };
  query?: unknown;
  data?: unknown;
  "Content-Type"?: unknown;
  "content-type"?: unknown;
}

export interface IErrorField {
  field: string;
  in: string;
  msg: string;
}

export interface IStatusError {
  canBeTalkError: boolean;
  code: number;
  desc: string;
  key: string;
  errorFields: IErrorField[];
  id: string;
  msg: string;
  source: string[];
}

export interface IReq<TReq, TResBody> {
  (arg: TReq, opt?: AxiosRequestConfig): Promise<TResBody>;
  _name: string;
  getConfig(arg: TReq): { url: string; baseUrl: string };
}

const getBaseURL = (_: string) => {
  const settingStore = useSettingStore();
  // const SRVName = `SRV_${name.split(".")[0].toLocaleUpperCase()}`.replace(/-/g, "_");
  // const confList = appConf();

  return settingStore.host;
};

export const transOptions = (requestOpts: IRequestOpts) => {
  const getAuthorization = useAuthorization();

  return {
    ...requestOpts,
    params: Object.assign({}, requestOpts.query || {}, getAuthorization() ? { authorization: getAuthorization() } : {}),
    method: requestOpts.method || "GET",
    paramsSerializer: {
      serialize: (params) => stringify(params, { arrayFormat: "repeat" }),
    },
  };
};

export function createApiInstance<TReq, TResBody>(name: string, requestOptsFromReq: (arg: TReq) => IRequestOpts) {
  const req: IReq<TReq, TResBody> = function (arg, opt = {}) {
    const baseURL = getBaseURL(name);
    const requestOpts = requestOptsFromReq(arg || ({} as TReq));
    const talkErrorMsgStore = useTalkErrorMsgStore();
    return new Promise<TResBody>((resolve, reject) => {
      const accessStore = useAuth();
      const options = {
        baseURL,
        ...(transOptions(requestOpts) as any),
        ...opt,
      };

      // @ts-ignore
      if ((import.meta as any).env.DEV && !window.__TAURI_IPC__) {
        return axiosRequester
          .request<TResBody>(options)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      }

      return fetch(`${options.baseURL}${options.url}${toSearchString(options.params)}`, {
        method: options.method,
        body: options.data ? Body.json(trimString(Object.assign({}, options.data))) : undefined,
      })
        .then((res: any) => {
          if (res.status >= 200 && res.status < 300) {
            resolve(res.data);
          }

          const responseData = res.data;
          // 提示错误信息
          if (responseData?.msg && responseData?.canBeTalkError) {
            talkErrorMsgStore.pushMessages(responseData.msg);
          }

          // 401 清除掉登录信息
          if (res.status === StatusUnauthorized) {
            accessStore.setAccess(null);
          }
          reject(res);
        })
        .catch((err) => {
          if (
            (err as string).includes(
              "Network Error: Io Error: corrupt deflate stream: Io Error: corrupt deflate stream",
            )
          ) {
            resolve({ status: 204, data: null } as any);
          } else {
            reject(err);
          }
        });
    });
  };
  req._name = name;
  req.getConfig = (arg) => {
    const baseURL = getBaseURL(name);
    const requestOpts = requestOptsFromReq(arg || ({} as TReq));
    const options = transOptions(requestOpts);
    return {
      baseUrl: `${baseURL}${options.url}`,
      url: `${baseURL}${options.url}${options.params ? `${toSearchString(options.params)}` : ""}`,
    };
  };
  return req;
}
