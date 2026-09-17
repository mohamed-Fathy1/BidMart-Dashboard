import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { financialBucketFor } from '@/features/reports/financial-report-status'
import { format } from '@/lib/format'
import type { FinancialReportRow } from '@/types/api'

const MONEY_CELL = 'block text-end font-mono tabular-nums text-sm text-foreground'
const MONEY_HEADER = 'block text-end'

export function useFinancialReportColumns(): ColumnDef<FinancialReportRow>[] {
  const { t } = useTranslation()

  return useMemo(() => {
    const money = (
      id: keyof FinancialReportRow,
      labelKey: string,
      emphasis?: string,
    ): ColumnDef<FinancialReportRow> => ({
      accessorKey: id,
      header: () => <span className={MONEY_HEADER}>{t(labelKey)}</span>,
      cell: ({ row }) => (
        <span className={emphasis ? `${MONEY_CELL} ${emphasis}` : MONEY_CELL}>
          {format.currency(row.original[id] as number, { currency: row.original.currencyCode })}
        </span>
      ),
    })

    return [
      {
        accessorKey: 'orderNumber',
        header: t('reports:financial.columns.order_number'),
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
        accessorKey: 'orderDate',
        header: t('reports:financial.columns.date'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {format.date(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: t('reports:financial.columns.customer'),
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
        accessorKey: 'storeName',
        header: t('reports:financial.columns.store'),
        cell: ({ getValue }) => {
          const value = getValue<string>()
          return (
            <span className="block max-w-40 truncate text-sm text-foreground" title={value}>
              {value}
            </span>
          )
        },
      },
      money('storeProfit', 'reports:financial.columns.store_profit'),
      money('taxValue', 'reports:financial.columns.tax'),
      money('platformProfit', 'reports:financial.columns.platform_profit'),
      money('shippingFee', 'reports:financial.columns.shipping'),
      money('orderTotal', 'reports:financial.columns.order_total', 'font-medium'),
      {
        id: 'status',
        header: t('reports:financial.columns.status'),
        cell: ({ row }) => {
          const bucket = financialBucketFor(row.original.status)
          return bucket ? (
            <StatusBadge type="financialBucket" status={bucket} />
          ) : (
            <StatusBadge type="orderStatus" status={row.original.status} />
          )
        },
      },
    ]
  }, [t])
}
