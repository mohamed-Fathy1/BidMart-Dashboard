import { api } from '@/lib/axios'
import type { AdminAccountDetail, AdminAccountListItem, PaginationMeta } from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListAdminsParams {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  Mutation payloads                                                  */
/* ------------------------------------------------------------------ */

export interface CreateAdminPayload {
  fullName: string
  phone?: string | null
  email: string
  roleId: string
}

export type UpdateAdminPayload = Partial<
  Pick<CreateAdminPayload, 'fullName' | 'phone' | 'email' | 'roleId'>
>

/* ------------------------------------------------------------------ */
/*  Unwrap helpers                                                     */
/* ------------------------------------------------------------------ */

function unwrapAdmin(
  body: AdminAccountDetail | { message?: string; admin: AdminAccountDetail },
): AdminAccountDetail {
  if ('admin' in body && body.admin) return body.admin
  return body as AdminAccountDetail
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export async function listAdmins(
  params: ListAdminsParams,
): Promise<{ data: AdminAccountListItem[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: AdminAccountListItem[]
    meta: PaginationMeta
  }>('/admin/admins', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export async function getAdmin(adminId: string): Promise<AdminAccountDetail> {
  const res = await api.get<AdminAccountDetail | { data: AdminAccountDetail }>(
    `/admin/admins/${adminId}`,
  )
  const raw = res.data as Record<string, unknown>
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data)
    return raw.data as AdminAccountDetail
  return res.data as AdminAccountDetail
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminAccountDetail> {
  const res = await api.post<{ message?: string; admin: AdminAccountDetail }>(
    '/admin/admins',
    payload,
  )
  return unwrapAdmin(res.data)
}

export async function updateAdmin(
  adminId: string,
  payload: UpdateAdminPayload,
): Promise<AdminAccountDetail> {
  const res = await api.patch<{ message?: string; admin: AdminAccountDetail }>(
    `/admin/admins/${adminId}`,
    payload,
  )
  return unwrapAdmin(res.data)
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await api.delete(`/admin/admins/${adminId}`)
}

export async function blockAdmin(adminId: string): Promise<void> {
  await api.patch(`/admin/admins/${adminId}/block`)
}

export async function unblockAdmin(adminId: string): Promise<void> {
  await api.patch(`/admin/admins/${adminId}/unblock`)
}
