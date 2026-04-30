import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/permissions'
import { UsersListPage } from '@/features/users/users-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { usePermission } from '@/lib/permissions'

export const Route = createFileRoute('/_authed/users')({
  component: UsersRoute,
})

function UsersRoute() {
  const allowed = usePermission(PERMISSIONS.users.view)
  if (!allowed) return <PermissionDenied />
  return <UsersListPage />
}
