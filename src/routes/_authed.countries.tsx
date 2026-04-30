import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { CountriesListPage } from '@/features/countries/countries-list-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/countries')({
  component: CountriesRoute,
})

function CountriesRoute() {
  const allowed = usePermission(PERMISSIONS.countries.view)
  if (!allowed) return <PermissionDenied />
  return <CountriesListPage />
}
