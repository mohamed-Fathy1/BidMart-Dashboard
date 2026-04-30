import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SubCategoriesListPage } from '@/features/categories/sub-categories-list-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/categories_/$categoryId/sub-categories')({
  component: SubCategoriesRoute,
})

function SubCategoriesRoute() {
  const { categoryId } = Route.useParams()
  const allowed = usePermission(PERMISSIONS.subCategories.view)
  if (!allowed) return <PermissionDenied />
  return <SubCategoriesListPage categoryId={categoryId} />
}
