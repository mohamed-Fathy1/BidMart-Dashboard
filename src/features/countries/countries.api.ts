import { api } from '@/lib/axios'
import type { Country, PaginationMeta } from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListCountriesParams {
  isEnabled?: string
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
  const res = await api.get<{ data: Country[]; meta: PaginationMeta }>(
    '/admin/countries',
    { params },
  )
  return res.data
}

export async function createCountry(payload: CreateCountryPayload): Promise<Country> {
  const res = await api.post<Country>('/admin/countries', payload)
  return res.data
}

export async function updateCountry(
  id: string,
  payload: UpdateCountryPayload,
): Promise<Country> {
  const res = await api.patch<Country>(`/admin/countries/${id}`, payload)
  return res.data
}

export async function deleteCountry(id: string): Promise<void> {
  await api.delete(`/admin/countries/${id}`)
}
