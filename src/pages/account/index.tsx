import { defineStore } from "pinia";
import { useRequest } from "vue-request";
import { useAuth } from "@src/plugins/auth";
import { computed } from "vue";
import { currentUser } from "@src/src-clients/storage";

export const useCurrentAccountStore = defineStore("currentAccount", () => {
  const accountStore = useAuth();
  const hasToken = computed(() => !!accountStore.access?.accessToken);

  const { data: account } = useRequest(() => currentUser({}), {
    refreshOnWindowFocus: true,
    ready: hasToken,
  });
  return { account };
});
