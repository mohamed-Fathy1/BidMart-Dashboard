import { createFileRoute } from '@tanstack/react-router'
import { CategoriesListPage } from '@/features/categories/categories-list-page'
import { parseListSearchBase, type ListSearchBase } from '@/lib/list-search'

export type CategoriesSearch = ListSearchBase

export const Route = createFileRoute('/_authed/categories/')({
  validateSearch: (search: Record<string, unknown>): CategoriesSearch =>
    parseListSearchBase(search),
  component: CategoriesIndexRoute,
})

function CategoriesIndexRoute() {
  return <CategoriesListPage />
}
