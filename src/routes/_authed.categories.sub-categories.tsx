import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SubCategoriesListPage } from '@/features/categories/sub-categories-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, type ListSearchBase } from '@/lib/list-search'

export interface SubCategoriesHubSearch extends ListSearchBase {
  parent?: string
}

export const Route = createFileRoute('/_authed/categories/sub-categories')({
  validateSearch: (search: Record<string, unknown>): SubCategoriesHubSearch => ({
    ...parseListSearchBase(search),
    parent:
      typeof search.parent === 'string' && search.parent.length > 0 ? search.parent : undefined,
  }),
  component: SubCategoriesHubRoute,
})

function SubCategoriesHubRoute() {
  const allowed = usePermission(PERMISSIONS.subCategories.view)
  if (!allowed) return <PermissionDenied />

  const { parent } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <SubCategoriesListPage
      variant="hub"
      categoryId={parent ?? ''}
      onHubParentChange={(id) => {
        void navigate({
          search: (prev) => ({
            ...prev,
            parent: id.length > 0 ? id : undefined,
          }),
        })
      }}
    />
  )
}
