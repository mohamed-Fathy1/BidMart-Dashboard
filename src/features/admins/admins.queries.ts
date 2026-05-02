import axios from 'axios'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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

export const adminKeys = {
  all: ['admins'] as const,
  lists: () => [...adminKeys.all, 'list'] as const,
  list: (params: ListAdminsParams) => [...adminKeys.lists(), params] as const,
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

export function useAdminsQuery(params: ListAdminsParams) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => listAdmins(params),
  })
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      toast.success(t('admins:actions.create_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('admins:errors.generic'))
    },
  })
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateAdminPayload
    }) => updateAdmin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      toast.success(t('admins:actions.update_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('admins:errors.generic'))
    },
  })
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (adminId: string) => deleteAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      toast.success(t('admins:actions.delete_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('admins:errors.delete_failed'))
    },
  })
}

export function useBlockAdminMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (adminId: string) => blockAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      toast.success(t('admins:actions.block_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('admins:errors.block_failed'))
    },
  })
}

export function useUnblockAdminMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (adminId: string) => unblockAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      toast.success(t('admins:actions.unblock_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('admins:errors.unblock_failed'))
    },
  })
}
