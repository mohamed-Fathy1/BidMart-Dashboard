import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { CategoriesListPage } from '@/features/categories/categories-list-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/categories')({
  component: CategoriesRoute,
})

function CategoriesRoute() {
  const allowed = usePermission(PERMISSIONS.categories.view)
  if (!allowed) return <PermissionDenied />
  return <CategoriesListPage />
}
