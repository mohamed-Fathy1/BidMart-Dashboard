import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getBusinessActivity,
  getFinancialOverview,
  getStatisticsOverview,
  type StatisticsQuery,
} from '@/features/overview/overview.api'

/**
 * Keys are scoped per tab so a period change refetches only the visible tab.
 * `keepPreviousData` keeps the last tiles on screen while the next window loads.
 */
export const statisticsKeys = {
  all: ['statistics'] as const,
  overview: (params: StatisticsQuery) => ['statistics', 'overview', params] as const,
  businessActivity: (params: StatisticsQuery) =>
    ['statistics', 'business-activity', params] as const,
  financialOverview: (params: StatisticsQuery) =>
    ['statistics', 'financial-overview', params] as const,
}

const STATISTICS_STALE_TIME = 30_000

interface StatisticsQueryOptions {
  /** Pass `false` while the anchor is invalid so no request is sent. */
  enabled?: boolean
}

export function useStatisticsOverviewQuery(
  params: StatisticsQuery,
  options: StatisticsQueryOptions = {},
) {
  return useQuery({
    queryKey: statisticsKeys.overview(params),
    queryFn: () => getStatisticsOverview(params),
    staleTime: STATISTICS_STALE_TIME,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useBusinessActivityQuery(
  params: StatisticsQuery,
  options: StatisticsQueryOptions = {},
) {
  return useQuery({
    queryKey: statisticsKeys.businessActivity(params),
    queryFn: () => getBusinessActivity(params),
    staleTime: STATISTICS_STALE_TIME,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useFinancialOverviewQuery(
  params: StatisticsQuery,
  options: StatisticsQueryOptions = {},
) {
  return useQuery({
    queryKey: statisticsKeys.financialOverview(params),
    queryFn: () => getFinancialOverview(params),
    staleTime: STATISTICS_STALE_TIME,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}
