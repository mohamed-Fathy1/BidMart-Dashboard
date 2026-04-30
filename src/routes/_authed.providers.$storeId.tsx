import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { ProviderDetailPage } from '@/features/providers/provider-detail-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/providers/$storeId')({
  component: ProviderDetailRoute,
})

function ProviderDetailRoute() {
  const { storeId } = Route.useParams()
  const allowed = usePermission(PERMISSIONS.providers.view)
  if (!allowed) return <PermissionDenied />
  return <ProviderDetailPage storeId={storeId} />
}
