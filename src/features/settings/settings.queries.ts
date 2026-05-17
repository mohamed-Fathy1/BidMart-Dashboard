import { useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  getSystemSettings,
  updateSystemSettings,
  type UpdateSystemSettingsPatch,
} from '@/features/settings/settings.api'

export const settingsKeys = {
  all: ['settings'] as const,
  system: ['settings', 'system'] as const,
}

export function useSystemSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.system,
    queryFn: getSystemSettings,
    staleTime: 60_000,
  })
}

export function useUpdateSystemSettingsMutation() {
  return useResourceMutation({
    mutationFn: (patch: UpdateSystemSettingsPatch) => updateSystemSettings(patch),
    invalidate: [settingsKeys.system],
    successKey: 'settings:toasts.update_success',
    errorKey: 'settings:errors.update_failed',
  })
}
