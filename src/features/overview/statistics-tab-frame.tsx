import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatisticsWindowLabel } from '@/features/overview/statistics-window-label'
import { extractApiErrorCode } from '@/lib/axios'
import { cn } from '@/lib/utils'
import type { ReportDateRange } from '@/types/api'

interface StatisticsTabFrameProps<T> {
  query: UseQueryResult<T>
  skeletonCount: number
  children: (data: T) => ReactNode
}

/**
 * What every statistics tab shares: the resolved window, tile skeletons on
 * the first load, a retryable error, and a dimmed body while the next window
 * loads over the previous one.
 */
export function StatisticsTabFrame<T extends { dateRange: ReportDateRange }>({
  query,
  skeletonCount,
  children,
}: StatisticsTabFrameProps<T>) {
  const refreshing = query.isFetching && !query.isPending

  return (
    <div
      className={cn(
        'space-y-6 transition-opacity duration-(--duration-hover) ease-(--ease-default)',
        refreshing && 'opacity-60',
      )}
      aria-busy={refreshing}
    >
      <StatisticsWindowLabel range={query.data?.dateRange} isPending={query.isPending} />

      {query.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Skeleton key={index} className="h-[92px] rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <StatisticsErrorCard error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        children(query.data)
      )}
    </div>
  )
}

function StatisticsErrorCard({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useTranslation()
  const message =
    extractApiErrorCode(error) === 'REPORT_DATE_IN_FUTURE'
      ? t('overview:errors.REPORT_DATE_IN_FUTURE')
      : t('overview:errors.load_failed')

  return (
    <Card className="py-4">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          {message}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('overview:errors.retry')}
        </Button>
      </CardContent>
    </Card>
  )
}
