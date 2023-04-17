// import { appConf } from "@src/config";
import { axiosRequester, useAuthorization } from "./axios";
import { stringify } from "qs";
import { AxiosResponseHeaders, AxiosRequestConfig } from "axios";
import { toSearchString } from "../router/helpers";
import { useSettingStore } from "@src/pages/setting";
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
    // const options = transOptions(requestOpts)
    return new Promise<TResBody>((resolve, reject) => {
      return axiosRequester
        .request<TResBody>({
          baseURL,
          ...(transOptions(requestOpts) as any),
          ...opt,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
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
