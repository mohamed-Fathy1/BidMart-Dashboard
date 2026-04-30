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
  status?: string
  accountType?: string
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function listUsers(
  params: ListUsersParams,
): Promise<{ data: AdminUserListItem[]; meta: PaginationMeta }> {
  const res = await api.get<{ data: AdminUserListItem[]; meta: PaginationMeta }>(
    '/admin/users',
    { params },
  )
  return res.data
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
  const res = await api.get<AdminUserDetail>(`/admin/users/${userId}`)
  return res.data
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
