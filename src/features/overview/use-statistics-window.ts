import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DEFAULT_STATISTICS_PERIOD, isFutureIso, type StatisticsQuery } from '@/lib/report-period'

const overviewRoute = getRouteApi('/_authed/overview')

interface StatisticsWindow {
  /** Exactly the keys the server accepts; `date` is omitted rather than sent as undefined. */
  params: StatisticsQuery
  /** Set when the anchor is after today. The layout then renders no tab. */
  anchorError?: string
}

/**
 * The window every statistics tab shares, read from the layout route search.
 * One hook so the three tabs cannot disagree about the period, the anchor or
 * what counts as an invalid anchor.
 */
export function useStatisticsWindow(): StatisticsWindow {
  const { t } = useTranslation()
  const search = overviewRoute.useSearch()

  const date = search.date
  const params: StatisticsQuery = {
    period: search.period ?? DEFAULT_STATISTICS_PERIOD,
    ...(date ? { date } : {}),
  }
  const anchorError =
    date && isFutureIso(date) ? t('overview:errors.REPORT_DATE_IN_FUTURE') : undefined

  return { params, anchorError }
}
