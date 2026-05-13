import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  blockAdmin,
  createAdmin,
  deleteAdmin,
  listAdmins,
  unblockAdmin,
  updateAdmin,
  type CreateAdminPayload,
  type ListAdminsParams,
  type UpdateAdminPayload,
} from '@/features/admins/admins.api'

export const adminKeys = createResourceKeys<ListAdminsParams>('admins')

export function useAdminsQuery(params: ListAdminsParams) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => listAdmins(params),
  })
}

export function useCreateAdminMutation() {
  return useResourceMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdmin(payload),
    invalidate: [adminKeys.all],
    successKey: 'admins:actions.create_success',
    errorKey: 'admins:errors.generic',
  })
}

export function useUpdateAdminMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminPayload }) =>
      updateAdmin(id, payload),
    invalidate: [adminKeys.all],
    successKey: 'admins:actions.update_success',
    errorKey: 'admins:errors.generic',
  })
}

export function useDeleteAdminMutation() {
  return useResourceMutation({
    mutationFn: (adminId: string) => deleteAdmin(adminId),
    invalidate: [adminKeys.all],
    successKey: 'admins:actions.delete_success',
    errorKey: 'admins:errors.delete_failed',
  })
}

export function useBlockAdminMutation() {
  return useResourceMutation({
    mutationFn: (adminId: string) => blockAdmin(adminId),
    invalidate: [adminKeys.all],
    successKey: 'admins:actions.block_success',
    errorKey: 'admins:errors.block_failed',
  })
}

export function useUnblockAdminMutation() {
  return useResourceMutation({
    mutationFn: (adminId: string) => unblockAdmin(adminId),
    invalidate: [adminKeys.all],
    successKey: 'admins:actions.unblock_success',
    errorKey: 'admins:errors.unblock_failed',
  })
}
