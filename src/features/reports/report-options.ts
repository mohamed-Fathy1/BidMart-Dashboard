import type { LivestreamSortBy, OrderReportGroup } from '@/types/api'

export const ORDER_REPORT_GROUPS: readonly OrderReportGroup[] = [
  'COMPLETED',
  'CANCELLED',
  'IN_PROGRESS',
  'REFUNDED',
]

export const LIVESTREAM_SORT_OPTIONS: readonly LivestreamSortBy[] = ['DATE', 'SALES', 'VIEWS']

export const RATINGS_TABS = ['reviews', 'sellers'] as const
export type RatingsTab = (typeof RATINGS_TABS)[number]

export const REPORT_DEFAULT_LIMIT = 20
export const REPORT_PAGE_SIZES = [REPORT_DEFAULT_LIMIT, 50, 100]
