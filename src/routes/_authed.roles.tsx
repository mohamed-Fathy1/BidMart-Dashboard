import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { PermissionDenied } from '@/routes/_authed'
import { RolesListPage } from '@/features/roles/roles-list-page'
import { parseListSearchBase, type ListSearchBase } from '@/lib/list-search'

export type RolesSearch = ListSearchBase

export const Route = createFileRoute('/_authed/roles')({
  validateSearch: (search: Record<string, unknown>): RolesSearch => parseListSearchBase(search),
  component: RolesRoute,
})

function RolesRoute() {
  const allowed = usePermission(PERMISSIONS.roles.view)
  if (!allowed) return <PermissionDenied />

  return <RolesListPage />
}
