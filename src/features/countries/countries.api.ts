import { api } from '@/lib/axios'
import type { Country, PaginationMeta } from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Response helpers                                                  */
/* ------------------------------------------------------------------ */

function unwrapCountry(body: unknown): Country {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid country response')
  }
  const o = body as Record<string, unknown>
  const inner = o.data
  if (inner && typeof inner === 'object') {
    return inner as Country
  }
  return body as Country
}

function unwrapTogglePayload(body: unknown): { isEnabled: boolean } {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid toggle response')
  }
  const o = body as Record<string, unknown>
  const nested = o.data
  if (nested && typeof nested === 'object') {
    const n = nested as Record<string, unknown>
    if (typeof n.isEnabled === 'boolean') return { isEnabled: n.isEnabled }
    if (typeof n.is_enabled === 'boolean') return { isEnabled: n.is_enabled }
  }
  if (typeof o.isEnabled === 'boolean') {
    return { isEnabled: o.isEnabled }
  }
  if (typeof o.is_enabled === 'boolean') {
    return { isEnabled: o.is_enabled }
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
): Promise<{ data: Country[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: Country[]
    meta: PaginationMeta
  }>('/admin/countries', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export async function createCountry(payload: CreateCountryPayload): Promise<Country> {
  const res = await api.post<unknown>('/admin/countries', payload)
  return unwrapCountry(res.data)
}

export async function updateCountry(
  id: string,
  payload: UpdateCountryPayload,
): Promise<Country> {
  const res = await api.patch<unknown>(`/admin/countries/${id}`, payload)
  return unwrapCountry(res.data)
}

export async function deleteCountry(id: string): Promise<void> {
  await api.delete(`/admin/countries/${id}`)
}

/** PATCH …/toggle — toggles `is_enabled` for registration dropdown visibility. */
export async function toggleCountryEnabled(id: string): Promise<{ isEnabled: boolean }> {
  const res = await api.patch<unknown>(`/admin/countries/${id}/toggle`)
  return unwrapTogglePayload(res.data)
}
