import { api } from '@/lib/axios'
import type {
  ProviderSummary,
  ProviderDetail,
  PaginationMeta,
  ProviderAccountStatus,
  SellerStatus,
} from '@/types/api'

export interface ListProvidersParams {
  search?: string
  /** Store lifecycle filter — backend expects lowercase (`pending`, `approved`, …) */
  status?: ProviderAccountStatus
  page?: number
  limit?: number
}

/** Maps provider store status strings to TanStack Seller badge enums */
export function providerAccountStatusForSellerBadge(status: string): SellerStatus {
  const s = String(status).toLowerCase()
  if (s === 'pending') return 'PENDING'
  if (s === 'approved') return 'APPROVED'
  if (s === 'rejected') return 'REJECTED'
  if (s === 'blocked') return 'SUSPENDED'
  return 'PENDING'
}

function unwrapVerifyPayload(body: unknown): { isVerified: boolean } {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid verify response')
  }
  const o = body as Record<string, unknown>
  const nested = o.data
  if (nested && typeof nested === 'object' && 'isVerified' in nested) {
    const v = (nested as { isVerified: unknown }).isVerified
    if (typeof v === 'boolean') return { isVerified: v }
  }
  if (typeof o.isVerified === 'boolean') {
    return { isVerified: o.isVerified }
  }
  throw new Error('Invalid verify response')
}

export async function listProviders(
  params: ListProvidersParams,
): Promise<{ data: ProviderSummary[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: ProviderSummary[]
    meta: PaginationMeta
  }>('/admin/providers', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export async function getProviderDetail(storeId: string): Promise<ProviderDetail> {
  const res = await api.get<{ success?: boolean; data: ProviderDetail } | ProviderDetail>(
    `/admin/providers/${storeId}`,
  )
  const raw = res.data as Record<string, unknown>
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
    return raw.data as ProviderDetail
  }
  return res.data as ProviderDetail
}

export async function approveProvider(storeId: string): Promise<void> {
  await api.patch(`/admin/providers/${storeId}/approve`)
}

export async function rejectProvider(storeId: string, reason: string): Promise<void> {
  await api.patch(`/admin/providers/${storeId}/reject`, { reason })
}

export async function toggleProviderVerification(
  storeId: string,
): Promise<{ isVerified: boolean }> {
  const res = await api.patch<unknown>(`/admin/providers/${storeId}/verify`)
  return unwrapVerifyPayload(res.data)
}

export async function blockProvider(storeId: string): Promise<void> {
  await api.patch(`/admin/providers/${storeId}/block`)
}

export async function unblockProvider(storeId: string): Promise<void> {
  await api.patch(`/admin/providers/${storeId}/unblock`)
}
