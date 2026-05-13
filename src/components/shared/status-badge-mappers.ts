import type { SellerStatus } from '@/types/api'

/**
 * Maps provider/store lifecycle status (`pending` | `approved` | `rejected` | `blocked`
 * from the admin API) to the `SellerStatus` enum that `StatusBadge` consumes.
 * `blocked` displays as `SUSPENDED` because the UI treats them as the same state.
 */
export function providerAccountStatusForSellerBadge(status: string): SellerStatus {
  const s = String(status).toLowerCase()
  if (s === 'pending') return 'PENDING'
  if (s === 'approved') return 'APPROVED'
  if (s === 'rejected') return 'REJECTED'
  if (s === 'blocked') return 'SUSPENDED'
  return 'PENDING'
}
