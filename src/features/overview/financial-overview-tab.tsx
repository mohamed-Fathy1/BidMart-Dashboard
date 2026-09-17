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
import { StatisticsErrorCard } from '@/features/overview/statistics-error-card'
import { StatisticsTileSkeleton } from '@/features/overview/statistics-tab-skeleton'
import { StatisticsWindowLabel } from '@/features/overview/statistics-window-label'
import { useStatisticsWindow } from '@/features/overview/use-statistics-window'
import { useFinancialOverviewQuery } from '@/features/overview/overview.queries'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * `YYYY-MM` as a short month and year. Built here rather than in `format.ts`
 * because this table is the only surface that renders a bare month key. The
 * locale rule mirrors `format.ts`: Arabic is pinned to the Gregorian calendar.
 */
function monthLabel(month: string, language: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return month
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
  const locale = language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-SA'
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

const MONEY_CELL = 'text-end font-mono tabular-nums'

export function FinancialOverviewTab() {
  const { t, i18n } = useTranslation()
  const { params, anchorError } = useStatisticsWindow()
  const { data, isPending, isFetching, isError, error, refetch } = useFinancialOverviewQuery(
    params,
    { enabled: !anchorError },
  )

  return (
    <div
      className={cn(
        'space-y-6 transition-opacity duration-(--duration-hover) ease-(--ease-default)',
        isFetching && !isPending && 'opacity-60',
      )}
      aria-busy={isFetching && !isPending}
    >
      <StatisticsWindowLabel range={data?.dateRange} isPending={isPending} />

      {isPending ? (
        <StatisticsTileSkeleton count={4} />
      ) : isError ? (
        <StatisticsErrorCard error={error} onRetry={() => void refetch()} />
      ) : data ? (
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
                          {monthLabel(row.month, i18n.language)}
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
      ) : null}
    </div>
  )
}
