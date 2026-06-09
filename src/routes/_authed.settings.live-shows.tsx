import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { LiveShowSettingsPage } from '@/features/shows/live-show-settings-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/settings/live-shows')({
  component: LiveShowSettingsRoute,
})

function LiveShowSettingsRoute() {
  const allowed = usePermission(PERMISSIONS.shows.view)
  if (!allowed) return <PermissionDenied />
  return <LiveShowSettingsPage />
}
