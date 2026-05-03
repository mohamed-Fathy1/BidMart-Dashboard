import { api } from '@/lib/axios'
import type {
  AdminUserListItem,
  AdminUserDetail,
  PaginationMeta,
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
): Promise<{ data: AdminUserListItem[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: AdminUserListItem[]
    meta: PaginationMeta
  }>('/admin/users', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
  const res = await api.get<{ success?: boolean; data: AdminUserDetail } | AdminUserDetail>(
    `/admin/users/${userId}`,
  )
  const raw = res.data as Record<string, unknown>
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
    return raw.data as AdminUserDetail
  }
  return res.data as AdminUserDetail
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
