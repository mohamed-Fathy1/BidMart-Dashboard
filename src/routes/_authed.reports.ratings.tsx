import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import {
  parseListSearchBase,
  readEnum,
  readIntInRange,
  readIsoDate,
  readString,
} from '@/lib/list-search'
import { readRangeSearch } from '@/lib/report-range'

export const RATINGS_TABS = ['reviews', 'sellers'] as const
export type RatingsTab = (typeof RATINGS_TABS)[number]

/**
 * Two lists with independent filters. `rating` and `categoryId` belong to the
 * reviews tab only; the sellers endpoint rejects them, so the page must drop
 * them when switching tabs.
 */
export interface RatingsReportSearch {
  tab: RatingsTab
  page?: number
  limit?: number
  sellerName?: string
  rating?: number
  categoryId?: string
  startDate?: string
  endDate?: string
}

export const Route = createFileRoute('/_authed/reports/ratings')({
  validateSearch: (search: Record<string, unknown>): RatingsReportSearch => {
    const { page, limit } = parseListSearchBase(search)
    const tab = readEnum(search.tab, RATINGS_TABS) ?? 'reviews'
    return {
      tab,
      page,
      limit,
      sellerName: readString(search.sellerName),
      rating: tab === 'reviews' ? readIntInRange(search.rating, 1, 5) : undefined,
      categoryId: tab === 'reviews' ? readString(search.categoryId) : undefined,
      ...readRangeSearch(readIsoDate(search.startDate), readIsoDate(search.endDate)),
    }
  },
  component: RatingsReportRoute,
})

function RatingsReportRoute() {
  const { t } = useTranslation()
  return <EmptyState icon={Star} title={t('reports:ratings.title')} />
}
