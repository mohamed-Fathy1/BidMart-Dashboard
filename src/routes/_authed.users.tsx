import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
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

  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/users/$userId' })

  return detailMatch ? <Outlet /> : <UsersListPage />
}
