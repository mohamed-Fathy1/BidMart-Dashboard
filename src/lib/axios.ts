import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { i18n } from '@/lib/i18n'

export const api = axios.create({
  baseURL: env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('bidmart-auth')
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string } }
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore parse errors
    }
  }
  config.headers['Accept-Language'] = i18n.language
  return config
})

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
  const msg = typeof obj.message === 'string' ? obj.message : undefined
  return fromData ?? msg
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401 && !requestIsPublicAdminAuth(error.config)) {
        localStorage.removeItem('bidmart-auth')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      if (status === 403 && !requestIsPublicAdminAuth(error.config)) {
        toast.error(i18n.t('common:errors.permission_denied'))
        return Promise.reject(error)
      }
    }
    const message =
      extractApiErrorMessage(error) ??
      (axios.isAxiosError(error) ? error.message : undefined) ??
      i18n.t('common:errors.unexpected')
    return Promise.reject({ message, status: axios.isAxiosError(error) ? error.response?.status : 500 })
  },
)

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api(config)
  return response.data as T
}
