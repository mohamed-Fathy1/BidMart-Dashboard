import { useTranslation } from 'react-i18next'
import { format } from '@/lib/format'
import type { FinancialReportTotals as FinancialReportTotalsValue } from '@/types/api'

interface FinancialReportTotalsProps {
  totals: FinancialReportTotalsValue
}

/**
 * The totals strip under the rows. Every figure comes from `meta.totals`, so
 * it covers the whole filtered set rather than the visible page.
 */
export function FinancialReportTotals({ totals }: FinancialReportTotalsProps) {
  const { t } = useTranslation()

  const figures = [
    {
      key: 'store_profit',
      label: t('reports:financial.totals.store_profit'),
      value: format.currency(totals.totalStoreProfit),
    },
    {
      key: 'tax',
      label: t('reports:financial.totals.tax'),
      value: format.currency(totals.totalTaxCollected),
    },
    {
      key: 'platform_profit',
      label: t('reports:financial.totals.platform_profit'),
      value: format.currency(totals.totalPlatformProfit),
    },
    {
      key: 'order_value',
      label: t('reports:financial.totals.order_value'),
      value: format.currency(totals.totalOrderValue),
    },
    {
      key: 'orders',
      label: t('reports:financial.totals.orders'),
      value: format.number(totals.totalCompletedOrders),
    },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {t('reports:financial.totals.caption', { count: totals.totalCompletedOrders })}
      </p>
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {figures.map((figure) => (
          <div key={figure.key} className="text-end">
            <dt className="text-xs text-muted-foreground">{figure.label}</dt>
            <dd className="font-mono text-sm font-medium tabular-nums text-foreground">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
