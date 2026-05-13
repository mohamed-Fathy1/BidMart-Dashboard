import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type AdminUserListItem,
  type AdminUserDetail,
  type ApiEnvelope,
  type Paginated,
} from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListUsersParams {
  search?: string
  status?: 'active' | 'banned' | 'suspended'
  accountType?: 'user_only' | 'upgraded_to_seller'
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function listUsers(
  params: ListUsersParams,
): Promise<Paginated<AdminUserListItem>> {
  const res = await api.get<ApiEnvelope<AdminUserListItem[]>>('/admin/users', { params })
  return unwrapPaginated(res.data)
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
  const res = await api.get<ApiEnvelope<AdminUserDetail> | AdminUserDetail>(
    `/admin/users/${userId}`,
  )
  return unwrap(res.data)
}

export async function banUser(userId: string, reason: string): Promise<void> {
  await api.patch(`/admin/users/${userId}/ban`, { reason })
}

export async function suspendUser(userId: string, reason: string): Promise<void> {
  await api.patch(`/admin/users/${userId}/suspend`, { reason })
}

export async function activateUser(userId: string): Promise<void> {
  await api.patch(`/admin/users/${userId}/activate`)
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`)
}
