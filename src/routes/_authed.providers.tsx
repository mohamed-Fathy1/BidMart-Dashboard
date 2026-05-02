import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { ProvidersListPage } from '@/features/providers/providers-list-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/providers')({
  component: ProvidersRoute,
})

function ProvidersRoute() {
  const allowed = usePermission(PERMISSIONS.providers.view)
  if (!allowed) return <PermissionDenied />

  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/providers/$storeId' })

  return detailMatch ? <Outlet /> : <ProvidersListPage />
}
