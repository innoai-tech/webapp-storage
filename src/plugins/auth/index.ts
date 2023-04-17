import { defineStore } from "pinia";
import { ref } from "vue";
import { IAuthToken } from "@src/src-clients/storage";

export interface IAuth {
  accessToken: string;
  expiresDate: number;
  refreshToken: string;
  type: string;
}
export const useAuth = defineStore(
  "access",
  () => {
    const access = ref<IAuth | null>(null);
    function setAccess(newAccess: IAuthToken | null) {
      if (!newAccess) {
        access.value = null;
      } else {
        access.value = {
          accessToken: newAccess.access_token,
          expiresDate: new Date().valueOf() + newAccess.expires_in * 1000,
          refreshToken: newAccess.refresh_token,
          type: newAccess.type,
        };
      }
    }

    return {
      access,
      setAccess,
      clear() {
        setAccess(null);
      },
    };
  },
  { persist: { enabled: true } },
);
