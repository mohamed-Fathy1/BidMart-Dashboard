import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type AdminAccountDetail,
  type AdminAccountListItem,
  type ApiEnvelope,
  type Paginated,
} from '@/types/api'

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
  phone: string
  email: string
  roleId: string
}

export type UpdateAdminPayload = Partial<
  Pick<CreateAdminPayload, 'fullName' | 'phone' | 'email' | 'roleId'>
>

interface AdminMutationBody {
  message?: string
  admin: AdminAccountDetail
}

export interface CreateAdminResult {
  admin: AdminAccountDetail
  /** `false` means the admin exists but the welcome email with their password was not queued. */
  welcomeEmailQueued: boolean
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export async function listAdmins(
  params: ListAdminsParams,
): Promise<Paginated<AdminAccountListItem>> {
  const res = await api.get<ApiEnvelope<AdminAccountListItem[]>>('/admin/admins', { params })
  return unwrapPaginated(res.data)
}

export async function createAdmin(payload: CreateAdminPayload): Promise<CreateAdminResult> {
  const res = await api.post<ApiEnvelope<AdminMutationBody & { welcomeEmailQueued?: boolean }>>(
    '/admin/admins',
    payload,
  )
  const body = unwrap(res.data)
  // Backends that predate the flag always queued the email.
  return { admin: body.admin, welcomeEmailQueued: body.welcomeEmailQueued !== false }
}

export async function updateAdmin(
  adminId: string,
  payload: UpdateAdminPayload,
): Promise<AdminAccountDetail> {
  const res = await api.patch<ApiEnvelope<AdminMutationBody>>(`/admin/admins/${adminId}`, payload)
  return unwrap(res.data).admin
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
