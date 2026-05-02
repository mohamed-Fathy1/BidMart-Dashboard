import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { PermissionDenied } from '@/routes/_authed'
import { RolesListPage } from '@/features/roles/roles-list-page'

export const Route = createFileRoute('/_authed/roles')({
  component: RolesRoute,
})

function RolesRoute() {
  const allowed = usePermission(PERMISSIONS.roles.view)
  if (!allowed) return <PermissionDenied />

  return <RolesListPage />
}
