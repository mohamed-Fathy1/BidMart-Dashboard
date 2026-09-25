import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { OrderReportRow } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { DateCell, OrderNumberCell, TruncatedTextCell } from '@/features/reports/report-cells'
import { format } from '@/lib/format'

export function useOrdersReportColumns(): ColumnDef<OrderReportRow>[] {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: t('reports:orders.columns.order_number'),
        cell: ({ getValue }) => <OrderNumberCell orderNumber={getValue<string>()} />,
      },
      {
        accessorKey: 'buyerName',
        header: t('reports:orders.columns.buyer'),
        cell: ({ getValue }) => <TruncatedTextCell text={getValue<string>()} className="max-w-40" />,
      },
      {
        accessorKey: 'sellerName',
        header: t('reports:orders.columns.seller'),
        cell: ({ getValue }) => <TruncatedTextCell text={getValue<string>()} className="max-w-40" />,
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
        cell: ({ getValue }) => <DateCell iso={getValue<string>()} withTime />,
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
        cell: ({ getValue }) => <DateCell iso={getValue<string>()} />,
      },
    ],
    [t],
  )
}
