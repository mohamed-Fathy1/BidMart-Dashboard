import { useTranslation } from 'react-i18next'
import type { LivestreamsReportSummary } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/shared/stat-card'
import { format } from '@/lib/format'

interface LivestreamsSummaryProps {
  summary: LivestreamsReportSummary | undefined
  isLoading: boolean
}

export function LivestreamsSummary({ summary, isLoading }: LivestreamsSummaryProps) {
  const { t } = useTranslation()

  if (!summary && !isLoading) return null

  if (!summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-[92px] rounded-lg" />
        <Skeleton className="h-[92px] rounded-lg" />
        <Skeleton className="h-[92px] rounded-lg" />
        <Skeleton className="h-[92px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('reports:livestreams.summary.shows')}
        value={format.number(summary.totalShows)}
      />
      <StatCard
        label={t('reports:livestreams.summary.views')}
        value={format.number(summary.totalViews)}
      />
      <StatCard
        label={t('reports:livestreams.summary.watch_time')}
        value={format.duration(summary.totalWatchMinutes)}
        hint={t('reports:livestreams.summary.watch_time_hint')}
      />
      <Card>
        <CardHeader className="px-5 pb-3 pt-5">
          <CardTitle className="text-sm font-medium">
            {t('reports:livestreams.summary.top_show')}
          </CardTitle>
          <CardDescription>{t('reports:livestreams.summary.top_show_hint')}</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {!summary.topShow ? (
            <p className="text-sm text-muted-foreground">
              {t('reports:livestreams.summary.no_shows')}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  title={summary.topShow.title}
                >
                  {summary.topShow.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('reports:livestreams.summary.host')} {summary.topShow.hostName}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('reports:livestreams.summary.sales')}
                  </p>
                  <p className="font-mono text-sm tabular-nums font-medium">
                    {format.currency(summary.topShow.sales)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted-foreground">
                    {t('reports:livestreams.summary.views')}
                  </p>
                  <p className="font-mono text-sm tabular-nums font-medium">
                    {format.number(summary.topShow.views)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
