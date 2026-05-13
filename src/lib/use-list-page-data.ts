import { useMemo } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import type { Paginated, PaginationMeta } from '@/types/api'

interface UseListPageDataArgs<TRow> {
  /** Result of a `useXxxQuery({ ... })` call. */
  response: Paginated<TRow> | undefined
  isLoading: boolean
  pagination: PaginationState
  setPagination: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void
  /** Whether the user has any filter (search or facet) currently active. */
  hasActiveFilters?: boolean
  /** Called when the operator clicks "Clear filters" inside the empty state. */
  clearFilters?: () => void
}

interface ListPageDataResult<TRow> {
  rows: TRow[]
  meta: PaginationMeta | undefined
  /** Spread into `<DataTable {...tableProps}>` to wire pagination + loading + empty-state copy. */
  tableProps: {
    pageCount: number | undefined
    totalRecords: number | undefined
    pagination: PaginationState
    onPaginationChange: UseListPageDataArgs<TRow>['setPagination']
    isLoading: boolean
    hasActiveFilters: boolean
    onClearFilters?: () => void
  }
}

/**
 * Bundles the mechanical wiring every list page repeats: unwrapping `data` /
 * `meta`, threading pagination + loading state into `DataTable`, and exposing
 * `hasActiveFilters` + `clearFilters` for the empty-state CTA.
 *
 * Usage:
 * ```tsx
 * const { data: response, isLoading } = useUsersQuery({ … })
 * const { rows, meta, tableProps } = useListPageData({
 *   response, isLoading, pagination, setPagination,
 *   hasActiveFilters: searchValue !== '' || statusFilter !== '',
 *   clearFilters: () => { setSearch(''); setFilter('status', undefined) },
 * })
 * // …
 * <DataTable columns={columns} data={rows} {...tableProps} />
 * ```
 */
export function useListPageData<TRow>({
  response,
  isLoading,
  pagination,
  setPagination,
  hasActiveFilters = false,
  clearFilters,
}: UseListPageDataArgs<TRow>): ListPageDataResult<TRow> {
  const rows = response?.data ?? []
  const meta = response?.meta
  const tableProps = useMemo(
    () => ({
      pageCount: meta?.totalPages,
      totalRecords: meta?.total,
      pagination,
      onPaginationChange: setPagination,
      isLoading,
      hasActiveFilters,
      onClearFilters: clearFilters,
    }),
    [meta?.totalPages, meta?.total, pagination, setPagination, isLoading, hasActiveFilters, clearFilters],
  )
  return { rows, meta, tableProps }
}
