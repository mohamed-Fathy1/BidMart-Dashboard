import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProportionBar } from '@/components/shared/proportion-bar'
import { format } from '@/lib/format'
import type { RatingsReportSummary } from '@/types/api'
import { useTranslation } from 'react-i18next'

interface RatingsSummaryProps {
  summary: RatingsReportSummary
}

export function RatingsSummary({ summary }: RatingsSummaryProps) {
  const { t } = useTranslation()
  const { platformAverageRating, totalReviews, starBreakdown } = summary

  const rows = [
    { count: starBreakdown.fiveStar, stars: 5 },
    { count: starBreakdown.fourStar, stars: 4 },
    { count: starBreakdown.threeStar, stars: 3 },
    { count: starBreakdown.twoStar, stars: 2 },
    { count: starBreakdown.oneStar, stars: 1 },
  ]
  const maxCount = Math.max(...rows.map((r) => r.count), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports:ratings.summary.average')}</CardTitle>
        <CardDescription>{t('reports:ratings.summary.caption')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col justify-center">
            {platformAverageRating === null ? (
              <span className="text-lg text-muted-foreground">
                {t('reports:ratings.summary.no_ratings')}
              </span>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold font-mono tabular-nums text-foreground">
                    {format.number(Number(platformAverageRating.toFixed(1)))}
                  </span>
                  <span className="text-sm text-muted-foreground">{t('reports:ratings.summary.out_of')}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('reports:ratings.summary.total_reviews')}</span>
                  <span className="font-mono tabular-nums text-foreground">{format.number(totalReviews)}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">{t('reports:ratings.summary.breakdown')}</p>
            <div className="space-y-2">
              {rows.map(({ count, stars }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-sm text-foreground">
                    {t('reports:ratings.filters.stars', { count: stars })}
                  </span>
                  <ProportionBar value={count} max={maxCount} className="flex-1" />
                  <span className="w-12 shrink-0 text-end font-mono text-sm tabular-nums text-foreground">
                    {format.number(count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
