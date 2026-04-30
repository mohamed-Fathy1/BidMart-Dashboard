import { api } from '@/lib/axios'
import type { ProviderSummary, ProviderDetail, PaginationMeta } from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListProvidersParams {
  search?: string
  status?: string
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function listProviders(
  params: ListProvidersParams,
): Promise<{ data: ProviderSummary[]; meta: PaginationMeta }> {
  const res = await api.get<{ data: ProviderSummary[]; meta: PaginationMeta }>(
    '/admin/providers',
    { params },
  )
  return res.data
}

export async function getProviderDetail(storeId: string): Promise<ProviderDetail> {
  const res = await api.get<ProviderDetail>(`/admin/providers/${storeId}`)
  return res.data
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
  const res = await api.patch<{ isVerified: boolean }>(
    `/admin/providers/${storeId}/verify`,
  )
  return res.data
}
