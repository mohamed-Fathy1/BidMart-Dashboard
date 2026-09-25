import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStatistics, type StatisticsEndpoint } from '@/features/overview/overview.api'
import { useStatisticsWindow } from '@/features/overview/use-statistics-window'

const STATISTICS_STALE_TIME = 30_000

/**
 * The visible tab's statistics for the shared window. Keys are scoped per
 * endpoint so a period change refetches only the visible tab.
 * `keepPreviousData` keeps the last tiles on screen while the next window loads.
 */
export function useStatisticsQuery<E extends StatisticsEndpoint>(endpoint: E) {
  const { params } = useStatisticsWindow()
  return useQuery({
    queryKey: ['statistics', endpoint, params],
    queryFn: () => getStatistics(endpoint, params),
    staleTime: STATISTICS_STALE_TIME,
    placeholderData: keepPreviousData,
  })
}
