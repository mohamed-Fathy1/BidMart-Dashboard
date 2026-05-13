import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type Country,
  type Paginated,
} from '@/types/api'

/** Toggle endpoint accepts both camel + snake case from older deployments. */
function unwrapTogglePayload(body: unknown): { isEnabled: boolean } {
  const inner = unwrap(body as ApiEnvelope<unknown> | unknown) as Record<string, unknown> | null
  if (inner && typeof inner === 'object') {
    if (typeof inner.isEnabled === 'boolean') return { isEnabled: inner.isEnabled }
    if (typeof inner.is_enabled === 'boolean') return { isEnabled: inner.is_enabled }
  }
  throw new Error('Invalid toggle response')
}

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListCountriesParams {
  /** Search by name (EN or AR). */
  search?: string
  isEnabled?: boolean
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  Mutation payloads                                                   */
/* ------------------------------------------------------------------ */

export interface CreateCountryPayload {
  name_en: string
  name_ar: string
  iso_code: string
  image_url: string
  is_enabled?: boolean
  sort_order?: number
}

export interface UpdateCountryPayload {
  name_en?: string
  name_ar?: string
  image_url?: string
  is_enabled?: boolean
  sort_order?: number
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function listCountries(
  params: ListCountriesParams,
): Promise<Paginated<Country>> {
  const res = await api.get<ApiEnvelope<Country[]>>('/admin/countries', { params })
  return unwrapPaginated(res.data)
}

export async function createCountry(payload: CreateCountryPayload): Promise<Country> {
  const res = await api.post<ApiEnvelope<Country> | Country>('/admin/countries', payload)
  return unwrap(res.data)
}

export async function updateCountry(
  id: string,
  payload: UpdateCountryPayload,
): Promise<Country> {
  const res = await api.patch<ApiEnvelope<Country> | Country>(`/admin/countries/${id}`, payload)
  return unwrap(res.data)
}

export async function deleteCountry(id: string): Promise<void> {
  await api.delete(`/admin/countries/${id}`)
}

/** PATCH …/toggle — toggles `is_enabled` for registration dropdown visibility. */
export async function toggleCountryEnabled(id: string): Promise<{ isEnabled: boolean }> {
  const res = await api.patch<unknown>(`/admin/countries/${id}/toggle`)
  return unwrapTogglePayload(res.data)
}
