import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { MetricValue } from '@/components/shared/metric-value'
import { ProportionBar } from '@/components/shared/proportion-bar'
import { format } from '@/lib/format'
import { numberLocale } from '@/lib/locale'
import type { RatingsReportSummary } from '@/types/api'

interface RatingsSummaryProps {
  summary: RatingsReportSummary
}

export function RatingsSummary({ summary }: RatingsSummaryProps) {
  const { t, i18n } = useTranslation()
  const { platformAverageRating, totalReviews, starBreakdown } = summary

  const rows = [
    { count: starBreakdown.fiveStar, stars: 5 },
    { count: starBreakdown.fourStar, stars: 4 },
    { count: starBreakdown.threeStar, stars: 3 },
    { count: starBreakdown.twoStar, stars: 2 },
    { count: starBreakdown.oneStar, stars: 1 },
  ]

  // One decimal always, so 4.0 does not collapse to 4.
  const average =
    platformAverageRating == null
      ? null
      : new Intl.NumberFormat(numberLocale(i18n.language), {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(platformAverageRating)

  return (
    <Card className="py-5">
      <CardContent className="grid gap-x-10 gap-y-6 px-6 md:grid-cols-[13rem_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {t('reports:ratings.summary.average')}
          </p>
          {average == null ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('reports:ratings.summary.no_ratings')}
            </p>
          ) : (
            <>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <MetricValue value={average} className="text-[2rem]" />
                <span className="text-sm text-muted-foreground">
                  {t('reports:ratings.summary.out_of')}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t('reports:ratings.summary.caption')}
              </p>
            </>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {t('reports:ratings.summary.total_reviews')}{' '}
            <span className="font-medium tabular-nums text-foreground">
              {format.number(totalReviews)}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {t('reports:ratings.summary.breakdown')}
          </p>
          <ul className="mt-3 max-w-3xl space-y-2.5">
            {rows.map(({ count, stars }) => (
              <li key={stars} className="flex items-center gap-3 text-sm">
                <span className="flex w-10 shrink-0 items-center gap-1 tabular-nums text-foreground">
                  {format.number(stars)}
                  <Star aria-hidden className="size-3.5 fill-current text-amber-500" />
                  <span className="sr-only">{t('reports:ratings.filters.stars', { count: stars })}</span>
                </span>
                <ProportionBar value={count} max={totalReviews} className="flex-1" />
                <span className="w-12 shrink-0 text-end tabular-nums text-foreground">
                  {format.number(count)}
                </span>
                <span className="w-14 shrink-0 text-end text-xs tabular-nums text-muted-foreground">
                  {format.percent(totalReviews > 0 ? count / totalReviews : 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
