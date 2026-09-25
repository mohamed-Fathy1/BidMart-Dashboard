import { createFileRoute } from '@tanstack/react-router'
import { readEnum } from '@/lib/list-search'
import { parseReportSearchBase, type ReportSearchBase } from '@/lib/report-range'
import { LIVESTREAM_SORT_OPTIONS } from '@/features/reports/report-options'
import { LivestreamsReportPage } from '@/features/reports/livestreams-report-page'
import type { LivestreamSortBy } from '@/types/api'

export interface LivestreamsReportSearch extends ReportSearchBase {
  /** Server-side sort; absent means `DATE` (most recent first). */
  sortBy?: LivestreamSortBy
}

export const Route = createFileRoute('/_authed/reports/livestreams')({
  validateSearch: (search: Record<string, unknown>): LivestreamsReportSearch => ({
    ...parseReportSearchBase(search),
    sortBy: readEnum(search.sortBy, LIVESTREAM_SORT_OPTIONS),
  }),
  component: LivestreamsReportPage,
})
