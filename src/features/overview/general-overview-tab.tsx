import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricBand } from '@/components/shared/metric-band'
import { MetricValue } from '@/components/shared/metric-value'
import { ProportionBar } from '@/components/shared/proportion-bar'
import { RecentActivityList } from '@/features/overview/recent-activity-list'
import { useStatisticsQuery } from '@/features/overview/overview.queries'
import { StatisticsTabFrame } from '@/features/overview/statistics-tab-frame'
import { format } from '@/lib/format'
import type { StatisticsOverview } from '@/types/api'

export function GeneralOverviewTab() {
  const { t } = useTranslation()
  const query = useStatisticsQuery('overview')

  return (
    <StatisticsTabFrame query={query} skeletonCount={6}>
      {(data) => (
        <>
          <MetricBand
            columns={3}
            items={[
              {
                key: 'new_users',
                label: t('overview:general.new_users'),
                value: <MetricValue value={data.newUsers} />,
              },
              {
                key: 'active_sellers',
                label: t('overview:general.active_sellers'),
                value: <MetricValue value={data.activeSellers} />,
                hint: t('overview:general.active_sellers_hint'),
              },
              {
                key: 'listed_products',
                label: t('overview:general.listed_products'),
                value: <MetricValue value={data.listedProducts} />,
              },
              {
                key: 'total_revenue',
                label: t('overview:general.total_revenue'),
                value: <MetricValue value={data.sales.totalRevenue} currency />,
              },
              {
                key: 'orders',
                label: t('overview:general.orders'),
                value: <MetricValue value={data.sales.totalOrders} />,
              },
              {
                key: 'platform_commission',
                label: t('overview:general.platform_commission'),
                value: <MetricValue value={data.sales.platformCommission} currency />,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <EngagementCard engagement={data.engagement} />
            <Card className="lg:col-span-2">
              <RecentActivityList items={data.recentActivity} />
            </Card>
          </div>
        </>
      )}
    </StatisticsTabFrame>
  )
}

interface EngagementCardProps {
  engagement: StatisticsOverview['engagement']
}

/**
 * The rate is the headline; views are its denominator, so they read as a
 * sentence rather than a bar that is always full. The three interaction kinds
 * split the numerator.
 */
function EngagementCard({ engagement }: EngagementCardProps) {
  const { t } = useTranslation()
  const interactions = engagement.savedItems + engagement.comments + engagement.shares
  const rows = [
    { key: 'saved', label: t('overview:general.engagement.saved'), value: engagement.savedItems },
    { key: 'comments', label: t('overview:general.engagement.comments'), value: engagement.comments },
    {
      key: 'shares',
      label: t('overview:general.engagement.shares'),
      value: engagement.shares,
      hint: t('overview:general.engagement.shares_hint'),
    },
  ]

  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle>{t('overview:general.engagement.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <MetricValue value={format.percentValue(engagement.engagementRate)} className="text-[2rem]" />
          <p className="text-xs text-muted-foreground">
            {t('overview:general.engagement.rate_hint')}
          </p>
          <p className="text-sm text-foreground">
            {t('overview:general.engagement.interactions_on_views', {
              interactions,
              views: engagement.views,
            })}
          </p>
        </div>

        <ul className="space-y-3.5">
          {rows.map((row) => (
            <li key={row.key} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground">
                  {row.label}
                  {row.hint && (
                    <span className="ms-1.5 text-xs text-muted-foreground">{row.hint}</span>
                  )}
                </span>
                <span className="tabular-nums text-foreground">
                  {format.number(row.value)}
                  <span className="ms-2 inline-block min-w-[3.25rem] text-end text-xs text-muted-foreground">
                    {format.percent(interactions > 0 ? row.value / interactions : 0)}
                  </span>
                </span>
              </div>
              <ProportionBar value={row.value} max={interactions} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
