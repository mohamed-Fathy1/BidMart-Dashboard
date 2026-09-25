import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProportionBar } from '@/components/shared/proportion-bar'
import { StatCard } from '@/components/shared/stat-card'
import { RecentActivityList } from '@/features/overview/recent-activity-list'
import { useStatisticsQuery } from '@/features/overview/overview.queries'
import { StatisticsTabFrame } from '@/features/overview/statistics-tab-frame'
import { format } from '@/lib/format'
import type { StatisticsOverview } from '@/types/api'

export function GeneralOverviewTab() {
  const { t } = useTranslation()
  const query = useStatisticsQuery('overview')

  const engagementRows = (engagement: StatisticsOverview['engagement']) => [
    { key: 'views', label: t('overview:general.engagement.views'), value: engagement.views },
    { key: 'saved', label: t('overview:general.engagement.saved'), value: engagement.savedItems },
    {
      key: 'comments',
      label: t('overview:general.engagement.comments'),
      value: engagement.comments,
    },
    {
      key: 'shares',
      label: t('overview:general.engagement.shares'),
      value: engagement.shares,
      hint: t('overview:general.engagement.shares_hint'),
    },
  ]

  return (
    <StatisticsTabFrame query={query} skeletonCount={6}>
      {(data) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label={t('overview:general.new_users')}
              value={format.number(data.newUsers)}
            />
            <StatCard
              label={t('overview:general.active_sellers')}
              value={format.number(data.activeSellers)}
              hint={t('overview:general.active_sellers_hint')}
            />
            <StatCard
              label={t('overview:general.listed_products')}
              value={format.number(data.listedProducts)}
            />
            <StatCard
              label={t('overview:general.total_revenue')}
              value={format.currency(data.sales.totalRevenue)}
            />
            <StatCard
              label={t('overview:general.orders')}
              value={format.number(data.sales.totalOrders)}
            />
            <StatCard
              label={t('overview:general.platform_commission')}
              value={format.currency(data.sales.platformCommission)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('overview:general.engagement.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums text-foreground">
                    {format.percentValue(data.engagement.engagementRate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('overview:general.engagement.rate_hint')}
                  </p>
                </div>
                <div className="space-y-3">
                  {engagementRows(data.engagement).map((row) => (
                    <div key={row.key}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-foreground">{row.label}</span>
                        <span className="text-end font-mono text-sm tabular-nums text-foreground">
                          {format.number(row.value)}
                        </span>
                      </div>
                      {row.hint && (
                        <p className="text-xs text-muted-foreground">{row.hint}</p>
                      )}
                      <ProportionBar
                        className="mt-1.5"
                        value={row.value}
                        max={data.engagement.views}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <RecentActivityList items={data.recentActivity} />
            </Card>
          </div>
        </>
      )}
    </StatisticsTabFrame>
  )
}
