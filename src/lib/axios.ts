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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401) {
        localStorage.removeItem('bidmart-auth')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      if (status === 403) {
        toast.error(i18n.t('common:errors.permission_denied'))
        return Promise.reject(error)
      }
    }
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { message?: string })?.message ?? error.message
      : 'An unexpected error occurred'
    return Promise.reject({ message, status: axios.isAxiosError(error) ? error.response?.status : 500 })
  },
)

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api(config)
  return response.data as T
}
