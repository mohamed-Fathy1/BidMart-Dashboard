import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { extractApiErrorCode } from '@/lib/axios'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import { roleKeys } from '@/features/roles/roles.queries'
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

export type AdminFormField = 'email' | 'phone' | 'roleId'

interface AdminFieldError {
  field: AdminFormField
  messageKey: string
}

/** Server `error.code`s that belong under one form field instead of a toast. */
const UPDATE_FIELD_ERRORS: Record<string, AdminFieldError> = {
  ADMIN_EMAIL_ALREADY_EXISTS: { field: 'email', messageKey: 'admins:errors.email_taken' },
  ADMIN_PHONE_ALREADY_EXISTS: { field: 'phone', messageKey: 'admins:errors.phone_taken' },
}

const CREATE_FIELD_ERRORS: Record<string, AdminFieldError> = {
  ...UPDATE_FIELD_ERRORS,
  // On create the only looked-up resource is the role.
  RESOURCE_NOT_FOUND: { field: 'roleId', messageKey: 'admins:errors.role_not_found' },
}

export type OnAdminFieldError = (field: AdminFormField, messageKey: string) => void

function fieldErrorFor(
  table: Record<string, AdminFieldError>,
  error: unknown,
): AdminFieldError | undefined {
  const code = extractApiErrorCode(error)
  return code ? table[code] : undefined
}

export function useAdminsQuery(params: ListAdminsParams) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => listAdmins(params),
  })
}

export function useCreateAdminMutation(onFieldError: OnAdminFieldError) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useResourceMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdmin(payload),
    invalidate: [adminKeys.all],
    errorKey: 'admins:errors.generic',
    silentCodes: Object.keys(CREATE_FIELD_ERRORS),
    onSuccess: ({ admin, welcomeEmailQueued }) => {
      if (welcomeEmailQueued) {
        toast.success(t('admins:actions.create_success', { email: admin.email }))
      } else {
        toast.warning(t('admins:actions.create_success_email_failed'), { duration: 10_000 })
      }
    },
    onError: (error) => {
      const hit = fieldErrorFor(CREATE_FIELD_ERRORS, error)
      if (!hit) return
      if (hit.field === 'roleId') queryClient.invalidateQueries({ queryKey: roleKeys.all })
      onFieldError(hit.field, hit.messageKey)
    },
  })
}

export function useUpdateAdminMutation(onFieldError: OnAdminFieldError) {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminPayload }) =>
      updateAdmin(id, payload),
    invalidate: [adminKeys.all],
    successKey: 'admins:actions.update_success',
    errorKey: 'admins:errors.generic',
    silentCodes: Object.keys(UPDATE_FIELD_ERRORS),
    onError: (error) => {
      const hit = fieldErrorFor(UPDATE_FIELD_ERRORS, error)
      if (hit) onFieldError(hit.field, hit.messageKey)
    },
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
