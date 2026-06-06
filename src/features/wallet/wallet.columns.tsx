import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { AdminWalletTxItem } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

export function useWalletColumns(): ColumnDef<AdminWalletTxItem>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'id',
      header: t('wallet:transactions.columns.reference'),
      cell: ({ getValue }) => {
        const id = getValue<string>()
        const short = id.length > 12 ? `${id.slice(0, 8)}…` : id
        return (
          <span
            className="inline-flex rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs tabular-nums text-muted-foreground"
            title={id}
          >
            {short}
          </span>
        )
      },
      size: 140,
      enableSorting: false,
    },
    {
      accessorKey: 'type',
      header: t('wallet:transactions.columns.type'),
      cell: ({ getValue }) => (
        <StatusBadge type="walletTx" status={getValue<AdminWalletTxItem['type']>()} />
      ),
      size: 200,
    },
    {
      accessorKey: 'amount',
      header: t('wallet:transactions.columns.amount'),
      cell: ({ getValue }) => {
        const raw = getValue<string>()
        const { sign } = format.signedMoney(raw)
        return (
          <span
            className={cn(
              'inline-flex font-mono text-sm font-medium tabular-nums',
              sign === '+' ? 'text-emerald-600' : 'text-destructive',
            )}
            dir="ltr"
          >
            {raw}
          </span>
        )
      },
      size: 140,
    },
    {
      accessorKey: 'status',
      header: t('wallet:transactions.columns.status'),
      cell: ({ getValue }) => {
        const v = getValue<AdminWalletTxItem['status']>()
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border ps-2 pe-2.5 py-0.5 text-xs font-medium leading-5',
              v === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                : 'bg-amber-50 text-amber-700 border-amber-200/70',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                v === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            {t(`wallet:tx_status.${v}`)}
          </span>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'notes',
      header: t('wallet:transactions.columns.notes'),
      cell: ({ getValue }) => {
        const v = getValue<string | null>()
        return v ? (
          <span className="block max-w-[320px] truncate text-sm text-foreground" title={v}>
            {v}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      size: 320,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: t('wallet:transactions.columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.dateTime(getValue<string>())}
        </span>
      ),
      size: 180,
    },
  ]
}
