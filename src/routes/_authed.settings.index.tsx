import { createFileRoute } from '@tanstack/react-router'
import { SystemSettingsPage } from '@/features/settings/system-settings-page'

export const Route = createFileRoute('/_authed/settings/')({
  component: SettingsIndexRoute,
})

function SettingsIndexRoute() {
  return <SystemSettingsPage />
}
