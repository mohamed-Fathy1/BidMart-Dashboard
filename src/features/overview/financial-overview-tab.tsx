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
import { StatCard } from '@/components/shared/stat-card'
import { LazyMonthlyFinancialChart } from '@/features/overview/lazy-monthly-financial-chart'
import { useStatisticsQuery } from '@/features/overview/overview.queries'
import { StatisticsTabFrame } from '@/features/overview/statistics-tab-frame'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

const MONEY_CELL = 'text-end font-mono tabular-nums'

export function FinancialOverviewTab() {
  const { t } = useTranslation()
  const query = useStatisticsQuery('financial-overview')

  return (
    <StatisticsTabFrame query={query} skeletonCount={4}>
      {(data) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('overview:financial.commission_revenue')}
              value={format.currency(data.totalCommissionRevenue)}
            />
            <StatCard
              label={t('overview:financial.total_sales')}
              value={format.currency(data.totalSales)}
            />
            <StatCard
              label={t('overview:financial.tax_collected')}
              value={format.currency(data.totalTaxCollected)}
            />
            <StatCard
              label={t('overview:financial.shipping_collected')}
              value={format.currency(data.totalShippingCollected)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('overview:financial.pending_payment')}
              value={format.currency(data.pendingPayment.value)}
              hint={t('overview:financial.orders_count', { count: data.pendingPayment.count })}
            />
            <StatCard
              label={t('overview:financial.delivered')}
              value={format.currency(data.delivered.value)}
              hint={t('overview:financial.orders_count', { count: data.delivered.count })}
            />
            <StatCard
              label={t('overview:financial.refunds')}
              value={format.currency(data.refunds.value)}
              hint={t('overview:financial.orders_count', { count: data.refunds.count })}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('overview:financial.monthly.title')}</CardTitle>
              <CardDescription>{t('overview:financial.monthly.hint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LazyMonthlyFinancialChart rows={data.monthlyReports} />

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
                        <TableCell className={MONEY_CELL}>
                          {format.currency(row.grossSales)}
                        </TableCell>
                        <TableCell className={MONEY_CELL}>
                          {format.currency(row.commission)}
                        </TableCell>
                        <TableCell className={MONEY_CELL}>{format.currency(row.tax)}</TableCell>
                        <TableCell className={MONEY_CELL}>
                          {format.currency(row.shipping)}
                        </TableCell>
                        <TableCell className={MONEY_CELL}>{format.currency(row.refunds)}</TableCell>
                        <TableCell className={MONEY_CELL}>
                          {format.currency(row.platformRevenue)}
                        </TableCell>
                        <TableCell
                          className={cn(MONEY_CELL, 'font-medium', row.net < 0 && 'text-destructive')}
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
