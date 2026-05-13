import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SubCategoriesListPage } from '@/features/categories/sub-categories-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, type ListSearchBase } from '@/lib/list-search'

export type SubCategoriesNestedSearch = ListSearchBase

export const Route = createFileRoute('/_authed/categories/$categoryId/sub-categories')({
  validateSearch: (search: Record<string, unknown>): SubCategoriesNestedSearch =>
    parseListSearchBase(search),
  component: SubCategoriesNestedRoute,
})

function SubCategoriesNestedRoute() {
  const allowed = usePermission(PERMISSIONS.subCategories.view)
  if (!allowed) return <PermissionDenied />

  const { categoryId } = Route.useParams()
  return <SubCategoriesListPage variant="under-category" categoryId={categoryId} />
}
