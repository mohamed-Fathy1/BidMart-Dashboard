import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { SettlementListItem } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useWithdrawalColumns(): ColumnDef<SettlementListItem>[] {
  const { t } = useTranslation()

  return [
    {
      id: 'seller',
      header: t('withdrawals:columns.seller'),
      cell: ({ row }) => {
        const r = row.original
        return (
          <div className="min-w-0 max-w-[min(100%,260px)]">
            <p className="truncate font-medium text-foreground">{r.sellerName}</p>
            <p className="truncate font-mono text-xs tabular-nums text-muted-foreground" dir="ltr">
              {r.sellerPhone}
            </p>
          </div>
        )
      },
      size: 240,
      enableSorting: false,
    },
    {
      accessorKey: 'requestedAmount',
      header: t('withdrawals:columns.amount'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium tabular-nums text-foreground" dir="ltr">
          {format.currency(Number(getValue<string>()))}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: 'status',
      header: t('withdrawals:columns.status'),
      cell: ({ getValue }) => (
        <StatusBadge type="settlement" status={getValue<SettlementListItem['status']>()} />
      ),
      size: 120,
    },
    {
      accessorKey: 'submittedAt',
      header: t('withdrawals:columns.submitted_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.dateTime(getValue<string>())}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: 'actionedAt',
      header: t('withdrawals:columns.actioned_at'),
      cell: ({ getValue }) => {
        const value = getValue<string | null>()
        return value ? (
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {format.dateTime(value)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      size: 180,
    },
  ]
}
