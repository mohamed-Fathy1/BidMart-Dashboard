import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { CountriesListPage } from '@/features/countries/countries-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readBoolean, type ListSearchBase } from '@/lib/list-search'

export interface CountriesSearch extends ListSearchBase {
  isEnabled?: boolean
}

export const Route = createFileRoute('/_authed/countries')({
  validateSearch: (search: Record<string, unknown>): CountriesSearch => ({
    ...parseListSearchBase(search),
    isEnabled: readBoolean(search.isEnabled),
  }),
  component: CountriesRoute,
})

function CountriesRoute() {
  const allowed = usePermission(PERMISSIONS.countries.view)
  if (!allowed) return <PermissionDenied />
  return <CountriesListPage />
}
