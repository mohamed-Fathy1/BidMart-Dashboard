import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { StatisticsQuery } from '@/features/overview/overview.api'
import { DEFAULT_STATISTICS_PERIOD, isFutureIso } from '@/lib/report-period'
import type { StatisticsPeriod } from '@/types/api'

const overviewRoute = getRouteApi('/_authed/overview')

export interface StatisticsWindow {
  period: StatisticsPeriod
  date?: string
  /** Exactly the keys the server accepts; `date` is omitted rather than sent as undefined. */
  params: StatisticsQuery
  /** Set when the anchor is after today. Tabs pass `enabled: !anchorError`. */
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

  const period = search.period ?? DEFAULT_STATISTICS_PERIOD
  const date = search.date
  const params: StatisticsQuery = { period, ...(date ? { date } : {}) }
  const anchorError =
    date && isFutureIso(date) ? t('overview:errors.REPORT_DATE_IN_FUTURE') : undefined

  return { period, date, params, anchorError }
}
