import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/axios'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import type { AdminNotification, Paginated } from '@/types/api'
import {
  listAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationRead,
  testBroadcast,
  type ListAdminNotificationsParams,
} from './notifications.api'

export const notificationKeys = createResourceKeys<ListAdminNotificationsParams>(
  'admin-notifications',
)

const popoverKey = (limit: number) =>
  ['admin-notifications', 'popover', limit] as const
const unreadCountKey = ['admin-notifications', 'unread-count'] as const

const DEFAULT_LIMIT = 20

/**
 * Infinite list of admin notifications. `getNextPageParam` reads `meta.hasNextPage`;
 * pages are concatenated client-side via `data.pages.flatMap(p => p.data)`.
 */
export function useAdminNotificationsInfiniteQuery(params: {
  type?: ListAdminNotificationsParams['type']
  limit?: number
}) {
  const limit = params.limit ?? DEFAULT_LIMIT
  return useInfiniteQuery({
    queryKey: notificationKeys.list({ type: params.type, limit }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listAdminNotifications({ page: pageParam, limit, type: params.type }),
    getNextPageParam: (last) =>
      last.meta.hasNextPage ? last.meta.page + 1 : undefined,
  })
}

/**
 * First-page snapshot for the topbar popover. Lives under a separate key
 * (`popover`) so its cache shape can't collide with the infinite-list cache.
 */
export function useAdminNotificationsFirstPageQuery(limit = 10) {
  return useQuery({
    queryKey: popoverKey(limit),
    queryFn: () => listAdminNotifications({ page: 1, limit }),
  })
}

/** Bell badge — refetches every 30s while the topbar is mounted. */
export function useAdminUnreadCountQuery() {
  return useQuery({
    queryKey: unreadCountKey,
    queryFn: getAdminUnreadCount,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}

/**
 * Mark-read with optimistic UI: flips `is_read` on every matching cached row
 * (infinite + popover) and decrements the unread count immediately, then
 * reconciles with the server. Rolls back on error.
 */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => markAdminNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const snapshots = queryClient.getQueriesData({
        queryKey: notificationKeys.all,
      })

      queryClient.setQueriesData(
        { queryKey: notificationKeys.all },
        (old: unknown) => patchRowAsRead(old, id),
      )

      const prevCount = queryClient.getQueryData<number>(unreadCountKey)
      if (typeof prevCount === 'number' && prevCount > 0) {
        queryClient.setQueryData<number>(unreadCountKey, prevCount - 1)
      }

      return { snapshots, prevCount }
    },
    onError: (error, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
      if (typeof ctx?.prevCount === 'number') {
        queryClient.setQueryData(unreadCountKey, ctx.prevCount)
      }
      const fallback = t('notifications:errors.mark_failed')
      toast.error(extractErrorMessage(error) ?? fallback, {
        id: 'notifications:errors.mark_failed',
        duration: 5000,
      })
    },
    onSettled: () => {
      // Reconcile the count with the server (idempotent read).
      queryClient.invalidateQueries({ queryKey: unreadCountKey })
    },
  })
}

export function useTestBroadcastMutation() {
  return useResourceMutation({
    mutationFn: () => testBroadcast(),
    successKey: 'notifications:broadcast.success',
    errorKey: 'notifications:broadcast.error',
  })
}

/* ------------------------------------------------------------------ */
/*  Cache patchers                                                     */
/* ------------------------------------------------------------------ */

interface InfiniteShape {
  pages: Paginated<AdminNotification>[]
  pageParams: unknown[]
}

function isInfiniteShape(value: unknown): value is InfiniteShape {
  return (
    !!value &&
    typeof value === 'object' &&
    'pages' in value &&
    Array.isArray((value as InfiniteShape).pages)
  )
}

function isPaginatedShape(value: unknown): value is Paginated<AdminNotification> {
  return (
    !!value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as Paginated<AdminNotification>).data)
  )
}

function patchRowAsRead(old: unknown, id: string): unknown {
  if (isInfiniteShape(old)) {
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.map((row) =>
          row.id === id && !row.is_read ? { ...row, is_read: true } : row,
        ),
      })),
    }
  }
  if (isPaginatedShape(old)) {
    return {
      ...old,
      data: old.data.map((row) =>
        row.id === id && !row.is_read ? { ...row, is_read: true } : row,
      ),
    }
  }
  return old
}
