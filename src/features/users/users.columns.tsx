import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { AdminUserListItem } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useUserColumns(): ColumnDef<AdminUserListItem>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'accountName',
      header: t('users:columns.account_name'),
      cell: ({ getValue }) =>
        getValue<string | null>() ?? (
          <span className="text-muted-foreground">-</span>
        ),
      size: 200,
    },
    {
      accessorKey: 'phoneNumber',
      header: t('users:columns.phone'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums" dir="ltr">{getValue<string>()}</span>
      ),
      size: 160,
    },
    {
      accessorKey: 'email',
      header: t('users:columns.email'),
      cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted-foreground">-</span>,
      size: 220,
    },
    {
      accessorKey: 'status',
      header: t('users:columns.status'),
      cell: ({ getValue }) => <StatusBadge status={getValue<AdminUserListItem['status']>()} />,
      size: 140,
    },
    {
      accessorKey: 'accountType',
      header: t('users:columns.account_type'),
      cell: ({ getValue }) => <StatusBadge type="accountType" status={getValue<AdminUserListItem['accountType']>()} />,
      size: 140,
    },
    {
      accessorKey: 'registrationDate',
      header: t('users:columns.registration_date'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{format.date(getValue<string>())}</span>
      ),
      size: 160,
    },
  ]
}
