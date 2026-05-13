import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  listRoles,
  getRolePermissionModules,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  type ListRolesParams,
  type CreateRolePayload,
  type UpdateRolePayload,
} from '@/features/roles/roles.api'

const baseRoleKeys = createResourceKeys<ListRolesParams>('roles')
export const roleKeys = {
  ...baseRoleKeys,
  permissionModules: () => ['roles', 'permission-modules'] as const,
}

export function useRolesQuery(params: ListRolesParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => listRoles(params),
  })
}

export function useRolePermissionModulesQuery(enabled = true) {
  return useQuery({
    queryKey: roleKeys.permissionModules(),
    queryFn: () => getRolePermissionModules(),
    staleTime: 1000 * 60 * 30,
    enabled,
  })
}

export function useRoleDetailQuery(roleId: string, enabled = true) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => getRole(roleId),
    enabled: !!roleId && enabled,
  })
}

export function useCreateRoleMutation() {
  return useResourceMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    invalidate: [roleKeys.all],
    successKey: 'roles:actions.create_success',
    errorKey: 'roles:errors.generic',
  })
}

export function useUpdateRoleMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    invalidate: [roleKeys.all],
    successKey: 'roles:actions.update_success',
    errorKey: 'roles:errors.generic',
  })
}

export function useDeleteRoleMutation() {
  return useResourceMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    invalidate: [roleKeys.all],
    successKey: 'roles:actions.delete_success',
    errorKey: 'roles:errors.delete_failed',
  })
}
