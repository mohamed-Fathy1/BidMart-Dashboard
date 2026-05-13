import { createFileRoute } from '@tanstack/react-router'
import { AdminsListPage } from '@/features/admins/admins-list-page'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readBoolean, type ListSearchBase } from '@/lib/list-search'

export interface AdminsSearch extends ListSearchBase {
  isActive?: boolean
}

export const Route = createFileRoute('/_authed/admins')({
  validateSearch: (search: Record<string, unknown>): AdminsSearch => ({
    ...parseListSearchBase(search),
    isActive: readBoolean(search.isActive),
  }),
  component: AdminsRoute,
})

function AdminsRoute() {
  const allowed = usePermission(PERMISSIONS.admins.view)
  if (!allowed) return <PermissionDenied />

  return <AdminsListPage />
}
