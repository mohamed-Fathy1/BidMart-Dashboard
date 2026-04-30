import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { UserDetailPage } from '@/features/users/user-detail-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/users/$userId')({
  component: UserDetailRoute,
})

function UserDetailRoute() {
  const { userId } = Route.useParams()
  const allowed = usePermission(PERMISSIONS.users.view)
  if (!allowed) return <PermissionDenied />
  return <UserDetailPage userId={userId} />
}
