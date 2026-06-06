import type { NotificationActionType } from '@/types/api'

export interface DeepLink {
  to: string
  params: Record<string, string>
}

/**
 * Maps an admin notification's (action_type, action_id) tuple to a dashboard
 * route. Returns `null` when either field is missing or the type has no
 * registered detail page yet.
 */
export function resolveDeepLink(
  actionType: NotificationActionType | null,
  actionId: string | null,
): DeepLink | null {
  if (!actionType || !actionId) return null
  switch (actionType) {
    case 'SELLER':
      return { to: '/providers/$storeId', params: { storeId: actionId } }
    case 'USER':
      return { to: '/users/$userId', params: { userId: actionId } }
    case 'SUPPORT':
      return { to: '/support-tickets/$ticketId', params: { ticketId: actionId } }
    case 'COMPLAINT':
      return { to: '/complaints/$complaintId', params: { complaintId: actionId } }
    case 'SETTLEMENT':
      return { to: '/withdrawals/$id', params: { id: actionId } }
    default:
      return null
  }
}
