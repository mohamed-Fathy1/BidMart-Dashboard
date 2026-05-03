import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/categories')({
  component: CategoriesLayoutRoute,
})

function CategoriesLayoutRoute() {
  const allowed = usePermission(PERMISSIONS.categories.view)
  if (!allowed) return <PermissionDenied />

  return <Outlet />
}
