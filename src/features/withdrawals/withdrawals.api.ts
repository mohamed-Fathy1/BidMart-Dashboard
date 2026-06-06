import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type Paginated,
  type SettlementDetail,
  type SettlementListItem,
} from '@/types/api'

/**
 * Admin Settlements / Withdrawals (spec §C). All endpoints under
 * `/admin/settlements`. Action endpoints (approve/adjust/reject) return the
 * fresh `SettlementDetail`; `withdrawals.queries.ts` patches the detail cache
 * from the mutation response so we don't need an extra round-trip.
 */

export interface ListSettlementsParams {
  search?: string
  /**
   * Comma-separated multi-status filter per spec §C1 — e.g. `"NEW,ADJUSTED"`.
   * Invalid tokens silently match nothing; send only valid statuses.
   */
  status?: string
  /** `YYYY-MM-DD` */
  dateFrom?: string
  /** `YYYY-MM-DD` — server treats as inclusive (appends 23:59:59.999). */
  dateTo?: string
  page?: number
  limit?: number
}

export interface AdjustSettlementPayload {
  adjustedAmount: number
  notes?: string
}

export interface RejectSettlementPayload {
  reason: string
}

export async function listSettlements(
  params: ListSettlementsParams,
): Promise<Paginated<SettlementListItem>> {
  const res = await api.get<ApiEnvelope<SettlementListItem[]>>(
    '/admin/settlements',
    { params },
  )
  return unwrapPaginated(res.data)
}

export async function getNewCount(): Promise<{ count: number }> {
  const res = await api.get<ApiEnvelope<{ count: number }> | { count: number }>(
    '/admin/settlements/new-count',
  )
  return unwrap(res.data)
}

export async function getSettlement(id: string): Promise<SettlementDetail> {
  const res = await api.get<ApiEnvelope<SettlementDetail> | SettlementDetail>(
    `/admin/settlements/${id}`,
  )
  return unwrap(res.data)
}

/**
 * Returns the unmasked IBAN. **Audit-logged server-side** — call only on
 * explicit admin click, never on page load.
 */
export async function revealIban(id: string): Promise<{ iban: string }> {
  const res = await api.post<ApiEnvelope<{ iban: string }> | { iban: string }>(
    `/admin/settlements/${id}/reveal-iban`,
  )
  return unwrap(res.data)
}

export async function approveSettlement(id: string): Promise<SettlementDetail> {
  const res = await api.post<ApiEnvelope<SettlementDetail> | SettlementDetail>(
    `/admin/settlements/${id}/approve`,
  )
  return unwrap(res.data)
}

export async function adjustSettlement(
  id: string,
  payload: AdjustSettlementPayload,
): Promise<SettlementDetail> {
  const res = await api.post<ApiEnvelope<SettlementDetail> | SettlementDetail>(
    `/admin/settlements/${id}/adjust`,
    payload,
  )
  return unwrap(res.data)
}

export async function rejectSettlement(
  id: string,
  payload: RejectSettlementPayload,
): Promise<SettlementDetail> {
  const res = await api.post<ApiEnvelope<SettlementDetail> | SettlementDetail>(
    `/admin/settlements/${id}/reject`,
    payload,
  )
  return unwrap(res.data)
}
