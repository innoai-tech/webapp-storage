import { defineStore } from "pinia";
import { useRequest } from "vue-request";
import { useAuth } from "@src/plugins/auth";
import { computed, ref } from "vue";
import { currentUser, IAuthOperatorCurrentUser } from "@src/src-clients/storage";
import dayjs from "dayjs";

export const useCurrentAccountStore = defineStore("currentAccount", () => {
  const accountStore = useAuth();
  const isValidToken = computed(() => {
    return !!accountStore.access?.expiresDate && accountStore.access.expiresDate - dayjs().valueOf() > 0;
  });
  // 因为页面强制了有 account 才进入，所以这里强行改一下类型方便其他页面调用
  const account = ref<IAuthOperatorCurrentUser>(null as any);
  useRequest(currentUser, {
    refreshOnWindowFocus: true,
    ready: isValidToken,
    onSuccess(res) {
      account.value = res;
    },
  });
  return { account };
});
