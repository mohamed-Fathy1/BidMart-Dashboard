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
  email?: string
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

function decodeJwtPayload<T>(token: string): T {
  const part = token.split('.')[1]
  if (!part) throw new Error('Invalid token')
  const padded = part.replace(/-/g, '+').replace(/_/g, '/')
  const withPad = padded.padEnd(Math.ceil(padded.length / 4) * 4, '=')
  return JSON.parse(atob(withPad)) as T
}

function unwrapSuccessEnvelope<T>(body: unknown): T | undefined {
  if (!body || typeof body !== 'object') return undefined
  const maybe = body as Record<string, unknown>
  const data = maybe.data
  if (typeof data !== 'object' || data === null) return undefined
  if ('success' in maybe && maybe.success === false) return undefined
  return data as T
}

function extractAccessToken(body: unknown): string {
  const fromEnvelope = unwrapSuccessEnvelope<{ accessToken: string }>(body)?.accessToken
  if (typeof fromEnvelope === 'string' && fromEnvelope) return fromEnvelope

  const flat = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  const nestedData = flat.data
  const fromNested =
    typeof nestedData === 'object' &&
    nestedData !== null &&
    typeof (nestedData as { accessToken?: string }).accessToken === 'string'
      ? (nestedData as { accessToken: string }).accessToken
      : undefined
  const token =
    (typeof flat.accessToken === 'string' ? flat.accessToken : undefined) ?? fromNested

  if (!token) throw new Error('Missing access token in login response')
  return token
}

function buildSessionFromToken(token: string): { user: User; permissions: string[] } {
  const payload = decodeJwtPayload<AdminJwtPayload>(token)

  const user: User = {
    id: payload.sub,
    name: payload.email ?? '',
    email: payload.email ?? '',
    role: payload.role,
    roleId: payload.role_id,
    isSuperAdmin: payload.is_super_admin,
  }

  return { user, permissions: payload.permissions ?? [] }
}

/** Role object returned by `GET` / `PATCH /admin/profile`. */
export interface AdminProfileRoleDto {
  id: string
  name_en: string
  name_ar: string
}

export interface AdminProfileDto {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: AdminProfileRoleDto
  isSuperAdmin: boolean
}

export function userFromAdminProfile(profile: AdminProfileDto, jwtRole: string): User {
  return {
    id: profile.id,
    name: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    role: jwtRole,
    roleId: profile.role.id,
    isSuperAdmin: profile.isSuperAdmin,
    roleNameEn: profile.role.name_en,
    roleNameAr: profile.role.name_ar,
  }
}

export async function getAdminProfileRequest(): Promise<AdminProfileDto> {
  const res = await api.get<unknown>('/admin/profile')
  const data = unwrapSuccessEnvelope<AdminProfileDto>(res.data)
  if (!data?.id || !data.role?.id) throw new Error('Invalid profile response')
  return data
}

export interface UpdateAdminProfileInput {
  fullName: string
  email: string
  phone: string | null
}

export interface UpdateAdminProfileResult {
  message: string
  admin: AdminProfileDto
}

export async function updateAdminProfileRequest(
  body: UpdateAdminProfileInput,
): Promise<UpdateAdminProfileResult> {
  const res = await api.patch<unknown>('/admin/profile', {
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
  })
  const data = unwrapSuccessEnvelope<{ message: string; admin: AdminProfileDto }>(res.data)
  if (!data?.message || !data.admin?.id) throw new Error('Invalid profile update response')
  return { message: data.message, admin: data.admin }
}

function parseForgotEnvelope(body: unknown): { message: string; otp?: string } {
  const inner =
    unwrapSuccessEnvelope<{ message: string; otp?: string }>(body)
    ?? (typeof body === 'object' &&
        body !== null &&
        typeof (body as { message?: string }).message === 'string'
      ? (body as { message: string; otp?: string })
      : undefined)
  if (!inner?.message) throw new Error('Invalid forgot-password response')
  return inner
}

function parseResetEnvelope(body: unknown): { message: string } {
  const inner =
    unwrapSuccessEnvelope<{ message: string }>(body)
    ?? (typeof body === 'object' &&
        body !== null &&
        typeof (body as { message?: string }).message === 'string'
      ? (body as { message: string })
      : undefined)
  if (!inner?.message) throw new Error('Invalid reset-password response')
  return inner
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<unknown>('/admin/auth/login', {
    email: data.email,
    password: data.password,
    rememberMe: data.rememberMe ?? false,
    deviceId: 'admin-panel',
  })

  const token = extractAccessToken(res.data)
  const { user, permissions } = buildSessionFromToken(token)

  return { token, user, permissions }
}

export async function getMeRequest(): Promise<MeResponse> {
  const raw = localStorage.getItem('bidmart-auth')
  if (!raw) throw new Error('No token')

  const parsed = JSON.parse(raw) as { state?: { token?: string } }
  const token = parsed?.state?.token
  if (!token) throw new Error('No token')

  const payload = decodeJwtPayload<AdminJwtPayload>(token)
  if (payload.exp * 1000 < Date.now()) {
    throw new Error('Token expired')
  }

  const profile = await getAdminProfileRequest()
  const user = userFromAdminProfile(profile, payload.role)

  return { user, permissions: payload.permissions ?? [] }
}

export async function logoutRequest(): Promise<void> {
  await api.post('/admin/auth/logout')
}

/* ------------------------------------------------------------------ */
/*  Forgot / Reset password                                            */
/* ------------------------------------------------------------------ */

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  otp?: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

export async function forgotPasswordRequest(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const res = await api.post<unknown>(
    '/admin/auth/forgot-password',
    data,
  )
  return parseForgotEnvelope(res.data)
}

export async function resendForgotPasswordOtp(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const res = await api.post<unknown>(
    '/admin/auth/forgot-password/resend',
    data,
  )
  return parseForgotEnvelope(res.data)
}

export async function resetPasswordRequest(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const res = await api.post<unknown>(
    '/admin/auth/reset-password',
    data,
  )
  return parseResetEnvelope(res.data)
}
