import { useAuthStore } from "@/features/auth/auth.store";

export const PERMISSIONS = {
  users: {
    view: "admin:users:view",
    ban: "admin:users:ban",
    unban: "admin:users:unban",
    suspend: "admin:users:suspend",
    activate: "admin:users:activate",
    delete: "admin:users:delete",
  },
  providers: {
    view: "admin:providers:view",
    approve: "admin:providers:approve",
    reject: "admin:providers:reject",
    verify: "admin:providers:verify",
    block: "admin:providers:block",
    unblock: "admin:providers:unblock",
  },
  countries: {
    view: "admin:countries:view",
    create: "admin:countries:create",
    update: "admin:countries:update",
    delete: "admin:countries:delete",
  },
  categories: {
    view: "admin:categories:view",
    create: "admin:categories:create",
    update: "admin:categories:update",
    delete: "admin:categories:delete",
  },
  subCategories: {
    view: "admin:sub-categories:view",
    create: "admin:sub-categories:create",
    update: "admin:sub-categories:update",
    delete: "admin:sub-categories:delete",
  },
  roles: {
    view: "admin:roles:view",
    create: "admin:roles:create",
    update: "admin:roles:update",
    delete: "admin:roles:delete",
  },
  admins: {
    view: "admin:admins:view",
    create: "admin:admins:create",
    update: "admin:admins:update",
    delete: "admin:admins:delete",
  },
  complaints: {
    view: "admin:complaints:view",
    start: "admin:complaints:start",
    resolve: "admin:complaints:resolve",
    reject: "admin:complaints:reject",
    addNote: "admin:complaints:addNote",
    sendNotification: "admin:complaints:sendNotification",
    closeConversation: "admin:complaints:closeConversation",
    createType: "admin:complaints:createType",
    updateType: "admin:complaints:updateType",
    deleteType: "admin:complaints:deleteType",
  },
  contactMessages: {
    view: "admin:contact-messages:view",
    update: "admin:contact-messages:update",
  },
  settings: {
    view: "admin:settings:view",
    update: "admin:settings:update",
  },
  shows: {
    view: "admin:shows:view",
    update: "admin:shows:update",
  },
  wallets: {
    view: "admin:wallets:view",
  },
  withdrawals: {
    view: "admin:withdrawals:view",
    approve: "admin:withdrawals:approve",
    reject: "admin:withdrawals:reject",
  },
  notifications: {
    broadcast: "admin:notifications:broadcast",
  },
  reports: {
    view: "admin:reports:view",
  },
} as const;

// For each group K, collect the union of its values; then union across all groups.
type FlattenPermissions<T> = { [K in keyof T]: T[K][keyof T[K]] }[keyof T];

export type Permission = FlattenPermissions<typeof PERMISSIONS>;

export function can(permissions: string[], required: Permission): boolean {
  return permissions.includes(required);
}

/** Whether an admin with these grants may open something gated by `permission`; ungated is allowed. */
export function permissionCheck(
  permissions: string[],
  isSuperAdmin: boolean | undefined,
): (permission?: Permission) => boolean {
  return (permission) => !permission || !!isSuperAdmin || can(permissions, permission);
}

/** The signed-in admin's grant test, for filtering many gated items at once. */
export function usePermissionCheck(): (permission?: Permission) => boolean {
  const permissions = useAuthStore((s) => s.permissions);
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin);
  return permissionCheck(permissions, isSuperAdmin);
}

export function usePermission(permission: Permission): boolean {
  return usePermissionCheck()(permission);
}
