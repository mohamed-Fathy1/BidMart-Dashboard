import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  listUsers,
  getUserDetail,
  banUser,
  suspendUser,
  activateUser,
  deleteUser,
  type ListUsersParams,
} from '@/features/users/users.api'

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

/* ------------------------------------------------------------------ */
/*  Query keys                                                         */
/* ------------------------------------------------------------------ */

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
  })
}

export function useUserDetailQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserDetail(userId),
    enabled: !!userId,
  })
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

export function useBanUserMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success(t('users:actions.ban_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('users:errors.ban_failed'))
    },
  })
}

export function useSuspendUserMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success(t('users:actions.suspend_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('users:errors.suspend_failed'))
    },
  })
}

export function useActivateUserMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (userId: string) => activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success(t('users:actions.activate_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('users:errors.activate_failed'))
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success(t('users:actions.delete_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('users:errors.delete_failed'))
    },
  })
}
