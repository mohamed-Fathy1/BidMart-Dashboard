import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type Bank,
  type Paginated,
} from '@/types/api'

/**
 * Admin Banks (spec §A). Bank read = `admin:withdrawals:view`; write =
 * `admin:withdrawals:approve` (banks live under the Withdrawals permission
 * group server-side — no dedicated `admin:banks:*` keys).
 *
 * Mutation responses **omit** `countryNameEn` / `countryNameAr` (the relation
 * isn't re-fetched, JSON drops `undefined`). Re-list (A1) is the source of
 * truth for resolved country names — invalidation in `banks.queries.ts`
 * handles this automatically.
 */

export interface ListBanksParams {
  /** Matches `name_en` OR `name_ar` (ILIKE). */
  search?: string
  countryId?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CreateBankPayload {
  nameEn: string
  nameAr: string
  countryId: string
}

export type UpdateBankPayload = Partial<CreateBankPayload>

export async function listBanks(params: ListBanksParams): Promise<Paginated<Bank>> {
  const res = await api.get<ApiEnvelope<Bank[]>>('/admin/banks', { params })
  return unwrapPaginated(res.data)
}

export async function createBank(payload: CreateBankPayload): Promise<Bank> {
  const res = await api.post<ApiEnvelope<Bank> | Bank>('/admin/banks', payload)
  return unwrap(res.data)
}

export async function updateBank(
  id: string,
  payload: UpdateBankPayload,
): Promise<Bank> {
  const res = await api.patch<ApiEnvelope<Bank> | Bank>(
    `/admin/banks/${id}`,
    payload,
  )
  return unwrap(res.data)
}

/** Flips `isActive`. Server rejects deactivation while pending settlements exist. */
export async function toggleBankStatus(id: string): Promise<Bank> {
  const res = await api.patch<ApiEnvelope<Bank> | Bank>(
    `/admin/banks/${id}/toggle-status`,
  )
  return unwrap(res.data)
}
