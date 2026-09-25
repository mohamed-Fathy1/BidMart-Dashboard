import { createFileRoute } from '@tanstack/react-router'
import { readEnum, readIntInRange, readString } from '@/lib/list-search'
import { parseReportSearchBase, type ReportSearchBase } from '@/lib/report-range'
import { RATINGS_TABS, type RatingsTab } from '@/features/reports/report-options'
import { RatingsReportPage } from '@/features/reports/ratings-report-page'

/**
 * Two lists with independent filters. `rating` and `categoryId` belong to the
 * reviews tab only; the sellers endpoint rejects them, so the page must drop
 * them when switching tabs.
 */
export interface RatingsReportSearch extends ReportSearchBase {
  tab: RatingsTab
  sellerName?: string
  rating?: number
  categoryId?: string
}

export const Route = createFileRoute('/_authed/reports/ratings')({
  validateSearch: (search: Record<string, unknown>): RatingsReportSearch => {
    const tab = readEnum(search.tab, RATINGS_TABS) ?? 'reviews'
    return {
      ...parseReportSearchBase(search),
      tab,
      sellerName: readString(search.sellerName),
      rating: tab === 'reviews' ? readIntInRange(search.rating, 1, 5) : undefined,
      categoryId: tab === 'reviews' ? readString(search.categoryId) : undefined,
    }
  },
  component: RatingsReportPage,
})
