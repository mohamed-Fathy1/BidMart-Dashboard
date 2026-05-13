import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useUrlListState } from './use-url-list-state'

interface FooSearch {
  q?: string
  page?: number
  limit?: number
  status?: 'active' | 'archived'
}

function makeStub(initial: FooSearch) {
  let current = { ...initial }
  const navigate = vi.fn((opts: { search: (prev: FooSearch) => FooSearch }) => {
    current = opts.search(current)
    return undefined
  })
  return {
    get search() {
      return current
    },
    navigate,
  }
}

describe('useUrlListState', () => {
  it('derives pagination from `page` / `limit` (page is 1-indexed in URLs, 0-indexed in the table)', () => {
    const stub = makeStub({ page: 3, limit: 25 })
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 })
  })

  it('defaults to pageIndex 0 + pageSize 10 when search is empty', () => {
    const stub = makeStub({})
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 })
    expect(result.current.searchValue).toBe('')
  })

  it('setSearch writes q to the URL and resets page to undefined (back to page 1)', () => {
    const stub = makeStub({ page: 4 })
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    act(() => result.current.setSearch('hello'))
    expect(stub.navigate).toHaveBeenCalledOnce()
    expect(stub.search).toEqual({ page: undefined, q: 'hello' })
  })

  it('setSearch with empty value clears `q` (keeps the URL clean)', () => {
    const stub = makeStub({ q: 'old' })
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    act(() => result.current.setSearch('   '))
    expect(stub.search.q).toBeUndefined()
  })

  it('setFilter sets a value and resets the page', () => {
    const stub = makeStub({ page: 2 })
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    act(() => result.current.setFilter('status', 'active'))
    expect(stub.search.status).toBe('active')
    expect(stub.search.page).toBeUndefined()
  })

  it('setFilter with empty / undefined clears the filter from the URL', () => {
    const stub = makeStub({ status: 'active' })
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    act(() => result.current.setFilter('status', ''))
    expect(stub.search.status).toBeUndefined()
  })

  it('setPagination writes page > 1 and a non-default limit, but omits both when at defaults', () => {
    const stub = makeStub({})
    const { result } = renderHook(() =>
      useUrlListState<FooSearch>({ search: stub.search, navigate: stub.navigate }),
    )
    act(() => result.current.setPagination({ pageIndex: 2, pageSize: 25 }))
    expect(stub.search.page).toBe(3)
    expect(stub.search.limit).toBe(25)
    // Reset to defaults — both should disappear from the URL.
    act(() => result.current.setPagination({ pageIndex: 0, pageSize: 10 }))
    expect(stub.search.page).toBeUndefined()
    expect(stub.search.limit).toBeUndefined()
  })

  it('throws when neither route nor explicit search/navigate are passed', () => {
    expect(() =>
      renderHook(() => useUrlListState<FooSearch>({})),
    ).toThrow(/pass `route`/)
  })
})
