import { api } from '@/lib/axios'
import { unwrap, type ApiEnvelope, type SystemSettings } from '@/types/api'

/**
 * `PATCH /admin/settings` accepts any subset of the SystemSettings shape; we
 * only send the dirty fields so two admins editing different sections don't
 * clobber each other.
 */
export type UpdateSystemSettingsPatch = Partial<SystemSettings>

export async function getSystemSettings(): Promise<SystemSettings> {
  const res = await api.get<ApiEnvelope<SystemSettings> | SystemSettings>(
    '/admin/settings',
  )
  return unwrap(res.data)
}

export async function updateSystemSettings(
  patch: UpdateSystemSettingsPatch,
): Promise<SystemSettings> {
  const res = await api.patch<ApiEnvelope<SystemSettings> | SystemSettings>(
    '/admin/settings',
    patch,
  )
  return unwrap(res.data)
}
