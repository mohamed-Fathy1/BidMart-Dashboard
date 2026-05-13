import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { ProvidersListPage } from '@/features/providers/providers-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readEnum, type ListSearchBase } from '@/lib/list-search'
import type { ProviderAccountStatus } from '@/types/api'

const PROVIDER_STATUS_VALUES: readonly ProviderAccountStatus[] = [
  'pending',
  'approved',
  'rejected',
  'blocked',
]

export interface ProvidersSearch extends ListSearchBase {
  status?: ProviderAccountStatus
}

export const Route = createFileRoute('/_authed/providers')({
  validateSearch: (search: Record<string, unknown>): ProvidersSearch => ({
    ...parseListSearchBase(search),
    status: readEnum(search.status, PROVIDER_STATUS_VALUES),
  }),
  component: ProvidersRoute,
})

function ProvidersRoute() {
  const allowed = usePermission(PERMISSIONS.providers.view)
  if (!allowed) return <PermissionDenied />

  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/providers/$storeId' })

  return detailMatch ? <Outlet /> : <ProvidersListPage />
}
