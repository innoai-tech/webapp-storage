/* eslint-disable */

import { createApiInstance } from "@src/plugins/request";

export const authorize = createApiInstance<
  {
    name: string;
    state?: string;
    redirect_uri: string;
  },
  null
>("storage.Authorize", ({ name: pName, state: pState, redirect_uri: pRedirectURI }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/auth-providers/${pName}/authorize`,
    query: {
      state: pState,
      redirect_uri: pRedirectURI,
    },
  };
});

export const bindDirGroupRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    groupID: IGroupGroupID;
    body: IObjectBindDirGroupRoleBody;
  },
  null
>(
  "storage.BindDirGroupRole",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, groupID: pGroupID, body: pBody }) => {
    return {
      method: "PUT",
      url: `/api/storage/v0/dirs/groups/${pGroupID}/roles`,
      data: pBody,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const bindDirUserRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    accountID: IAccountAccountID;
    body: IObjectBindDirUserRoleBody;
  },
  null
>(
  "storage.BindDirUserRole",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, accountID: pAccountID, body: pBody }) => {
    return {
      method: "PUT",
      url: `/api/storage/v0/dirs/users/${pAccountID}/roles`,
      data: pBody,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const bindGroupAccount = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    accountID: IAccountAccountID;
    body: IGroupGroupAccountBindGroupAccountBody;
  },
  null
>(
  "storage.BindGroupAccount",
  ({ authorization: pAuthorization, groupID: pGroupID, accountID: pAccountID, body: pBody }) => {
    return {
      method: "PUT",
      url: `/api/storage/v0/groups/${pGroupID}/accounts/${pAccountID}`,
      data: pBody,
      query: {
        authorization: pAuthorization,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const checkObject = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    SHA256: string;
  },
  null
>("storage.CheckObject", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, SHA256: pSha256 }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/objects/check`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
      SHA256: pSha256,
    },
  };
});

export const createAccountClient = createApiInstance<
  {
    authorization?: string;
    clientID: string;
    body: IClientClientInfo;
  },
  IRepositoryClientWithSecret
>("storage.CreateAccountClient", ({ authorization: pAuthorization, clientID: pClientID, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/clients/${pClientID}`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const createDir = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
  },
  null
>("storage.CreateDir", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/dirs/create`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
  };
});

export const createGroup = createApiInstance<
  {
    authorization?: string;
    body: IGroupGroupBase;
  },
  null
>("storage.CreateGroup", ({ authorization: pAuthorization, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const createGroupClient = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    clientID: string;
    body: IClientClientInfo;
  },
  IRepositoryClientWithSecret
>(
  "storage.CreateGroupClient",
  ({ authorization: pAuthorization, groupID: pGroupID, clientID: pClientID, body: pBody }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/groups/${pGroupID}/clients/${pClientID}`,
      data: pBody,
      query: {
        authorization: pAuthorization,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const createObjectShareLink = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectCreateObjectShareLinkData;
  },
  ILinkShare
>(
  "storage.CreateObjectShareLink",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/objects/shareLinks`,
      data: pBody,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const createObjectUploadLink = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectCreateObjectUploadLinkData;
  },
  ILinkUpload
>(
  "storage.CreateObjectUploadLink",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/objects/uploadLinks`,
      data: pBody,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const createOperationTask = createApiInstance<
  {
    authorization?: string;
    body: IOperationLogCreateOperationTaskBody;
  },
  IOperationLogCreateOperationTaskRep
>("storage.CreateOperationTask", ({ authorization: pAuthorization, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/operations`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const createOperationTaskByOpenapi = createApiInstance<
  {
    body: IOpenapiOperationCreateOperationTaskByOpenapiBody;
  },
  IOpenapiOperationCreateOperationTaskRep
>("storage.CreateOperationTaskByOpenapi", ({ body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/openapi/operations`,
    data: pBody,
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const currentUser = createApiInstance<
  {
    authorization?: string;
  },
  IAuthOperatorCurrentUser
>("storage.CurrentUser", ({ authorization: pAuthorization }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/user`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const currentUserGroup = createApiInstance<
  {
    authorization?: string;
    groupID?: IGroupGroupID | IGroupGroupID[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IGroupUserGroupDataList
>(
  "storage.CurrentUserGroup",
  ({ authorization: pAuthorization, groupID: pGroupID, name: pName, size: pSize, offset: pOffset }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/user/group`,
      query: {
        authorization: pAuthorization,
        groupID: pGroupID,
        name: pName,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const currentUserVendorIdentities = createApiInstance<
  {
    authorization?: string;
  },
  IAccountVendorIdentity[]
>("storage.CurrentUserVendorIdentities", ({ authorization: pAuthorization }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/user/vendor-identities`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const deleteAccountClient = createApiInstance<
  {
    authorization?: string;
    clientID: string;
  },
  null
>("storage.DeleteAccountClient", ({ authorization: pAuthorization, clientID: pClientID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/clients/${pClientID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const deleteAdmin = createApiInstance<
  {
    authorization?: string;
    accountID: IAccountAccountID;
  },
  null
>("storage.DeleteAdmin", ({ authorization: pAuthorization, accountID: pAccountID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/admins/${pAccountID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const deleteDir = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
  },
  null
>("storage.DeleteDir", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/dirs/delete`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
  };
});

export const deleteGroup = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
  },
  null
>("storage.DeleteGroup", ({ authorization: pAuthorization, groupID: pGroupID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/groups/${pGroupID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const deleteGroupClient = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    clientID: string;
  },
  null
>("storage.DeleteGroupClient", ({ authorization: pAuthorization, groupID: pGroupID, clientID: pClientID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/groups/${pGroupID}/clients/${pClientID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const deleteObject = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    file: string | string[];
  },
  null
>("storage.DeleteObject", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, file: pFile }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/objects/delete`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
      file: pFile,
    },
  };
});

export const dirCopy = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectDirCopyBody;
  },
  null
>("storage.DirCopy", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/copy`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const dirMove = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectDirMoveBody;
  },
  null
>("storage.DirMove", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/move`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const dirRename = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectDirRenameBody;
  },
  null
>("storage.DirRename", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/rename`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const dirSearch = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    keyword: string;
    onlyDir?: IDatatypesBool;
    sort?: IUtilsDatatypesSort;
    size?: number;
    offset?: number;
  },
  IObjectObjectSearchDataList
>(
  "storage.DirSearch",
  ({
    authorization: pAuthorization,
    path: pPath,
    taskCode: pTaskCode,
    keyword: pKeyword,
    onlyDir: pOnlyDir,
    sort: pSort,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/dirs/search`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
        keyword: pKeyword,
        onlyDir: pOnlyDir,
        sort: pSort,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const dirStatistics = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
  },
  IObjectDirStatisticsInfo
>("storage.DirStatistics", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/dirs/statistic`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
  };
});

export const displayAccount = (field: keyof IAccount) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "",
        name: "",
        state: "",
        uniqueCode: "账户唯一标识",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayAccountPutAccountStateBody = (field: keyof IAccountPutAccountStateBody) => {
  return (
    {
      state: "",
    } as { [key: string]: string }
  )[field];
};

export const displayAccountState = (type: "ENABLE" | "DISABLE") => {
  return {
    ENABLE: "启用",
    DISABLE: "禁用",
  }[type];
};

export const displayAccountUser = (field: any) => {
  return (
    displayAccount(field as any) || displayAccountUserInfo(field as any) || ({} as { [key: string]: string })[field]
  );
};

export const displayAccountUserDataList = (field: keyof IAccountUserDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayAccountUserInfo = (field: keyof IAccountUserInfo) => {
  return (
    {
      email: "",
      mobile: "",
      nickname: "",
    } as { [key: string]: string }
  )[field];
};

export const displayAccountVendorIdentity = (field: keyof IAccountVendorIdentity) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "",
        vendorIdentity: "",
        vendorIdentityDisplay: "",
        vendorIdentityFrom: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayAdmin = (field: keyof IAdmin) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "账户 ID",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayAdminUser = (field: keyof IAdminUser) => {
  return (
    displayAdmin(field as any) ||
    displayAccountUserInfo(field as any) ||
    (
      {
        name: "账户姓名",
        state: "账户状态",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayAdminUserDataList = (field: keyof IAdminUserDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayAuthProviderList = (field: keyof IAuthProviderList) => {
  return (
    {
      providers: "",
    } as { [key: string]: string }
  )[field];
};

export const displayAuthProviderOpt = (field: keyof IAuthProviderOpt) => {
  return (
    {
      autoTriggerWhenUserAgent: "自动触发条件，UserAgent 正则",
      buttonImageURL: "按钮",
      desc: "描述",
      priority: "优先级",
    } as { [key: string]: string }
  )[field];
};

export const displayAuthRefreshTokenBody = (field: keyof IAuthRefreshTokenBody) => {
  return (
    {
      refresh_token: "",
    } as { [key: string]: string }
  )[field];
};

export const displayAuthToken = (field: keyof IAuthToken) => {
  return (
    {
      access_token: "",
      expires_in: "",
      refresh_token: "",
      type: "",
    } as { [key: string]: string }
  )[field];
};

export const displayCallbackPluginCallbackBody = (field: keyof ICallbackPluginCallbackBody) => {
  return (
    {
      message: "",
      progress: "",
      state: "",
    } as { [key: string]: string }
  )[field];
};

export const displayClientAccountClient = (field: keyof IClientAccountClient) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayClientClientInfo(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "",
        clientID: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayClientAccountClientDataList = (field: keyof IClientAccountClientDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayClientClientInfo = (field: keyof IClientClientInfo) => {
  return (
    {
      desc: "描述",
      whiteList: "IP 白名单",
    } as { [key: string]: string }
  )[field];
};

export const displayClientGroupClient = (field: keyof IClientGroupClient) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayClientClientInfo(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        clientID: "",
        groupID: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayClientGroupClientDataList = (field: keyof IClientGroupClientDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayGroup = (field: keyof IGroup) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayGroupGroupBase(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        groupID: "组织 ID",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayGroupAccount = (field: keyof IGroupAccount) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "账户 ID",
        groupID: "组织 ID",
        roleType: "角色",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayGroupGroupAccountBindGroupAccountBody = (field: keyof IGroupGroupAccountBindGroupAccountBody) => {
  return (
    {
      roleType: "",
    } as { [key: string]: string }
  )[field];
};

export const displayGroupGroupBase = (field: keyof IGroupGroupBase) => {
  return (
    {
      desc: "组织描述",
      name: "组织名称",
    } as { [key: string]: string }
  )[field];
};

export const displayGroupGroupDataList = (field: keyof IGroupGroupDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayGroupGroupWithRole = (field: keyof IGroupGroupWithRole) => {
  return (
    displayGroup(field as any) ||
    (
      {
        roleType: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayGroupRoleType = (type: "OWNER" | "ADMIN" | "MEMBER") => {
  return {
    OWNER: "拥有者",
    ADMIN: "管理员",
    MEMBER: "成员",
  }[type];
};

export const displayGroupUser = (field: keyof IGroupUser) => {
  return (
    displayGroupAccount(field as any) ||
    displayAccountUserInfo(field as any) ||
    (
      {
        name: "账户姓名",
        state: "账户状态",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayGroupUserDataList = (field: keyof IGroupUserDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayGroupUserGroupDataList = (field: keyof IGroupUserGroupDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayLinkFromType = (type: "USER" | "PLUGIN") => {
  return {
    USER: "用户",
    PLUGIN: "插件",
  }[type];
};

export const displayLinkShare = (field: keyof ILinkShare) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayLinkShareBase(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "",
        fromID: "",
        fromType: "",
        shareID: "组织 ID",
        signature: "",
        state: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayLinkShareBase = (field: keyof ILinkShareBase) => {
  return (
    {
      expiredAt: "",
      path: "",
    } as { [key: string]: string }
  )[field];
};

export const displayLinkShareDataList = (field: keyof ILinkShareDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayLinkShareWithUser = (field: keyof ILinkShareWithUser) => {
  return (
    displayLinkShare(field as any) ||
    (
      {
        user: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayLinkState = (type: "ENABLE" | "DISABLE") => {
  return {
    ENABLE: "启用",
    DISABLE: "禁用",
  }[type];
};

export const displayLinkUpload = (field: keyof ILinkUpload) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayLinkUploadBase(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "",
        fromID: "",
        fromType: "",
        signature: "",
        state: "",
        uploadID: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayLinkUploadBase = (field: keyof ILinkUploadBase) => {
  return (
    {
      expiredAt: "",
      path: "",
    } as { [key: string]: string }
  )[field];
};

export const displayLinkUploadDataList = (field: keyof ILinkUploadDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayLinkUploadWithUser = (field: keyof ILinkUploadWithUser) => {
  return (
    displayLinkUpload(field as any) ||
    (
      {
        user: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayLinkUser = (field: any) => {
  return displayAccount(field as any) || ({} as { [key: string]: string })[field];
};

export const displayObjectBindDirGroupRoleBody = (field: keyof IObjectBindDirGroupRoleBody) => {
  return (
    {
      roleType: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectBindDirUserRoleBody = (field: keyof IObjectBindDirUserRoleBody) => {
  return (
    {
      roleType: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectCreateObjectShareLinkData = (field: keyof IObjectCreateObjectShareLinkData) => {
  return (
    {
      expiredAt: "",
      isDir: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectCreateObjectUploadLinkData = (field: keyof IObjectCreateObjectUploadLinkData) => {
  return (
    {
      expiredAt: "",
      isDir: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectDirCopyBody = (field: keyof IObjectDirCopyBody) => {
  return (
    {
      newPath: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectDirMoveBody = (field: keyof IObjectDirMoveBody) => {
  return (
    {
      newPath: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectDirRenameBody = (field: keyof IObjectDirRenameBody) => {
  return (
    {
      newPath: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectDirStatisticsInfo = (field: keyof IObjectDirStatisticsInfo) => {
  return (
    {
      dirCount: "",
      fileCount: "",
      fileSize: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectObjectDataList = (field: keyof IObjectObjectDataList) => {
  return (
    {
      data: "",
      roleType: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectObjectInfo = (field: keyof IObjectObjectInfo) => {
  return (
    {
      "content-type": "",
      createdAt: "",
      isDir: "",
      name: "",
      path: "",
      sha256: "",
      size: "",
      updatedAt: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectObjectSearchDataList = (field: keyof IObjectObjectSearchDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectObjectsCopyBody = (field: keyof IObjectObjectsCopyBody) => {
  return (
    {
      file: "",
      targetPath: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectObjectsCopyParam = (field: keyof IObjectObjectsCopyParam) => {
  return (
    {
      file: "",
      targetPath: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectTriggerDirPluginBody = (field: keyof IObjectTriggerDirPluginBody) => {
  return (
    {
      name: "插件名称",
    } as { [key: string]: string }
  )[field];
};

export const displayOpenapiObjectObjectDataList = (field: keyof IOpenapiObjectObjectDataList) => {
  return (
    {
      data: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOpenapiOperationCreateOperationTaskByOpenapiBody = (
  field: keyof IOpenapiOperationCreateOperationTaskByOpenapiBody,
) => {
  return (
    {
      desc: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOpenapiOperationCreateOperationTaskRep = (field: keyof IOpenapiOperationCreateOperationTaskRep) => {
  return (
    {
      taskCode: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperation = (field: keyof IOperation) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationTime(field as any) ||
    (
      {
        IP: "",
        desc: "描述",
        operationID: "操作ID",
        operatorID: "操作者 ID",
        operatorType: "操作者类型",
        taskCode: "任务码",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayOperationLogCreateOperationTaskBody = (field: keyof IOperationLogCreateOperationTaskBody) => {
  return (
    {
      desc: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationLogCreateOperationTaskRep = (field: keyof IOperationLogCreateOperationTaskRep) => {
  return (
    {
      taskCode: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationLogOperationUndoBody = (field: keyof IOperationLogOperationUndoBody) => {
  return (
    {
      isAll: "",
      logIDs: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationOperationDataList = (field: keyof IOperationOperationDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationOperationLog = (field: keyof IOperationOperationLog) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationTime(field as any) ||
    (
      {
        IP: "IP",
        desc: "操作描述",
        logID: "",
        operationID: "操作ID",
        state: "执行状态",
        type: "操作类型",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayOperationOperationLogDataList = (field: keyof IOperationOperationLogDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationOperationState = (type: "DO" | "UNDO") => {
  return {
    DO: "执行",
    UNDO: "撤销",
  }[type];
};

export const displayOperationOperationType = (type: "OBJECT") => {
  return {
    OBJECT: "存储对象",
  }[type];
};

export const displayOperationOperationWithOperatorName = (field: keyof IOperationOperationWithOperatorName) => {
  return (
    displayOperation(field as any) ||
    (
      {
        operatorName: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayOperationOperatorType = (type: "ACCOUNT" | "GROUP" | "SHARE") => {
  return {
    ACCOUNT: "用户",
    GROUP: "组织",
    SHARE: "分享",
  }[type];
};

export const displayPlugin = (field: keyof IPlugin) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationTime(field as any) ||
    (
      {
        accountID: "操作者 ID",
        name: "插件名称",
        path: "路径",
        progress: "进展",
        signature: "",
        state: "状态",
        taskID: "任务ID",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayPluginPluginDataList = (field: keyof IPluginPluginDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayPluginPluginList = (field: keyof IPluginPluginList) => {
  return (
    {
      plugin: "",
    } as { [key: string]: string }
  )[field];
};

export const displayPluginPluginOpt = (field: keyof IPluginPluginOpt) => {
  return (
    {
      desc: "描述",
    } as { [key: string]: string }
  )[field];
};

export const displayPluginPluginWithUser = (field: keyof IPluginPluginWithUser) => {
  return (
    displayPlugin(field as any) ||
    (
      {
        user: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayPluginProgress = (field: keyof IPluginProgress) => {
  return (
    {
      message: "",
      name: "",
      progress: "",
    } as { [key: string]: string }
  )[field];
};

export const displayPluginState = (type: "PENDING" | "PROGRESS" | "FAIL" | "SUCCESS") => {
  return {
    PENDING: "待处理",
    PROGRESS: "进行中",
    FAIL: "失败",
    SUCCESS: "成功",
  }[type];
};

export const displayPluginUser = (field: any) => {
  return displayAccount(field as any) || ({} as { [key: string]: string })[field];
};

export const displayRbacAccount = (field: keyof IRbacAccount) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        accountID: "",
        dirID: "",
        roleType: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayRbacAccountFull = (field: keyof IRbacAccountFull) => {
  return (
    displayRbacAccount(field as any) ||
    (
      {
        path: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayRbacGroup = (field: keyof IRbacGroup) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        dirID: "",
        groupID: "",
        roleType: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayRbacGroupDataList = (field: keyof IRbacGroupDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayRbacGroupFull = (field: keyof IRbacGroupFull) => {
  return (
    displayRbacGroup(field as any) ||
    (
      {
        path: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayRbacGroupWithRole = (field: keyof IRbacGroupWithRole) => {
  return (
    displayGroup(field as any) ||
    (
      {
        roles: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayRbacRoleType = (type: "OWNER" | "ADMIN" | "MEMBER" | "GUEST") => {
  return {
    OWNER: "拥有者",
    ADMIN: "管理员",
    MEMBER: "成员",
    GUEST: "访问者",
  }[type];
};

export const displayRbacUserDataList = (field: keyof IRbacUserDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayRbacUserWithRole = (field: keyof IRbacUserWithRole) => {
  return (
    displayAccountUser(field as any) ||
    (
      {
        roles: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayRepositoryClientWithSecret = (field: keyof IRepositoryClientWithSecret) => {
  return (
    {
      clientID: "",
      clientSecret: "",
    } as { [key: string]: string }
  )[field];
};

export const displayServerControllerObjectCtlDirOwner = (field: keyof IServerControllerObjectCtlDirOwner) => {
  return (
    {
      accountID: "",
      name: "",
      uniqueCode: "",
    } as { [key: string]: string }
  )[field];
};

export const displayServerControllerObjectCtlObject = (field: keyof IServerControllerObjectCtlObject) => {
  return (
    displayObjectObjectInfo(field as any) ||
    (
      {
        owner: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayShareLinkPutShareStateLinkBody = (field: keyof IShareLinkPutShareStateLinkBody) => {
  return (
    {
      State: "",
    } as { [key: string]: string }
  )[field];
};

export const displayShareObjectBase = (field: keyof IShareObjectBase) => {
  return (
    {
      dir: "",
      path: "",
      sha256: "",
      size: "",
    } as { [key: string]: string }
  )[field];
};

export const displayShareObjectDataList = (field: keyof IShareObjectDataList) => {
  return (
    {
      data: "",
      total: "",
    } as { [key: string]: string }
  )[field];
};

export const displayUploadLinkPutUploadStateLinkBody = (field: keyof IUploadLinkPutUploadStateLinkBody) => {
  return (
    {
      State: "",
    } as { [key: string]: string }
  )[field];
};

export const displayUtilsDatatypesCreationTime = (field: keyof IUtilsDatatypesCreationTime) => {
  return (
    {
      createdAt: "",
    } as { [key: string]: string }
  )[field];
};

export const displayUtilsDatatypesCreationUpdationDeletionTime = (field: any) => {
  return displayUtilsDatatypesCreationUpdationTime(field as any) || ({} as { [key: string]: string })[field];
};

export const displayUtilsDatatypesCreationUpdationTime = (field: keyof IUtilsDatatypesCreationUpdationTime) => {
  return (
    displayUtilsDatatypesCreationTime(field as any) ||
    (
      {
        updatedAt: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayUtilsDatatypesPrimaryID = (field: any) => {
  return ({} as { [key: string]: string })[field];
};

export const exchange = createApiInstance<
  {
    name: string;
    code: string;
    state?: string;
  },
  IAuthToken
>("storage.Exchange", ({ name: pName, code: pCode, state: pState }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/auth-providers/${pName}/exchange`,
    query: {
      code: pCode,
      state: pState,
    },
  };
});

export const getGroup = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
  },
  IGroup
>("storage.GetGroup", ({ authorization: pAuthorization, groupID: pGroupID }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/groups/${pGroupID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const getObject = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    "image-process"?: IImageProcessProcessCondition;
  },
  null
>(
  "storage.GetObject",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, "image-process": pImageProcess }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/objects/get`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
        "image-process": pImageProcess,
      },
    };
  },
);

export const getPlugin = createApiInstance<
  {
    authorization?: string;
    taskID: IPluginTaskID;
  },
  IPlugin
>("storage.GetPlugin", ({ authorization: pAuthorization, taskID: pTaskID }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/plugins/${pTaskID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const getShareObject = createApiInstance<
  {
    shareID: ILinkShareID;
    signature: string;
    path?: string;
    sort?: IUtilsDatatypesSort;
    size?: number;
    offset?: number;
  },
  IShareObjectDataList
>(
  "storage.GetShareObject",
  ({ shareID: pShareID, signature: pSignature, path: pPath, sort: pSort, size: pSize, offset: pOffset }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/shares`,
      query: {
        shareID: pShareID,
        signature: pSignature,
        path: pPath,
        sort: pSort,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listAccount = createApiInstance<
  {
    authorization?: string;
    accountID?: IAccountAccountID | IAccountAccountID[];
    uniqueCode?: string | string[];
    identity?: string | string[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IAccountUserDataList
>(
  "storage.ListAccount",
  ({
    authorization: pAuthorization,
    accountID: pAccountID,
    uniqueCode: pUniqueCode,
    identity: pIdentity,
    name: pName,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/accounts`,
      query: {
        authorization: pAuthorization,
        accountID: pAccountID,
        uniqueCode: pUniqueCode,
        identity: pIdentity,
        name: pName,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listAccountClient = createApiInstance<
  {
    authorization?: string;
    clientID?: string | string[];
    size?: number;
    offset?: number;
  },
  IClientAccountClientDataList
>(
  "storage.ListAccountClient",
  ({ authorization: pAuthorization, clientID: pClientID, size: pSize, offset: pOffset }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/clients`,
      query: {
        authorization: pAuthorization,
        clientID: pClientID,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listAdmin = createApiInstance<
  {
    authorization?: string;
    accountID?: IAccountAccountID | IAccountAccountID[];
    uniqueCode?: string | string[];
    identity?: string | string[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IAdminUserDataList
>(
  "storage.ListAdmin",
  ({
    authorization: pAuthorization,
    accountID: pAccountID,
    uniqueCode: pUniqueCode,
    identity: pIdentity,
    name: pName,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/admins`,
      query: {
        authorization: pAuthorization,
        accountID: pAccountID,
        uniqueCode: pUniqueCode,
        identity: pIdentity,
        name: pName,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listAuthProvider = createApiInstance<void, IAuthProviderList>("storage.ListAuthProvider", () => {
  return {
    method: "GET",
    url: `/api/storage/v0/auth-providers`,
  };
});

export const listDirGroupRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    groupID?: IGroupGroupID | IGroupGroupID[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IRbacGroupDataList
>(
  "storage.ListDirGroupRole",
  ({
    authorization: pAuthorization,
    path: pPath,
    taskCode: pTaskCode,
    groupID: pGroupID,
    name: pName,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/dirs/groups`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
        groupID: pGroupID,
        name: pName,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listDirUserRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    accountID?: IAccountAccountID | IAccountAccountID[];
    uniqueCode?: string | string[];
    identity?: string | string[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IRbacUserDataList
>(
  "storage.ListDirUserRole",
  ({
    authorization: pAuthorization,
    path: pPath,
    taskCode: pTaskCode,
    accountID: pAccountID,
    uniqueCode: pUniqueCode,
    identity: pIdentity,
    name: pName,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/dirs/users`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
        accountID: pAccountID,
        uniqueCode: pUniqueCode,
        identity: pIdentity,
        name: pName,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listGroup = createApiInstance<
  {
    authorization?: string;
    groupID?: IGroupGroupID | IGroupGroupID[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IGroupGroupDataList
>(
  "storage.ListGroup",
  ({ authorization: pAuthorization, groupID: pGroupID, name: pName, size: pSize, offset: pOffset }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/groups`,
      query: {
        authorization: pAuthorization,
        groupID: pGroupID,
        name: pName,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listGroupAccount = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    accountID?: IAccountAccountID | IAccountAccountID[];
    uniqueCode?: string | string[];
    identity?: string | string[];
    name?: string | string[];
    size?: number;
    offset?: number;
    roleType?: IGroupRoleType | IGroupRoleType[];
  },
  IGroupUserDataList
>(
  "storage.ListGroupAccount",
  ({
    authorization: pAuthorization,
    groupID: pGroupID,
    accountID: pAccountID,
    uniqueCode: pUniqueCode,
    identity: pIdentity,
    name: pName,
    size: pSize,
    offset: pOffset,
    roleType: pRoleType,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/groups/${pGroupID}/accounts`,
      query: {
        authorization: pAuthorization,
        accountID: pAccountID,
        uniqueCode: pUniqueCode,
        identity: pIdentity,
        name: pName,
        size: pSize,
        offset: pOffset,
        roleType: pRoleType,
      },
    };
  },
);

export const listGroupClient = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    clientID?: string | string[];
    size?: number;
    offset?: number;
  },
  IClientGroupClientDataList
>(
  "storage.ListGroupClient",
  ({ authorization: pAuthorization, groupID: pGroupID, clientID: pClientID, size: pSize, offset: pOffset }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/groups/${pGroupID}/clients`,
      query: {
        authorization: pAuthorization,
        clientID: pClientID,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listObjects = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    keyword?: string;
    sort?: IUtilsDatatypesSort;
    size?: number;
    offset?: number;
  },
  IObjectObjectDataList
>(
  "storage.ListObjects",
  ({
    authorization: pAuthorization,
    path: pPath,
    taskCode: pTaskCode,
    keyword: pKeyword,
    sort: pSort,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/objects/list`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
        keyword: pKeyword,
        sort: pSort,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listOperation = createApiInstance<
  {
    authorization?: string;
    operationID?: IOperationOperationID | IOperationOperationID[];
    operatorID?: IDatatypesSfid | IDatatypesSfid[];
    operatorType?: IOperationOperatorType | IOperationOperatorType[];
    size?: number;
    offset?: number;
    sort?: IUtilsDatatypesSort;
    createdAt?: IUtilsDatatypesDateTimeOrRange;
    accountID?: IAccountAccountID | IAccountAccountID[];
  },
  IOperationOperationDataList
>(
  "storage.ListOperation",
  ({
    authorization: pAuthorization,
    operationID: pOperationID,
    operatorID: pOperatorID,
    operatorType: pOperatorType,
    size: pSize,
    offset: pOffset,
    sort: pSort,
    createdAt: pCreatedAt,
    accountID: pAccountID,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/operations`,
      query: {
        authorization: pAuthorization,
        operationID: pOperationID,
        operatorID: pOperatorID,
        operatorType: pOperatorType,
        size: pSize,
        offset: pOffset,
        sort: pSort,
        createdAt: pCreatedAt,
        accountID: pAccountID,
      },
    };
  },
);

export const listOperationLog = createApiInstance<
  {
    authorization?: string;
    operationID: IOperationOperationID;
    logID?: IOperationOperationLogID | IOperationOperationLogID[];
    type?: IOperationOperationType | IOperationOperationType[];
    state?: IOperationOperationState | IOperationOperationState[];
    size?: number;
    offset?: number;
    sort?: IUtilsDatatypesSort;
    createdAt?: IUtilsDatatypesDateTimeOrRange;
  },
  IOperationOperationLogDataList
>(
  "storage.ListOperationLog",
  ({
    authorization: pAuthorization,
    operationID: pOperationID,
    logID: pLogID,
    type: pType,
    state: pState,
    size: pSize,
    offset: pOffset,
    sort: pSort,
    createdAt: pCreatedAt,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/operations/${pOperationID}/logs`,
      query: {
        authorization: pAuthorization,
        logID: pLogID,
        type: pType,
        state: pState,
        size: pSize,
        offset: pOffset,
        sort: pSort,
        createdAt: pCreatedAt,
      },
    };
  },
);

export const listPlugin = createApiInstance<
  {
    authorization?: string;
    taskID?: IPluginTaskID | IPluginTaskID[];
    accountID?: IAccountAccountID | IAccountAccountID[];
    name?: string | string[];
    path?: string | string[];
    state?: IPluginState | IPluginState[];
    createdAt?: IUtilsDatatypesDateTimeOrRange;
    sort?: IUtilsDatatypesSort;
    size?: number;
    offset?: number;
  },
  IPluginPluginDataList
>(
  "storage.ListPlugin",
  ({
    authorization: pAuthorization,
    taskID: pTaskID,
    accountID: pAccountID,
    name: pName,
    path: pPath,
    state: pState,
    createdAt: pCreatedAt,
    sort: pSort,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/plugins`,
      query: {
        authorization: pAuthorization,
        taskID: pTaskID,
        accountID: pAccountID,
        name: pName,
        path: pPath,
        state: pState,
        createdAt: pCreatedAt,
        sort: pSort,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listPluginProvider = createApiInstance<
  {
    authorization?: string;
  },
  IPluginPluginList
>("storage.ListPluginProvider", ({ authorization: pAuthorization }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/plugin-providers`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const listShareLink = createApiInstance<
  {
    authorization?: string;
    accountID?: IAccountAccountID | IAccountAccountID[];
    shareID?: ILinkShareID | ILinkShareID[];
    dir?: string | string[];
    state?: ILinkState | ILinkState[];
    expiredAt?: IUtilsDatatypesDateTimeOrRange;
    sort?: IUtilsDatatypesSort;
    size?: number;
    offset?: number;
  },
  ILinkShareDataList
>(
  "storage.ListShareLink",
  ({
    authorization: pAuthorization,
    accountID: pAccountID,
    shareID: pShareID,
    dir: pDir,
    state: pState,
    expiredAt: pExpiredAt,
    sort: pSort,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/shareLinks`,
      query: {
        authorization: pAuthorization,
        accountID: pAccountID,
        shareID: pShareID,
        dir: pDir,
        state: pState,
        expiredAt: pExpiredAt,
        sort: pSort,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const listUploadLink = createApiInstance<
  {
    authorization?: string;
    accountID?: IAccountAccountID | IAccountAccountID[];
    uploadID?: ILinkUploadID | ILinkUploadID[];
    dir?: string | string[];
    state?: ILinkState | ILinkState[];
    expiredAt?: IUtilsDatatypesDateTimeOrRange;
    sort?: IUtilsDatatypesSort;
    size?: number;
    offset?: number;
  },
  ILinkUploadDataList
>(
  "storage.ListUploadLink",
  ({
    authorization: pAuthorization,
    accountID: pAccountID,
    uploadID: pUploadID,
    dir: pDir,
    state: pState,
    expiredAt: pExpiredAt,
    sort: pSort,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/uploadLinks`,
      query: {
        authorization: pAuthorization,
        accountID: pAccountID,
        uploadID: pUploadID,
        dir: pDir,
        state: pState,
        expiredAt: pExpiredAt,
        sort: pSort,
        size: pSize,
        offset: pOffset,
      },
    };
  },
);

export const objectRename = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    newpath: string;
  },
  null
>("storage.ObjectRename", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, newpath: pNewpath }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/objects/rename`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
      newpath: pNewpath,
    },
  };
});

export const objectUpload = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    "content-type": string;
    SHA256: string;
    body: any;
  },
  null
>(
  "storage.ObjectUpload",
  ({
    authorization: pAuthorization,
    path: pPath,
    taskCode: pTaskCode,
    "content-type": pContentType,
    SHA256: pSha256,
    body: pBody,
  }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/objects/upload`,
      data: pBody,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
        "content-type": pContentType,
        SHA256: pSha256,
      },
      headers: {
        "Content-Type": "application/octet-stream",
      },
    };
  },
);

export const objectsCopy = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectObjectsCopyParam;
  },
  null
>("storage.ObjectsCopy", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/objects/copy`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const objectsMove = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectObjectsCopyBody;
  },
  null
>("storage.ObjectsMove", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/objects/move`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const openAPI = createApiInstance<void, null>("storage.OpenAPI", () => {
  return {
    method: "GET",
    url: `/api/storage`,
  };
});

export const openapiListObjects = createApiInstance<
  {
    taskCode?: string;
    dir: string;
    onlyDir?: IDatatypesBool;
    uniqueCode?: string;
    keyword?: string;
    sort?: IUtilsDatatypesSort;
  },
  IOpenapiObjectObjectDataList
>(
  "storage.OpenapiListObjects",
  ({ taskCode: pTaskCode, dir: pDir, onlyDir: pOnlyDir, uniqueCode: pUniqueCode, keyword: pKeyword, sort: pSort }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/openapi/objects`,
      query: {
        taskCode: pTaskCode,
        dir: pDir,
        onlyDir: pOnlyDir,
        uniqueCode: pUniqueCode,
        keyword: pKeyword,
        sort: pSort,
      },
    };
  },
);

export const openapiObjectCheck = createApiInstance<
  {
    taskCode?: string;
    sha256: string;
  },
  null
>("storage.OpenapiObjectCheck", ({ taskCode: pTaskCode, sha256: pSha256 }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/openapi/objects/check`,
    query: {
      taskCode: pTaskCode,
      sha256: pSha256,
    },
  };
});

export const openapiObjectUpload = createApiInstance<
  {
    taskCode?: string;
    "content-type": string;
    SHA256: string;
    Path: string;
    body: any;
  },
  null
>(
  "storage.OpenapiObjectUpload",
  ({ taskCode: pTaskCode, "content-type": pContentType, SHA256: pSha256, Path: pPath, body: pBody }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/openapi/objects`,
      data: pBody,
      query: {
        taskCode: pTaskCode,
        "content-type": pContentType,
        SHA256: pSha256,
        Path: pPath,
      },
      headers: {
        "Content-Type": "application/octet-stream",
      },
    };
  },
);

export const openapiOpenapiGetObject = createApiInstance<
  {
    taskCode?: string;
    path: string;
    imageProcess?: IImageProcessProcessCondition;
  },
  null
>("storage.OpenapiOpenapiGetObject", ({ taskCode: pTaskCode, path: pPath, imageProcess: pImageProcess }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/openapi/objects/get`,
    query: {
      taskCode: pTaskCode,
      path: pPath,
      imageProcess: pImageProcess,
    },
  };
});

export const operationUndo = createApiInstance<
  {
    authorization?: string;
    operationID: IOperationOperationID;
    body: IOperationLogOperationUndoBody;
  },
  null
>("storage.OperationUndo", ({ authorization: pAuthorization, operationID: pOperationID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/operations/${pOperationID}/undo`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const pluginCallback = createApiInstance<
  {
    signature: string;
    taskID: IPluginTaskID;
    step: string;
    body: ICallbackPluginCallbackBody;
  },
  null
>("storage.PluginCallback", ({ signature: pSignature, taskID: pTaskID, step: pStep, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/callback/plugin`,
    data: pBody,
    query: {
      signature: pSignature,
      taskID: pTaskID,
      step: pStep,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const putAccountClient = createApiInstance<
  {
    authorization?: string;
    clientID: string;
    body: IClientClientInfo;
  },
  null
>("storage.PutAccountClient", ({ authorization: pAuthorization, clientID: pClientID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/clients/${pClientID}`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const putAccountState = createApiInstance<
  {
    authorization?: string;
    accountID: IAccountAccountID;
    body: IAccountPutAccountStateBody;
  },
  null
>("storage.PutAccountState", ({ authorization: pAuthorization, accountID: pAccountID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/accounts/${pAccountID}`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const putAdmin = createApiInstance<
  {
    authorization?: string;
    accountID: IAccountAccountID;
  },
  null
>("storage.PutAdmin", ({ authorization: pAuthorization, accountID: pAccountID }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/admins/${pAccountID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const putGroupClient = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    clientID: string;
    body: IClientClientInfo;
  },
  null
>(
  "storage.PutGroupClient",
  ({ authorization: pAuthorization, groupID: pGroupID, clientID: pClientID, body: pBody }) => {
    return {
      method: "PUT",
      url: `/api/storage/v0/groups/${pGroupID}/clients/${pClientID}`,
      data: pBody,
      query: {
        authorization: pAuthorization,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
);

export const putShareLinkState = createApiInstance<
  {
    authorization?: string;
    shareID: ILinkShareID;
    body: IShareLinkPutShareStateLinkBody;
  },
  null
>("storage.PutShareLinkState", ({ authorization: pAuthorization, shareID: pShareID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/shareLinks/${pShareID}/state`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const putUploadLinkState = createApiInstance<
  {
    authorization?: string;
    uploadID: ILinkUploadID;
    body: IUploadLinkPutUploadStateLinkBody;
  },
  null
>("storage.PutUploadLinkState", ({ authorization: pAuthorization, uploadID: pUploadID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/uploadLinks/${pUploadID}/state`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const refreshAccountClientSecret = createApiInstance<
  {
    authorization?: string;
    clientID: string;
  },
  IRepositoryClientWithSecret
>("storage.RefreshAccountClientSecret", ({ authorization: pAuthorization, clientID: pClientID }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/clients/${pClientID}/refresh-secret`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const refreshGroupClientSecret = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    clientID: string;
  },
  IRepositoryClientWithSecret
>("storage.RefreshGroupClientSecret", ({ authorization: pAuthorization, groupID: pGroupID, clientID: pClientID }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/groups/${pGroupID}/clients/${pClientID}/refresh-secret`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const refreshToken = createApiInstance<
  {
    body: IAuthRefreshTokenBody;
  },
  IAuthToken
>("storage.RefreshToken", ({ body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/refresh-token`,
    data: pBody,
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const triggerDirPlugin = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    body: IObjectTriggerDirPluginBody;
  },
  IPlugin
>("storage.TriggerDirPlugin", ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/dirs/plugin`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
      taskCode: pTaskCode,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const unBindDirGroupRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    groupID: IGroupGroupID;
  },
  null
>(
  "storage.UnBindDirGroupRole",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, groupID: pGroupID }) => {
    return {
      method: "DELETE",
      url: `/api/storage/v0/dirs/groups/${pGroupID}/roles`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
      },
    };
  },
);

export const unBindDirUserRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    taskCode?: string;
    accountID: IAccountAccountID;
  },
  null
>(
  "storage.UnBindDirUserRole",
  ({ authorization: pAuthorization, path: pPath, taskCode: pTaskCode, accountID: pAccountID }) => {
    return {
      method: "DELETE",
      url: `/api/storage/v0/dirs/users/${pAccountID}/roles`,
      query: {
        authorization: pAuthorization,
        path: pPath,
        taskCode: pTaskCode,
      },
    };
  },
);

export const unBindGroupAccount = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    accountID: IAccountAccountID;
  },
  null
>("storage.UnBindGroupAccount", ({ authorization: pAuthorization, groupID: pGroupID, accountID: pAccountID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/groups/${pGroupID}/accounts/${pAccountID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const updateGroup = createApiInstance<
  {
    authorization?: string;
    groupID: IGroupGroupID;
    body: IGroupGroupBase;
  },
  null
>("storage.UpdateGroup", ({ authorization: pAuthorization, groupID: pGroupID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/groups/${pGroupID}`,
    data: pBody,
    query: {
      authorization: pAuthorization,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const uploadByLinkUpload = createApiInstance<
  {
    uploadID: ILinkUploadID;
    signature: string;
    path: string;
    "content-type": string;
    sha256?: string;
    force?: IDatatypesBool;
    body: any;
  },
  null
>(
  "storage.UploadByLinkUpload",
  ({
    uploadID: pUploadID,
    signature: pSignature,
    path: pPath,
    "content-type": pContentType,
    sha256: pSha256,
    force: pForce,
    body: pBody,
  }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/uploads`,
      data: pBody,
      query: {
        uploadID: pUploadID,
        signature: pSignature,
        path: pPath,
        sha256: pSha256,
        force: pForce,
      },
      headers: {
        "content-type": pContentType,
        "Content-Type": "application/octet-stream",
      },
    };
  },
);

export enum AccountState {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum GroupRoleType {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum LinkFromType {
  USER = "USER",
  PLUGIN = "PLUGIN",
}

export enum LinkState {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum OperationOperationState {
  DO = "DO",
  UNDO = "UNDO",
}

export enum OperationOperationType {
  OBJECT = "OBJECT",
}

export enum OperationOperatorType {
  ACCOUNT = "ACCOUNT",
  GROUP = "GROUP",
  SHARE = "SHARE",
}

export enum PluginState {
  PENDING = "PENDING",
  PROGRESS = "PROGRESS",
  FAIL = "FAIL",
  SUCCESS = "SUCCESS",
}

export enum RbacRoleType {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export interface IAccount extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  name: string;
  state: IAccountState;
  uniqueCode: string;
}

export interface IAccountPutAccountStateBody {
  state: IAccountState;
}

export interface IAccountUser extends IAccount, IAccountUserInfo {}

export interface IAccountUserDataList {
  data: IAccountUser[];
  total: number;
}

export interface IAccountUserInfo {
  email?: string;
  mobile?: string;
  nickname?: string;
}

export interface IAccountVendorIdentity extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  vendorIdentity: string;
  vendorIdentityDisplay: string;
  vendorIdentityFrom: string;
}

export interface IAdmin extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
}

export interface IAdminUser extends IAdmin, IAccountUserInfo {
  name: string;
  state: IAccountState;
}

export interface IAdminUserDataList {
  data: IAdminUser[];
  total: number;
}

export interface IAuthProviderList {
  providers: {
    [k: string]: IAuthProviderOpt;
  };
}

export interface IAuthProviderOpt {
  autoTriggerWhenUserAgent?: string;
  buttonImageURL: string;
  desc?: string;
  priority?: number;
}

export interface IAuthRefreshTokenBody {
  refresh_token: string;
}

export interface IAuthToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  type: string;
}

export interface ICallbackPluginCallbackBody {
  message?: string;
  progress?: number;
  state: IPluginState;
}

export interface IClientAccountClient
  extends IUtilsDatatypesPrimaryID,
    IClientClientInfo,
    IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  clientID: string;
}

export interface IClientAccountClientDataList {
  data: IClientAccountClient[];
  total: number;
}

export interface IClientClientInfo {
  desc: string;
  whiteList?: IClientWhiteList;
}

export interface IClientGroupClient
  extends IUtilsDatatypesPrimaryID,
    IClientClientInfo,
    IUtilsDatatypesCreationUpdationDeletionTime {
  clientID: string;
  groupID: IGroupGroupID;
}

export interface IClientGroupClientDataList {
  data: IClientGroupClient[];
  total: number;
}

export interface IGroup extends IUtilsDatatypesPrimaryID, IGroupGroupBase, IUtilsDatatypesCreationUpdationDeletionTime {
  groupID: IGroupGroupID;
}

export interface IGroupAccount extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  groupID: IGroupGroupID;
  roleType: IGroupRoleType;
}

export interface IGroupGroupAccountBindGroupAccountBody {
  roleType: IGroupRoleType;
}

export interface IGroupGroupBase {
  desc?: string;
  name: string;
}

export interface IGroupGroupDataList {
  data: IGroup[];
  total: number;
}

export interface IGroupGroupWithRole extends IGroup {
  roleType: IGroupRoleType;
}

export interface IGroupUser extends IGroupAccount, IAccountUserInfo {
  name: string;
  state: IAccountState;
}

export interface IGroupUserDataList {
  data: IGroupUser[];
  total: number;
}

export interface IGroupUserGroupDataList {
  data: IGroupGroupWithRole[];
  total: number;
}

export interface ILinkShare
  extends IUtilsDatatypesPrimaryID,
    ILinkShareBase,
    IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  fromID: IDatatypesSfid;
  fromType: ILinkFromType;
  shareID: ILinkShareID;
  signature: string;
  state: ILinkState;
}

export interface ILinkShareBase {
  expiredAt: IDatatypesTimestamp;
  path: string;
}

export interface ILinkShareDataList {
  data: ILinkShareWithUser[];
  total: number;
}

export interface ILinkShareWithUser extends ILinkShare {
  user: ILinkUser;
}

export interface ILinkUpload
  extends IUtilsDatatypesPrimaryID,
    ILinkUploadBase,
    IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  fromID: IDatatypesSfid;
  fromType: ILinkFromType;
  signature: string;
  state: ILinkState;
  uploadID: ILinkUploadID;
}

export interface ILinkUploadBase {
  expiredAt: IDatatypesTimestamp;
  path: string;
}

export interface ILinkUploadDataList {
  data: ILinkUploadWithUser[];
  total: number;
}

export interface ILinkUploadWithUser extends ILinkUpload {
  user: ILinkUser;
}

export interface ILinkUser extends IAccount {}

export interface IObjectBindDirGroupRoleBody {
  roleType: IRbacRoleType;
}

export interface IObjectBindDirUserRoleBody {
  roleType: IRbacRoleType;
}

export interface IObjectCreateObjectShareLinkData {
  expiredAt: IDatatypesTimestamp;
  isDir: IDatatypesBool;
}

export interface IObjectCreateObjectUploadLinkData {
  expiredAt: IDatatypesTimestamp;
  isDir: IDatatypesBool;
}

export interface IObjectDirCopyBody {
  newPath: string;
}

export interface IObjectDirMoveBody {
  newPath: string;
}

export interface IObjectDirRenameBody {
  newPath: string;
}

export interface IObjectDirStatisticsInfo {
  dirCount: number;
  fileCount: number;
  fileSize: number;
}

export interface IObjectObjectDataList {
  data: IServerControllerObjectCtlObject[];
  roleType?: IRbacRoleType;
  total: number;
}

export interface IObjectObjectInfo {
  "content-type": string;
  createdAt: number;
  isDir: IDatatypesBool;
  name: string;
  path: string;
  sha256: string;
  size: number;
  updatedAt: number;
}

export interface IObjectObjectSearchDataList {
  data: IObjectObjectInfo[];
  total: number;
}

export interface IObjectObjectsCopyBody {
  file: string[];
  targetPath: string;
}

export interface IObjectObjectsCopyParam {
  file: string[];
  targetPath: string;
}

export interface IObjectTriggerDirPluginBody {
  name: string;
}

export interface IOpenapiObjectObjectDataList {
  data: IServerControllerObjectCtlObject[];
}

export interface IOpenapiOperationCreateOperationTaskByOpenapiBody {
  desc: string;
}

export interface IOpenapiOperationCreateOperationTaskRep {
  taskCode: string;
}

export interface IOperation extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationTime {
  IP: string;
  desc: string;
  operationID: IOperationOperationID;
  operatorID: IDatatypesSfid;
  operatorType: IOperationOperatorType;
  taskCode: string;
}

export interface IOperationLogCreateOperationTaskBody {
  desc: string;
}

export interface IOperationLogCreateOperationTaskRep {
  taskCode: string;
}

export interface IOperationLogOperationUndoBody {
  isAll?: IDatatypesBool;
  logIDs?: IOperationOperationLogID[];
}

export interface IOperationOperationDataList {
  data: IOperationOperationWithOperatorName[];
  total: number;
}

export interface IOperationOperationLog extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationTime {
  IP: string;
  desc: IOperationText;
  logID: IOperationOperationLogID;
  operationID: IOperationOperationID;
  state: IOperationOperationState;
  type: IOperationOperationType;
}

export interface IOperationOperationLogDataList {
  data: IOperationOperationLog[];
  total: number;
}

export interface IOperationOperationWithOperatorName extends IOperation {
  operatorName: string;
}

export interface IPlugin extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationTime {
  accountID: IAccountAccountID;
  name: string;
  path: string;
  progress: IPluginProgresses;
  signature: string;
  state: IPluginState;
  taskID: IPluginTaskID;
}

export interface IPluginPluginDataList {
  data: IPluginPluginWithUser[];
  total: number;
}

export interface IPluginPluginList {
  plugin: {
    [k: string]: IPluginPluginOpt;
  };
}

export interface IPluginPluginOpt {
  desc?: string;
}

export interface IPluginPluginWithUser extends IPlugin {
  user: IPluginUser;
}

export interface IPluginProgress {
  message: string;
  name: string;
  progress: number;
}

export interface IPluginUser extends IAccount {}

export interface IRbacAccount extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationDeletionTime {
  accountID: IAccountAccountID;
  dirID: IObjectDirID;
  roleType: IRbacRoleType;
}

export interface IRbacAccountFull extends IRbacAccount {
  path: string;
}

export interface IRbacGroup extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationDeletionTime {
  dirID: IObjectDirID;
  groupID: IGroupGroupID;
  roleType: IRbacRoleType;
}

export interface IRbacGroupDataList {
  data: IRbacGroupWithRole[];
  total: number;
}

export interface IRbacGroupFull extends IRbacGroup {
  path: string;
}

export interface IRbacGroupWithRole extends IGroup {
  roles: IRbacGroupFull[];
}

export interface IRbacUserDataList {
  data: IRbacUserWithRole[];
  total: number;
}

export interface IRbacUserWithRole extends IAccountUser {
  roles: IRbacAccountFull[];
}

export interface IRepositoryClientWithSecret {
  clientID: string;
  clientSecret: string;
}

export interface IServerControllerObjectCtlDirOwner {
  accountID: IAccountAccountID;
  name: string;
  uniqueCode: string;
}

export interface IServerControllerObjectCtlObject extends IObjectObjectInfo {
  owner?: IServerControllerObjectCtlDirOwner;
}

export interface IShareLinkPutShareStateLinkBody {
  State: ILinkState;
}

export interface IShareObjectBase {
  dir: IDatatypesBool;
  path: string;
  sha256?: string;
  size?: number;
}

export interface IShareObjectDataList {
  data: IShareObjectBase[];
  total: number;
}

export interface IUploadLinkPutUploadStateLinkBody {
  State: ILinkState;
}

export interface IUtilsDatatypesCreationTime {
  createdAt: IDatatypesTimestamp;
}

export interface IUtilsDatatypesCreationUpdationDeletionTime extends IUtilsDatatypesCreationUpdationTime {}

export interface IUtilsDatatypesCreationUpdationTime extends IUtilsDatatypesCreationTime {
  updatedAt: IDatatypesTimestamp;
}

export interface IUtilsDatatypesPrimaryID {}

export type IAccountAccountID = string;

export type IAccountState = keyof typeof AccountState;

export type IAuthOperatorCurrentUser = IAccountUser & {
  isAdmin: boolean;
} & any;

export type IClientWhiteList = string[];

export type IDatatypesBool = boolean;

export type IDatatypesSfid = string;

export type IDatatypesTimestamp = string;

export type IGroupGroupID = string;

export type IGroupRoleType = keyof typeof GroupRoleType;

export type IImageProcessProcessCondition = string;

export type ILinkFromType = keyof typeof LinkFromType;

export type ILinkShareID = string;

export type ILinkState = keyof typeof LinkState;

export type ILinkUploadID = string;

export type IObjectDirID = string;

export type IOperationOperationID = string;

export type IOperationOperationLogID = string;

export type IOperationOperationState = keyof typeof OperationOperationState;

export type IOperationOperationType = keyof typeof OperationOperationType;

export type IOperationOperatorType = keyof typeof OperationOperatorType;

export type IOperationText = string;

export type IPluginProgresses = IPluginProgress[];

export type IPluginState = keyof typeof PluginState;

export type IPluginTaskID = string;

export type IRbacRoleType = keyof typeof RbacRoleType;

export type IUtilsDatatypesDateTimeOrRange = string;

export type IUtilsDatatypesSort = string;
