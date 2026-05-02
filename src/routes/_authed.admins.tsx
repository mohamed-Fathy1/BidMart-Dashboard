import { createFileRoute } from '@tanstack/react-router'
import { AdminsListPage } from '@/features/admins/admins-list-page'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/admins')({
  component: AdminsRoute,
})

function AdminsRoute() {
  const allowed = usePermission(PERMISSIONS.admins.view)
  if (!allowed) return <PermissionDenied />

  return <AdminsListPage />
}
