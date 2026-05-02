import axios from 'axios'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
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

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params: ListRolesParams) => [...roleKeys.lists(), params] as const,
  permissionModules: () => [...roleKeys.all, 'permission-modules'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
}

function extractMutationError(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return typeof data?.message === 'string' ? data.message : undefined
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const m = (error as { message: unknown }).message
    return typeof m === 'string' ? m : undefined
  }
  return undefined
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
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      toast.success(t('roles:actions.create_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('roles:errors.generic'))
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateRolePayload
    }) => updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) })
      toast.success(t('roles:actions.update_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('roles:errors.generic'))
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      toast.success(t('roles:actions.delete_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('roles:errors.delete_failed'))
    },
  })
}
