import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type ComplaintType,
  type Paginated,
} from '@/types/api'

export interface ListComplaintTypesParams {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CreateComplaintTypePayload {
  name_en: string
  name_ar: string
}

export interface UpdateComplaintTypePayload {
  name_en?: string
  name_ar?: string
  is_active?: boolean
}

export async function listComplaintTypes(
  params: ListComplaintTypesParams,
): Promise<Paginated<ComplaintType>> {
  const { isActive, ...rest } = params
  const res = await api.get<ApiEnvelope<ComplaintType[]>>('/admin/complaint-types', {
    params: { ...rest, ...(isActive !== undefined ? { isActive } : {}) },
  })
  return unwrapPaginated(res.data)
}

export async function createComplaintType(
  payload: CreateComplaintTypePayload,
): Promise<ComplaintType> {
  const res = await api.post<ApiEnvelope<ComplaintType> | ComplaintType>(
    '/admin/complaint-types',
    payload,
  )
  return unwrap(res.data)
}

export async function updateComplaintType(
  id: string,
  payload: UpdateComplaintTypePayload,
): Promise<ComplaintType> {
  const res = await api.patch<ApiEnvelope<ComplaintType> | ComplaintType>(
    `/admin/complaint-types/${id}`,
    payload,
  )
  return unwrap(res.data)
}

export async function deleteComplaintType(id: string): Promise<void> {
  await api.delete(`/admin/complaint-types/${id}`)
}
