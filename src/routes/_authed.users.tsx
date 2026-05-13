import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/permissions'
import { UsersListPage } from '@/features/users/users-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { usePermission } from '@/lib/permissions'
import { parseListSearchBase, readEnum, type ListSearchBase } from '@/lib/list-search'
import type { AccountType } from '@/types/api'

export type UsersListStatus = 'active' | 'suspended' | 'banned'
const USER_STATUS_VALUES: readonly UsersListStatus[] = ['active', 'suspended', 'banned']
const ACCOUNT_TYPE_VALUES: readonly AccountType[] = ['user_only', 'upgraded_to_seller']

export interface UsersSearch extends ListSearchBase {
  status?: UsersListStatus
  accountType?: AccountType
}

export const Route = createFileRoute('/_authed/users')({
  validateSearch: (search: Record<string, unknown>): UsersSearch => ({
    ...parseListSearchBase(search),
    status: readEnum(search.status, USER_STATUS_VALUES),
    accountType: readEnum(search.accountType, ACCOUNT_TYPE_VALUES),
  }),
  component: UsersRoute,
})

function UsersRoute() {
  const allowed = usePermission(PERMISSIONS.users.view)
  if (!allowed) return <PermissionDenied />

  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/users/$userId' })

  return detailMatch ? <Outlet /> : <UsersListPage />
}
