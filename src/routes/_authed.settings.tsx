import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SettingsSectionTabs } from '@/features/settings/settings-section-tabs'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/settings')({
  component: SettingsLayoutRoute,
})

function SettingsLayoutRoute() {
  const allowed = usePermission(PERMISSIONS.settings.view)
  if (!allowed) return <PermissionDenied />

  return (
    <div className="space-y-6">
      <SettingsSectionTabs />
      <Outlet />
    </div>
  )
}
