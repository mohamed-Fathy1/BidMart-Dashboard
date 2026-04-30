import { api } from '@/lib/axios'
import type { User } from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

interface LoginResponse {
  token: string
  user: User
  permissions: string[]
}

interface MeResponse {
  user: User
  permissions: string[]
}

/** Shape of the admin JWT payload */
interface AdminJwtPayload {
  sub: string
  role: string
  role_id: string
  is_super_admin: boolean
  permissions: string[]
  deviceId: string
  jti: string
  iat: number
  exp: number
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function decodeToken(token: string): AdminJwtPayload {
  const base64 = token.split('.')[1]
  if (!base64) throw new Error('Invalid token')
  return JSON.parse(atob(base64)) as AdminJwtPayload
}

function buildSessionFromToken(token: string): { user: User; permissions: string[] } {
  const payload = decodeToken(token)

  const user: User = {
    id: payload.sub,
    name: payload.role,
    email: '',
    role: payload.role,
  }

  // The backend already embeds the full permission list for super_admins,
  // so we can use payload.permissions directly in all cases.
  return { user, permissions: payload.permissions }
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<{ accessToken: string } | { data: { accessToken: string } }>(
    '/admin/auth/login',
    {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe ?? false,
      deviceId: 'admin-panel',
    },
  )

  // Handle both flat { accessToken } and wrapped { data: { accessToken } } responses
  const body = res.data as Record<string, unknown>
  const token = (body.accessToken as string)
    ?? ((body.data as Record<string, unknown>)?.accessToken as string)

  const { user, permissions } = buildSessionFromToken(token)

  return { token, user, permissions }
}

export async function getMeRequest(): Promise<MeResponse> {
  const raw = localStorage.getItem('bidmart-auth')
  if (!raw) throw new Error('No token')

  const parsed = JSON.parse(raw) as { state?: { token?: string } }
  const token = parsed?.state?.token
  if (!token) throw new Error('No token')

  // Check expiry
  const payload = decodeToken(token)
  if (payload.exp * 1000 < Date.now()) {
    throw new Error('Token expired')
  }

  return buildSessionFromToken(token)
}

export async function logoutRequest(): Promise<void> {
  await api.post('/admin/auth/logout')
}
