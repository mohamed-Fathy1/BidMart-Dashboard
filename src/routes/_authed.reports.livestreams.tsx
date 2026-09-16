import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Video } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { parseListSearchBase, readEnum, readIsoDate } from '@/lib/list-search'
import { readRangeSearch } from '@/lib/report-range'
import type { LivestreamSortBy } from '@/types/api'

export const LIVESTREAM_SORT_OPTIONS: readonly LivestreamSortBy[] = ['DATE', 'SALES', 'VIEWS']

export interface LivestreamsReportSearch {
  page?: number
  limit?: number
  /** Server-side sort; absent means `DATE` (most recent first). */
  sortBy?: LivestreamSortBy
  startDate?: string
  endDate?: string
}

export const Route = createFileRoute('/_authed/reports/livestreams')({
  validateSearch: (search: Record<string, unknown>): LivestreamsReportSearch => {
    const { page, limit } = parseListSearchBase(search)
    return {
      page,
      limit,
      sortBy: readEnum(search.sortBy, LIVESTREAM_SORT_OPTIONS),
      ...readRangeSearch(readIsoDate(search.startDate), readIsoDate(search.endDate)),
    }
  },
  component: LivestreamsReportRoute,
})

function LivestreamsReportRoute() {
  const { t } = useTranslation()
  return <EmptyState icon={Video} title={t('reports:livestreams.title')} />
}
