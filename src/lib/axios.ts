import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { i18n } from '@/lib/i18n'
import { useAuthStore } from '@/features/auth/auth.store'

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 30_000,
})

function attachAuthHeaders(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Accept-Language'] = i18n.language
  return config
}

api.interceptors.request.use(attachAuthHeaders)

/** Unauthenticated admin auth mutations — don't force redirect on incorrect credentials etc. */
const PUBLIC_ADMIN_AUTH_RELATIVE_PATHS = [
  '/admin/auth/login',
  '/admin/auth/forgot-password',
  '/admin/auth/forgot-password/resend',
  '/admin/auth/reset-password',
] as const

function requestIsPublicAdminAuth(config: AxiosRequestConfig | undefined): boolean {
  if (!config?.url) return false
  const pathname = config.url.split('?')[0] ?? ''
  return PUBLIC_ADMIN_AUTH_RELATIVE_PATHS.some((path) => pathname.endsWith(path))
}

export function extractApiErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined
  const raw = error.response?.data as unknown
  if (!raw || typeof raw !== 'object') {
    return undefined
  }
  const obj = raw as Record<string, unknown>
  const fromData =
    typeof obj.data === 'object' &&
    obj.data !== null &&
    typeof (obj.data as { message?: string }).message === 'string'
      ? (obj.data as { message: string }).message
      : undefined
  const fromErrorObject =
    typeof obj.error === 'object' &&
    obj.error !== null &&
    typeof (obj.error as { message?: string }).message === 'string'
      ? (obj.error as { message: string }).message
      : undefined
  const msg = typeof obj.message === 'string' ? obj.message : undefined
  return fromData ?? fromErrorObject ?? msg
}

/**
 * Extract `error.code` from an `{ success: false, error: { code, ... } }` body.
 * Stable, language-independent — use this to branch UI on specific failure modes
 * (e.g. SETTLEMENT_ALREADY_ACTIONED → re-fetch; BANK_HAS_PENDING_SETTLEMENTS →
 * show a specific hint). Falls back to undefined for non-envelope errors.
 */
export function extractApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: unknown }).code
      if (typeof code === 'string' && code.trim()) return code
    }
    return undefined
  }
  const raw = error.response?.data as unknown
  if (!raw || typeof raw !== 'object') return undefined
  const obj = raw as Record<string, unknown>
  if (typeof obj.error === 'object' && obj.error !== null) {
    const code = (obj.error as { code?: unknown }).code
    if (typeof code === 'string' && code.trim()) return code
  }
  return undefined
}

/**
 * Extract a user-facing error message from any thrown value:
 * - AxiosError → nested `data.message` or `message` from the server body
 * - Plain `{ message }` reject from the response interceptor below
 * - Anything else → undefined (callers fall back to i18n copy)
 */
export function extractErrorMessage(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return extractApiErrorMessage(error)
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return undefined
}

/** The plain object every non-auth failure rejects with, instead of an `Error`. */
export interface ApiRejection {
  message: string
  code?: string
  status?: number
}

function toPlainRejection(error: unknown): ApiRejection {
  const message =
    extractApiErrorMessage(error) ??
    (axios.isAxiosError(error) ? error.message : undefined) ??
    i18n.t('common:errors.unexpected')
  return {
    message,
    code: extractApiErrorCode(error),
    status: axios.isAxiosError(error) ? error.response?.status : 500,
  }
}

export type SessionEndReason = 'expired' | 'account_disabled'

/**
 * Any 401 (`UNAUTHORIZED`, `TOKEN_REVOKED`) and a 403 `ACCOUNT_DISABLED` (the admin
 * was blocked or deleted) end the session. A 403 `FORBIDDEN` is a missing permission
 * and keeps the admin signed in. Public auth endpoints report these on the form.
 * `null` means the error is handled normally.
 */
export function sessionEndReason(error: unknown): SessionEndReason | null {
  if (!axios.isAxiosError(error) || requestIsPublicAdminAuth(error.config)) return null
  const status = error.response?.status
  if (status === 401) return 'expired'
  if (status === 403 && extractApiErrorCode(error) === 'ACCOUNT_DISABLED') {
    return 'account_disabled'
  }
  return null
}

/**
 * Clears the session and hard-navigates to sign-in. The returned promise never
 * settles, so no caller toasts or retries with the old token while the page unloads.
 */
function endSession(reason: SessionEndReason): Promise<never> {
  useAuthStore.getState().clearSession()
  window.location.replace(
    reason === 'account_disabled' ? '/login?reason=account_disabled' : '/login',
  )
  return new Promise<never>(() => {})
}

function handleResponseError(error: unknown): Promise<never> {
  const reason = sessionEndReason(error)
  if (reason) return endSession(reason)
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    !requestIsPublicAdminAuth(error.config)
  ) {
    toast.error(i18n.t('common:errors.permission_denied'))
    return Promise.reject(error)
  }
  return Promise.reject(toPlainRejection(error))
}

api.interceptors.response.use((response) => response, handleResponseError)

/**
 * Instance for endpoints that answer with a file body (`responseType: 'blob'`).
 * Same auth headers as `api`; its own response interceptor decodes a Blob error
 * body back to the JSON envelope so callers still get `{ message, code, status }`.
 */
export const fileApi = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 120_000,
})

fileApi.interceptors.request.use(attachAuthHeaders)

function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text()
  // jsdom's Blob has no `text()`; FileReader covers it.
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

async function decodeBlobErrorBody(error: unknown): Promise<void> {
  if (!axios.isAxiosError(error)) return
  const body = error.response?.data
  if (!(body instanceof Blob)) return
  try {
    error.response!.data = JSON.parse(await readBlobText(body))
  } catch {
    error.response!.data = undefined
  }
}

fileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    await decodeBlobErrorBody(error)
    return handleResponseError(error)
  },
)

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api(config)
  return response.data as T
}
