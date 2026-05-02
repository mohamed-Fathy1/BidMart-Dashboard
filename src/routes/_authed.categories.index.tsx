import { createFileRoute } from '@tanstack/react-router'
import { CategoriesListPage } from '@/features/categories/categories-list-page'

export const Route = createFileRoute('/_authed/categories/')({
  component: CategoriesIndexRoute,
})

function CategoriesIndexRoute() {
  return <CategoriesListPage />
}
