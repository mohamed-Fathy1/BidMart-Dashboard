import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SubCategoriesListPage } from '@/features/categories/sub-categories-list-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/categories/$categoryId/sub-categories')({
  component: SubCategoriesNestedRoute,
})

function SubCategoriesNestedRoute() {
  const allowed = usePermission(PERMISSIONS.subCategories.view)
  if (!allowed) return <PermissionDenied />

  const { categoryId } = Route.useParams()
  return <SubCategoriesListPage variant="under-category" categoryId={categoryId} />
}
