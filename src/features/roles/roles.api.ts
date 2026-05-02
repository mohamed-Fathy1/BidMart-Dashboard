import { api } from '@/lib/axios'
import type {
  PaginationMeta,
  RoleDetail,
  RoleListItem,
  RolePermissionModule,
} from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Query params                                                       */
/* ------------------------------------------------------------------ */

export interface ListRolesParams {
  search?: string
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  Mutation payloads                                                  */
/* ------------------------------------------------------------------ */

export interface CreateRolePayload {
  name_en: string
  name_ar: string
  permissions: string[]
}

export type UpdateRolePayload = Partial<CreateRolePayload>

/* ------------------------------------------------------------------ */
/*  Response unwrap helpers                                           */
/* ------------------------------------------------------------------ */

function coercePermissionKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const p of value) {
    if (typeof p === 'string' && p.trim() !== '') out.push(p)
  }
  return out
}

/**
 * Normalize GET / PATCH / POST role payloads. Handles:
 * - Flat role object on the response root
 * - `{ data: RoleDetail }` (admin envelope)
 * - `{ data: { message?, role } }` (mutation-shaped envelope)
 */
function normalizeRoleDetail(input: RoleDetail): RoleDetail
function normalizeRoleDetail(input: unknown, fallbackRoleId?: string): RoleDetail
function normalizeRoleDetail(input: unknown, fallbackRoleId?: string): RoleDetail {
  let o: Record<string, unknown>

  if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
    const root = input as Record<string, unknown>

    if ('data' in root && root.data !== null && typeof root.data === 'object') {
      const inner = root.data as Record<string, unknown>
      if ('role' in inner && inner.role !== null && typeof inner.role === 'object') {
        o = inner.role as Record<string, unknown>
      } else {
        o = inner
      }
    } else {
      o = root
    }
  } else {
    o = {}
  }

  const id =
    typeof o.id === 'string'
      ? o.id
      : typeof fallbackRoleId === 'string'
        ? fallbackRoleId
        : ''

  const updatedAtRaw = o.updatedAt ?? o.updated_at

  return {
    id,
    name_en: typeof o.name_en === 'string' ? o.name_en : '',
    name_ar: typeof o.name_ar === 'string' ? o.name_ar : '',
    adminCount: typeof o.adminCount === 'number' ? o.adminCount : typeof o.admin_count === 'number' ? o.admin_count : 0,
    isProtected: o.isProtected === true || o.is_protected === true,
    createdAt:
      typeof o.createdAt === 'string'
        ? o.createdAt
        : typeof o.created_at === 'string'
          ? o.created_at
          : '',
    permissions: coercePermissionKeys(o.permissions),
    updatedAt: typeof updatedAtRaw === 'string' ? updatedAtRaw : '',
  }
}

/** Some gateways return `{ success, data }`, others flatten the entity on the response root. */
function extractRoleDetailFromHttpBody(body: unknown, roleIdHint: string): RoleDetail {
  if (body === null || typeof body !== 'object') {
    return normalizeRoleDetail({}, roleIdHint)
  }

  const root = body as Record<string, unknown>

  const inner = root.data !== undefined ? root.data : body

  if (inner !== null && typeof inner === 'object') {
    const obj = inner as Record<string, unknown>
    const looksLikeRoleEnvelope =
      'role' in obj && obj.role !== null && typeof obj.role === 'object'

    const candidate =
      looksLikeRoleEnvelope ? (obj.role as RoleDetail) : (inner as RoleDetail)

    const normalized = normalizeRoleDetail(candidate as unknown, roleIdHint)
    if (normalized.permissions.length || normalized.name_en || normalized.name_ar || normalized.id) {
      return normalized
    }

    /** Try parsing the HTTP body root when nested `data` had no usable role fields yet */
    const fromRoot = normalizeRoleDetail(body, roleIdHint)
    if (fromRoot.permissions.length || fromRoot.id) return fromRoot
  }

  return normalizeRoleDetail(body as RoleDetail, roleIdHint)
}

/* ------------------------------------------------------------------ */
/*  API                                                                 */
/* ------------------------------------------------------------------ */

export async function listRoles(
  params: ListRolesParams,
): Promise<{ data: RoleListItem[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: RoleListItem[]
    meta: PaginationMeta
  }>('/admin/roles', { params })
  const body = res.data
  return { data: body.data, meta: body.meta }
}

export async function getRolePermissionModules(): Promise<RolePermissionModule[]> {
  const res = await api.get<{
    success?: boolean
    data: RolePermissionModule[]
  }>('/admin/roles/permissions')
  return res.data.data
}

export async function getRole(roleId: string): Promise<RoleDetail> {
  const res = await api.get<unknown>(`/admin/roles/${roleId}`)
  return extractRoleDetailFromHttpBody(res.data, roleId)
}

export async function createRole(payload: CreateRolePayload): Promise<RoleDetail> {
  const res = await api.post<unknown>('/admin/roles', payload)
  return extractRoleDetailFromHttpBody(res.data, '')
}

export async function updateRole(
  roleId: string,
  payload: UpdateRolePayload,
): Promise<RoleDetail> {
  const res = await api.patch<unknown>(`/admin/roles/${roleId}`, payload)
  return extractRoleDetailFromHttpBody(res.data, roleId)
}

export async function deleteRole(roleId: string): Promise<void> {
  await api.delete(`/admin/roles/${roleId}`)
}
