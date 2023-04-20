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
    groupID: IGroupGroupID;
    body: IObjectBindDirGroupRoleBody;
  },
  null
>("storage.BindDirGroupRole", ({ authorization: pAuthorization, path: pPath, groupID: pGroupID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/groups/${pGroupID}/roles`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const bindDirUserRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    accountID: IAccountAccountID;
    body: IObjectBindDirUserRoleBody;
  },
  null
>("storage.BindDirUserRole", ({ authorization: pAuthorization, path: pPath, accountID: pAccountID, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/users/${pAccountID}/roles`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };
});

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
    SHA256: string;
  },
  null
>("storage.CheckObject", ({ authorization: pAuthorization, path: pPath, SHA256: pSha256 }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/objects/check`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      SHA256: pSha256,
    },
  };
});

export const createClient = createApiInstance<
  {
    authorization?: string;
    clientID: string;
    body: IClientClientInfo;
  },
  IRepositoryClientWithSecret
>("storage.CreateClient", ({ authorization: pAuthorization, clientID: pClientID, body: pBody }) => {
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
  },
  null
>("storage.CreateDir", ({ authorization: pAuthorization, path: pPath }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/dirs/create`,
    query: {
      authorization: pAuthorization,
      path: pPath,
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

export const deleteClient = createApiInstance<
  {
    authorization?: string;
    clientID: string;
  },
  null
>("storage.DeleteClient", ({ authorization: pAuthorization, clientID: pClientID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/clients/${pClientID}`,
    query: {
      authorization: pAuthorization,
    },
  };
});

export const deleteDir = createApiInstance<
  {
    authorization?: string;
    path: string;
  },
  null
>("storage.DeleteDir", ({ authorization: pAuthorization, path: pPath }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/dirs/delete`,
    query: {
      authorization: pAuthorization,
      path: pPath,
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

export const deleteObject = createApiInstance<
  {
    authorization?: string;
    path: string;
    file: string | string[];
  },
  null
>("storage.DeleteObject", ({ authorization: pAuthorization, path: pPath, file: pFile }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/objects/delete`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      file: pFile,
    },
  };
});

export const dirCopy = createApiInstance<
  {
    authorization?: string;
    path: string;
    body: IObjectDirCopyBody;
  },
  null
>("storage.DirCopy", ({ authorization: pAuthorization, path: pPath, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/copy`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
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
    body: IObjectDirMoveBody;
  },
  null
>("storage.DirMove", ({ authorization: pAuthorization, path: pPath, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/move`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
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
    body: IObjectDirRenameBody;
  },
  null
>("storage.DirRename", ({ authorization: pAuthorization, path: pPath, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/dirs/rename`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
    },
    headers: {
      "Content-Type": "application/json",
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

export const displayClient = (field: keyof IClient) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayClientClientInfo(field as any) ||
    displayUtilsDatatypesCreationUpdationDeletionTime(field as any) ||
    (
      {
        clientID: "",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayClientClientDataList = (field: keyof IClientClientDataList) => {
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

export const displayObjectObjectDataList = (field: keyof IObjectObjectDataList) => {
  return (
    {
      data: "",
      roleType: "",
    } as { [key: string]: string }
  )[field];
};

export const displayObjectObjectInfo = (field: keyof IObjectObjectInfo) => {
  return (
    {
      SHA256: "",
      "content-type": "",
      isDir: "",
      name: "",
      path: "",
      size: "",
      updatedAt: "",
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

export const displayOpenapiObjectDataList = (field: keyof IOpenapiObjectDataList) => {
  return (
    {
      data: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationLogOperationUndoBody = (field: keyof IOperationLogOperationUndoBody) => {
  return (
    {
      operationID: "",
    } as { [key: string]: string }
  )[field];
};

export const displayOperationOperationLog = (field: keyof IOperationOperationLog) => {
  return (
    displayUtilsDatatypesPrimaryID(field as any) ||
    displayUtilsDatatypesCreationUpdationTime(field as any) ||
    (
      {
        accountID: "操作人",
        desc: "操作描述",
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

export const displayOperationOperationLogWithUser = (field: keyof IOperationOperationLogWithUser) => {
  return (
    displayOperationOperationLog(field as any) ||
    (
      {
        userName: "账户姓名",
        userState: "账户状态",
      } as { [key: string]: string }
    )[field]
  );
};

export const displayOperationOperationType = (type: "OBJECT") => {
  return {
    OBJECT: "存储对象",
  }[type];
};

export const displayOperationState = (type: "DO" | "UNDO") => {
  return {
    DO: "执行",
    UNDO: "撤销",
  }[type];
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
    "image-process"?: IImageProcessProcessCondition;
  },
  null
>("storage.GetObject", ({ authorization: pAuthorization, path: pPath, "image-process": pImageProcess }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/objects/get`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      "image-process": pImageProcess,
    },
  };
});

export const listAccount = createApiInstance<
  {
    authorization?: string;
    accountID?: IAccountAccountID | IAccountAccountID[];
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
        identity: pIdentity,
        name: pName,
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

export const listClient = createApiInstance<
  {
    authorization?: string;
    clientID?: string | string[];
    size?: number;
    offset?: number;
  },
  IClientClientDataList
>("storage.ListClient", ({ authorization: pAuthorization, clientID: pClientID, size: pSize, offset: pOffset }) => {
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
});

export const listDirGroupRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    groupID?: IGroupGroupID | IGroupGroupID[];
    name?: string | string[];
    size?: number;
    offset?: number;
  },
  IRbacGroupDataList
>(
  "storage.ListDirGroupRole",
  ({ authorization: pAuthorization, path: pPath, groupID: pGroupID, name: pName, size: pSize, offset: pOffset }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/dirs/groups`,
      query: {
        authorization: pAuthorization,
        path: pPath,
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
    accountID?: IAccountAccountID | IAccountAccountID[];
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
    accountID: pAccountID,
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
        accountID: pAccountID,
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
        identity: pIdentity,
        name: pName,
        size: pSize,
        offset: pOffset,
        roleType: pRoleType,
      },
    };
  },
);

export const listObjects = createApiInstance<
  {
    authorization?: string;
    path: string;
  },
  IObjectObjectDataList
>("storage.ListObjects", ({ authorization: pAuthorization, path: pPath }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/objects/list`,
    query: {
      authorization: pAuthorization,
      path: pPath,
    },
  };
});

export const listOperationLog = createApiInstance<
  {
    authorization?: string;
    operationID?: IOperationOperationID | IOperationOperationID[];
    accountID?: IAccountAccountID | IAccountAccountID[];
    type?: IOperationOperationType | IOperationOperationType[];
    size?: number;
    offset?: number;
  },
  IOperationOperationLogDataList
>(
  "storage.ListOperationLog",
  ({
    authorization: pAuthorization,
    operationID: pOperationID,
    accountID: pAccountID,
    type: pType,
    size: pSize,
    offset: pOffset,
  }) => {
    return {
      method: "GET",
      url: `/api/storage/v0/operation-logs`,
      query: {
        authorization: pAuthorization,
        operationID: pOperationID,
        accountID: pAccountID,
        type: pType,
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
    newpath: string;
  },
  null
>("storage.ObjectRename", ({ authorization: pAuthorization, path: pPath, newpath: pNewpath }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/objects/rename`,
    query: {
      authorization: pAuthorization,
      path: pPath,
      newpath: pNewpath,
    },
  };
});

export const objectUpload = createApiInstance<
  {
    authorization?: string;
    path: string;
    "content-type": string;
    SHA256: string;
    body: any;
  },
  null
>(
  "storage.ObjectUpload",
  ({ authorization: pAuthorization, path: pPath, "content-type": pContentType, SHA256: pSha256, body: pBody }) => {
    return {
      method: "POST",
      url: `/api/storage/v0/objects/upload`,
      data: pBody,
      query: {
        authorization: pAuthorization,
        path: pPath,
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
    body: IObjectObjectsCopyParam;
  },
  null
>("storage.ObjectsCopy", ({ authorization: pAuthorization, path: pPath, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/objects/copy`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
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
    body: IObjectObjectsCopyBody;
  },
  null
>("storage.ObjectsMove", ({ authorization: pAuthorization, path: pPath, body: pBody }) => {
  return {
    method: "POST",
    url: `/api/storage/v0/objects/move`,
    data: pBody,
    query: {
      authorization: pAuthorization,
      path: pPath,
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

export const openapiGetObject = createApiInstance<
  {
    path: string;
    "image-process"?: IImageProcessProcessCondition;
  },
  null
>("storage.OpenapiGetObject", ({ path: pPath, "image-process": pImageProcess }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/openapi/objects/get`,
    query: {
      path: pPath,
      "image-process": pImageProcess,
    },
  };
});

export const openapiListObjects = createApiInstance<
  {
    dir: string;
    onlyDir?: IDatatypesBool;
  },
  IOpenapiObjectDataList
>("storage.OpenapiListObjects", ({ dir: pDir, onlyDir: pOnlyDir }) => {
  return {
    method: "GET",
    url: `/api/storage/v0/openapi/objects/list`,
    query: {
      dir: pDir,
      onlyDir: pOnlyDir,
    },
  };
});

export const operationUndo = createApiInstance<
  {
    authorization?: string;
    body: IOperationLogOperationUndoBody;
  },
  null
>("storage.OperationUndo", ({ authorization: pAuthorization, body: pBody }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/operation-logs/undo`,
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

export const putClient = createApiInstance<
  {
    authorization?: string;
    clientID: string;
    body: IClientClientInfo;
  },
  null
>("storage.PutClient", ({ authorization: pAuthorization, clientID: pClientID, body: pBody }) => {
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

export const refreshClientSecret = createApiInstance<
  {
    authorization?: string;
    clientID: string;
  },
  IRepositoryClientWithSecret
>("storage.RefreshClientSecret", ({ authorization: pAuthorization, clientID: pClientID }) => {
  return {
    method: "PUT",
    url: `/api/storage/v0/clients/${pClientID}/refresh-secret`,
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

export const unBindDirGroupRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    groupID: IGroupGroupID;
  },
  null
>("storage.UnBindDirGroupRole", ({ authorization: pAuthorization, path: pPath, groupID: pGroupID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/dirs/groups/${pGroupID}/roles`,
    query: {
      authorization: pAuthorization,
      path: pPath,
    },
  };
});

export const unBindDirUserRole = createApiInstance<
  {
    authorization?: string;
    path: string;
    accountID: IAccountAccountID;
  },
  null
>("storage.UnBindDirUserRole", ({ authorization: pAuthorization, path: pPath, accountID: pAccountID }) => {
  return {
    method: "DELETE",
    url: `/api/storage/v0/dirs/users/${pAccountID}/roles`,
    query: {
      authorization: pAuthorization,
      path: pPath,
    },
  };
});

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

export enum AccountState {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum GroupRoleType {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum OperationOperationType {
  OBJECT = "OBJECT",
}

export enum OperationState {
  DO = "DO",
  UNDO = "UNDO",
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

export interface IClient
  extends IUtilsDatatypesPrimaryID,
    IClientClientInfo,
    IUtilsDatatypesCreationUpdationDeletionTime {
  clientID: string;
}

export interface IClientClientDataList {
  data: IClient[];
  total: number;
}

export interface IClientClientInfo {
  desc: string;
  whiteList?: IClientWhiteList;
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

export interface IObjectBindDirGroupRoleBody {
  roleType: IRbacRoleType;
}

export interface IObjectBindDirUserRoleBody {
  roleType: IRbacRoleType;
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

export interface IObjectObjectDataList {
  data: IObjectObjectInfo[];
  roleType?: IRbacRoleType;
}

export interface IObjectObjectInfo {
  SHA256: string;
  "content-type": string;
  isDir: IDatatypesBool;
  name: string;
  path: string;
  size: number;
  updatedAt: number;
}

export interface IObjectObjectsCopyBody {
  file: string[];
  targetPath: string;
}

export interface IObjectObjectsCopyParam {
  file: string[];
  targetPath: string;
}

export interface IOpenapiObjectDataList {
  data: IObjectObjectInfo[];
}

export interface IOperationLogOperationUndoBody {
  operationID: IOperationOperationID[];
}

export interface IOperationOperationLog extends IUtilsDatatypesPrimaryID, IUtilsDatatypesCreationUpdationTime {
  accountID: IAccountAccountID;
  desc: IOperationText;
  operationID: IOperationOperationID;
  state: IOperationState;
  type: IOperationOperationType;
}

export interface IOperationOperationLogDataList {
  data: IOperationOperationLogWithUser[];
  total: number;
}

export interface IOperationOperationLogWithUser extends IOperationOperationLog {
  userName: string;
  userState: IAccountState;
}

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

export type IDatatypesBool = string;

export type IDatatypesTimestamp = string;

export type IGroupGroupID = string;

export type IGroupRoleType = keyof typeof GroupRoleType;

export type IImageProcessProcessCondition = string;

export type IObjectDirID = string;

export type IOperationOperationID = string;

export type IOperationOperationType = keyof typeof OperationOperationType;

export type IOperationState = keyof typeof OperationState;

export type IOperationText = string;

export type IRbacRoleType = keyof typeof RbacRoleType;
