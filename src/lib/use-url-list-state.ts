import { useCallback, useMemo } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { DEFAULT_LIMIT } from '@/lib/list-search'

interface BaseSearch {
  q?: string
  page?: number
  limit?: number
}

/**
 * Minimal shape needed from a TanStack Router `getRouteApi(path)` result —
 * just the two hooks we consume. Accepting this lets callers pass the route
 * API directly without spelling out the search/navigate boilerplate.
 */
export interface RouteApiSurface<TSearch extends BaseSearch> {
  useSearch: () => TSearch
  useNavigate: () => (opts: { search: (prev: TSearch) => TSearch }) => unknown
}

interface UseUrlListStateOptions<TSearch extends BaseSearch> {
  /** Either pre-extracted `{ search, navigate }`, or a route API object. */
  route?: RouteApiSurface<TSearch>
  /** Explicit search value — provide if you aren't passing `route`. */
  search?: TSearch
  /** Explicit navigate — provide if you aren't passing `route`. */
  navigate?: (opts: { search: (prev: TSearch) => TSearch }) => unknown
  defaultLimit?: number
}

/**
 * Bridge between TanStack Router search params and TanStack Table pagination.
 *
 * Recommended usage — pass the route API directly:
 * ```ts
 * const adminsRoute = getRouteApi('/_authed/admins')
 * const { searchValue, pagination, setPagination, setSearch, setFilter } =
 *   useUrlListState<AdminsSearch>({ route: adminsRoute })
 * ```
 *
 * Returns the controlled `pagination` value plus setters that update the URL
 * (which in turn re-renders the page). Filter setters reset the page to 1.
 */
export function useUrlListState<TSearch extends BaseSearch>(
  opts: UseUrlListStateOptions<TSearch>,
) {
  const { defaultLimit = DEFAULT_LIMIT } = opts
  // route-API path: read both hooks at the top level so React rules-of-hooks holds.
  const routeSearch = opts.route?.useSearch()
  const routeNavigate = opts.route?.useNavigate()
  const search = (opts.route ? routeSearch : opts.search) as TSearch
  const navigate =
    opts.route && routeNavigate
      ? (o: { search: (prev: TSearch) => TSearch }) =>
          routeNavigate({ search: o.search })
      : opts.navigate
  if (!search || !navigate) {
    throw new Error('useUrlListState: pass `route` or both `search` + `navigate`')
  }
  const pageIndex = (search.page ?? 1) - 1
  const pageSize = search.limit ?? defaultLimit

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  )

  const setPagination = useCallback(
    (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      void navigate({
        search: (prev) => {
          const current: PaginationState = {
            pageIndex: (prev.page ?? 1) - 1,
            pageSize: prev.limit ?? defaultLimit,
          }
          const next =
            typeof updater === 'function' ? updater(current) : updater
          const nextPage = next.pageIndex + 1
          const nextLimit = next.pageSize
          return {
            ...prev,
            page: nextPage > 1 ? nextPage : undefined,
            limit: nextLimit !== defaultLimit ? nextLimit : undefined,
          }
        },
      })
    },
    [navigate, defaultLimit],
  )

  const setSearch = useCallback(
    (value: string) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          q: value.trim() ? value : undefined,
          page: undefined,
        }),
      })
    },
    [navigate],
  )

  /**
   * Update a single filter field and reset the page. Pass `undefined` (or an
   * empty string) to clear the filter from the URL.
   */
  const setFilter = useCallback(
    <K extends keyof TSearch>(key: K, value: TSearch[K] | undefined | '') => {
      void navigate({
        search: (prev) => ({
          ...prev,
          [key]: value === '' || value === undefined ? undefined : value,
          page: undefined,
        }),
      })
    },
    [navigate],
  )

  return {
    /** The full typed search object (incl. per-feature filters). */
    search,
    /** `?q=` from the URL (always a string for inputs). */
    searchValue: search.q ?? '',
    pagination,
    setPagination,
    setSearch,
    setFilter,
  }
}
