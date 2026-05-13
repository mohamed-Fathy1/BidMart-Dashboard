import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type Paginated,
  type ProviderSummary,
  type ProviderDetail,
  type ProviderAccountStatus,
} from '@/types/api'

export interface ListProvidersParams {
  search?: string
  /** Store lifecycle filter — backend expects lowercase (`pending`, `approved`, …) */
  status?: ProviderAccountStatus
  page?: number
  limit?: number
}

/** @deprecated Re-export — import from `@/components/shared/status-badge-mappers` instead. */
export { providerAccountStatusForSellerBadge } from '@/components/shared/status-badge-mappers'

export async function listProviders(
  params: ListProvidersParams,
): Promise<Paginated<ProviderSummary>> {
  const res = await api.get<ApiEnvelope<ProviderSummary[]>>('/admin/providers', { params })
  return unwrapPaginated(res.data)
}

export async function getProviderDetail(storeId: string): Promise<ProviderDetail> {
  const res = await api.get<ApiEnvelope<ProviderDetail> | ProviderDetail>(
    `/admin/providers/${storeId}`,
  )
  return unwrap(res.data)
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
  const res = await api.patch<ApiEnvelope<{ isVerified: boolean }> | { isVerified: boolean }>(
    `/admin/providers/${storeId}/verify`,
  )
  const inner = unwrap(res.data)
  if (!inner || typeof inner.isVerified !== 'boolean') {
    throw new Error('Invalid verify response')
  }
  return { isVerified: inner.isVerified }
}

export async function blockProvider(storeId: string): Promise<void> {
  await api.patch(`/admin/providers/${storeId}/block`)
}

export async function unblockProvider(storeId: string): Promise<void> {
  await api.patch(`/admin/providers/${storeId}/unblock`)
}
