import { api } from '@/lib/axios'
import { unwrap, type ApiEnvelope } from '@/types/api'

export interface LiveShowSettings {
  maxDurationMinutes: number
  updatedAt: string
}

export interface UpdateLiveShowSettingsPayload {
  maxDurationMinutes: number
}

export async function getLiveShowSettings(): Promise<LiveShowSettings> {
  const res = await api.get<ApiEnvelope<LiveShowSettings> | LiveShowSettings>(
    '/admin/shows/settings',
  )
  return unwrap(res.data)
}

export async function updateLiveShowSettings(
  payload: UpdateLiveShowSettingsPayload,
): Promise<LiveShowSettings> {
  const res = await api.patch<ApiEnvelope<LiveShowSettings> | LiveShowSettings>(
    '/admin/shows/settings',
    payload,
  )
  return unwrap(res.data)
}
