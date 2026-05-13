import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  listUsers,
  getUserDetail,
  banUser,
  suspendUser,
  activateUser,
  deleteUser,
  type ListUsersParams,
} from '@/features/users/users.api'

export const userKeys = createResourceKeys<ListUsersParams>('users')

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
  return useResourceMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      banUser(userId, reason),
    invalidate: [userKeys.all],
    successKey: 'users:actions.ban_success',
    errorKey: 'users:errors.ban_failed',
  })
}

export function useSuspendUserMutation() {
  return useResourceMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      suspendUser(userId, reason),
    invalidate: [userKeys.all],
    successKey: 'users:actions.suspend_success',
    errorKey: 'users:errors.suspend_failed',
  })
}

export function useActivateUserMutation() {
  return useResourceMutation({
    mutationFn: (userId: string) => activateUser(userId),
    invalidate: [userKeys.all],
    successKey: 'users:actions.activate_success',
    errorKey: 'users:errors.activate_failed',
  })
}

export function useDeleteUserMutation() {
  return useResourceMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    invalidate: [userKeys.all],
    successKey: 'users:actions.delete_success',
    errorKey: 'users:errors.delete_failed',
  })
}
