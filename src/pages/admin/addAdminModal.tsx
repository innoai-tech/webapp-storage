import { computed, defineComponent, onUnmounted, ref } from "vue";
import { Form, FormItem, message, Select } from "ant-design-vue";
import { defineStore } from "pinia";
import { useRequest } from "vue-request";
import { bindGroupAccount, IGroupRoleType } from "@src/src-clients/storage";
import { useMembersStore } from "@src/pages/member";
import { useAdminStore } from "@src/pages/admin/index";

interface IFormState {
  accountID?: string;
  roleType?: IGroupRoleType;
}

export const useAddAdminStore = defineStore("addAdminStore", () => {
  const formRef = ref();
  const form = ref<IFormState>({ accountID: undefined, roleType: undefined });

  function clearForm() {
    form.value = { accountID: undefined, roleType: undefined };
  }

  function setForm(values: IFormState) {
    form.value = values;
  }
  const { runAsync: groupBindAccount } = useRequest(bindGroupAccount, {
    manual: true,
    onSuccess() {
      message.success("操作成功");
    },
  });

  return {
    form,
    formRef,
    setForm,
    clearForm,
    bindMemberRequest(groupID: string) {
      return new Promise((resolve, reject) => {
        if (!form.value.accountID) {
          message.warn("请选择用户");
          return reject();
        }
        if (!form.value.roleType) {
          message.warn("请选择角色");
          return reject();
        }
        groupBindAccount({
          accountID: form.value.accountID,
          groupID,
          body: {
            roleType: form.value.roleType,
          },
        }).then(
          () => {
            resolve("");
          },
          () => {
            reject();
          },
        );
      });
    },
  };
});

export const AddAdminModal = defineComponent({
  setup() {
    const addAdminStore = useAddAdminStore();
    const adminStore = useAdminStore();
    const membersStore = useMembersStore();

    onUnmounted(() => {
      addAdminStore.clearForm();
      adminStore.refresh();
    });

    const adminMap = computed(() =>
      adminStore.admins?.data?.map((item) => item.accountID)?.reduce((p, c) => ({ ...p, [c]: true }), {}),
    );

    return () => {
      return (
        <div>
          <Form layout={"vertical"} v-model:model={addAdminStore.form} ref={addAdminStore.formRef}>
            <FormItem
              required
              label={"选择用户"}
              name={"accountID"}
              rules={[{ required: true, message: "请选择需要添加的用户", trigger: "change" }]}>
              <Select
                showSearch
                optionFilterProp={"label"}
                placeholder={"请选择需要添加的用户"}
                v-model:value={addAdminStore.form.accountID}>
                {membersStore.members?.data.map((member) => {
                  const isAdmin = adminMap.value?.[member.accountID];
                  return (
                    <Select.Option key={member.accountID} disabled={isAdmin}>
                      <div class={"flex justify-between items-end"}>
                        <span>{member.name}</span>
                        <span class={"text-xs"}>{isAdmin ? "管理员" : ""}</span>
                      </div>
                    </Select.Option>
                  );
                })}
              </Select>
            </FormItem>
          </Form>
        </div>
      );
    };
  },
});
