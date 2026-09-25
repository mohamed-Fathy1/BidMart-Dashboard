import { useTranslation } from 'react-i18next'
import type { LivestreamsReportSummary } from '@/types/api'
import { MetricBand, MetricBandSkeleton } from '@/components/shared/metric-band'
import { MetricValue } from '@/components/shared/metric-value'
import { format } from '@/lib/format'

interface LivestreamsSummaryProps {
  summary: LivestreamsReportSummary | undefined
  isLoading: boolean
}

export function LivestreamsSummary({ summary, isLoading }: LivestreamsSummaryProps) {
  const { t } = useTranslation()

  if (!summary && !isLoading) return null
  if (!summary) return <MetricBandSkeleton count={4} columns={5} />

  const top = summary.topShow

  return (
    <MetricBand
      columns={5}
      items={[
        {
          key: 'shows',
          label: t('reports:livestreams.summary.shows'),
          value: <MetricValue value={summary.totalShows} />,
        },
        {
          key: 'views',
          label: t('reports:livestreams.summary.views'),
          value: <MetricValue value={summary.totalViews} />,
        },
        {
          key: 'watch_time',
          label: t('reports:livestreams.summary.watch_time'),
          value: <MetricValue value={format.duration(summary.totalWatchMinutes)} />,
          hint: t('reports:livestreams.summary.watch_time_hint'),
        },
        {
          key: 'top_show',
          span: 2,
          label: t('reports:livestreams.summary.top_show'),
          hint: t('reports:livestreams.summary.top_show_hint'),
          value: !top ? (
            <p className="text-sm text-muted-foreground">
              {t('reports:livestreams.summary.no_shows')}
            </p>
          ) : (
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground" title={top.title}>
                  {top.title}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {t('reports:livestreams.summary.host')} {top.hostName}
                </p>
              </div>
              <dl className="flex shrink-0 gap-5 text-end">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t('reports:livestreams.summary.sales')}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
                    {format.currency(top.sales)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t('reports:livestreams.summary.views')}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
                    {format.number(top.views)}
                  </dd>
                </div>
              </dl>
            </div>
          ),
        },
      ]}
    />
  )
}
