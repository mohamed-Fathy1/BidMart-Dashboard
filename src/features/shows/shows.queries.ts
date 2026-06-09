import { useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  getLiveShowSettings,
  updateLiveShowSettings,
  type UpdateLiveShowSettingsPayload,
} from '@/features/shows/shows.api'

export const showsKeys = {
  all: ['shows'] as const,
  settings: ['shows', 'settings'] as const,
}

export function useLiveShowSettingsQuery() {
  return useQuery({
    queryKey: showsKeys.settings,
    queryFn: getLiveShowSettings,
    staleTime: 60_000,
  })
}

export function useUpdateLiveShowSettingsMutation() {
  return useResourceMutation({
    mutationFn: (payload: UpdateLiveShowSettingsPayload) =>
      updateLiveShowSettings(payload),
    invalidate: [showsKeys.settings],
    successKey: 'shows:toasts.update_success',
    errorKey: 'shows:errors.update_failed',
  })
}
