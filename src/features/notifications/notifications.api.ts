import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type AdminNotification,
  type ApiEnvelope,
  type NotificationType,
  type Paginated,
} from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListAdminNotificationsParams {
  page?: number
  limit?: number
  /** Server-side filter — the API exposes `type` only (no search/unread). */
  type?: NotificationType
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function listAdminNotifications(
  params: ListAdminNotificationsParams,
): Promise<Paginated<AdminNotification>> {
  const res = await api.get<ApiEnvelope<AdminNotification[]>>(
    '/admin/notifications',
    { params },
  )
  return unwrapPaginated(res.data)
}

export async function getAdminUnreadCount(): Promise<number> {
  const res = await api.get<ApiEnvelope<{ count: number }> | { count: number }>(
    '/admin/notifications/unread-count',
  )
  const body = unwrap(res.data)
  return body.count
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  await api.patch(`/admin/notifications/${id}/read`)
}

export async function testBroadcast(): Promise<{ queued: boolean; message: string }> {
  const res = await api.post<
    ApiEnvelope<{ queued: boolean; message: string }> | { queued: boolean; message: string }
  >('/admin/notifications/test-broadcast')
  return unwrap(res.data)
}
