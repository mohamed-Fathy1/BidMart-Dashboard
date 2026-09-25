import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MetricBand } from '@/components/shared/metric-band'
import { MetricValue } from '@/components/shared/metric-value'
import { MonthlyFinancialChart } from '@/features/overview/monthly-financial-chart'
import { useStatisticsQuery } from '@/features/overview/overview.queries'
import { StatisticsTabFrame } from '@/features/overview/statistics-tab-frame'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

const MONEY_CELL = 'text-end font-mono tabular-nums'

const BUCKET_LABEL = {
  pendingPayment: 'pending_payment',
  delivered: 'delivered',
  refunds: 'refunds',
} as const

/** Zero months recede so the months with activity carry the table. */
function moneyCell(value: number) {
  return cn(MONEY_CELL, value === 0 && 'text-muted-foreground/70')
}

export function FinancialOverviewTab() {
  const { t } = useTranslation()
  const query = useStatisticsQuery('financial-overview')

  return (
    <StatisticsTabFrame query={query} skeletonCount={4}>
      {(data) => (
        <>
          <MetricBand
            columns={4}
            items={[
              {
                key: 'commission_revenue',
                label: t('overview:financial.commission_revenue'),
                value: <MetricValue value={data.totalCommissionRevenue} currency />,
              },
              {
                key: 'total_sales',
                label: t('overview:financial.total_sales'),
                value: <MetricValue value={data.totalSales} currency />,
              },
              {
                key: 'tax_collected',
                label: t('overview:financial.tax_collected'),
                value: <MetricValue value={data.totalTaxCollected} currency />,
              },
              {
                key: 'shipping_collected',
                label: t('overview:financial.shipping_collected'),
                value: <MetricValue value={data.totalShippingCollected} currency />,
              },
            ]}
          />

          <MetricBand
            columns={3}
            items={(['pendingPayment', 'delivered', 'refunds'] as const).map((key) => ({
              key,
              label: t(`overview:financial.${BUCKET_LABEL[key]}`),
              value: <MetricValue value={data[key].value} currency />,
              hint: t('overview:financial.orders_count', { count: data[key].count }),
            }))}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('overview:financial.monthly.title')}</CardTitle>
              <CardDescription>{t('overview:financial.monthly.hint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MonthlyFinancialChart rows={data.monthlyReports} />

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('overview:financial.monthly.month')}</TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.gross_sales')}
                      </TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.commission')}
                      </TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.tax')}
                      </TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.shipping')}
                      </TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.refunds')}
                      </TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.platform_revenue')}
                      </TableHead>
                      <TableHead className="text-end">
                        {t('overview:financial.monthly.net')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.monthlyReports.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format.month(row.month, { withYear: true })}
                        </TableCell>
                        <TableCell className={moneyCell(row.grossSales)}>
                          {format.currency(row.grossSales)}
                        </TableCell>
                        <TableCell className={moneyCell(row.commission)}>
                          {format.currency(row.commission)}
                        </TableCell>
                        <TableCell className={moneyCell(row.tax)}>{format.currency(row.tax)}</TableCell>
                        <TableCell className={moneyCell(row.shipping)}>
                          {format.currency(row.shipping)}
                        </TableCell>
                        <TableCell className={moneyCell(row.refunds)}>{format.currency(row.refunds)}</TableCell>
                        <TableCell className={moneyCell(row.platformRevenue)}>
                          {format.currency(row.platformRevenue)}
                        </TableCell>
                        <TableCell
                          className={cn(moneyCell(row.net), 'font-medium', row.net < 0 && 'text-destructive')}
                        >
                          {format.currency(row.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </StatisticsTabFrame>
  )
}
