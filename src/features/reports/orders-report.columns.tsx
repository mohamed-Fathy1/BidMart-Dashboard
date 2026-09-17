import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { OrderReportRow } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useOrdersReportColumns(): ColumnDef<OrderReportRow>[] {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: t('reports:orders.columns.order_number'),
        cell: ({ getValue }) => {
          const value = getValue<string>()
          return (
            <span className="font-mono text-xs text-foreground" title={value}>
              {value}
            </span>
          )
        },
      },
      {
        accessorKey: 'buyerName',
        header: t('reports:orders.columns.buyer'),
        cell: ({ getValue }) => {
          const value = getValue<string>()
          return (
            <span className="block max-w-40 truncate text-sm text-foreground" title={value}>
              {value}
            </span>
          )
        },
      },
      {
        accessorKey: 'sellerName',
        header: t('reports:orders.columns.seller'),
        cell: ({ getValue }) => {
          const value = getValue<string>()
          return (
            <span className="block max-w-40 truncate text-sm text-foreground" title={value}>
              {value}
            </span>
          )
        },
      },
      {
        id: 'status',
        header: t('reports:orders.columns.status'),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <StatusBadge type="orderGroup" status={row.original.group} />
            <span className="text-xs text-muted-foreground">
              {t(`reports:order_status.${row.original.status}`)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'statusDate',
        header: t('reports:orders.columns.status_date'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {format.dateTime(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: () => (
          <span className="block text-end">{t('reports:orders.columns.total')}</span>
        ),
        cell: ({ row }) => (
          <span className="block text-end font-mono tabular-nums font-medium text-foreground">
            {format.currency(row.original.total, { currency: row.original.currencyCode })}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('reports:orders.columns.created'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {format.date(getValue<string>())}
          </span>
        ),
      },
    ],
    [t],
  )
}
