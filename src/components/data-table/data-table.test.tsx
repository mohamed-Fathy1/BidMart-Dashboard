import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { DataTable } from './data-table'

vi.unmock('react-i18next')
vi.unmock('@/lib/i18n')

const { i18n } = await import('@/lib/i18n')

interface Item {
  id: string
  name: string
}

const columns: ColumnDef<Item>[] = [{ accessorKey: 'name', header: 'Name' }]

function items(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({ id: `id-${i}`, name: `Item ${i}` }))
}

function renderTable({
  pagination,
  totalRecords,
  onPaginationChange = vi.fn(),
}: {
  pagination: PaginationState
  totalRecords: number
  onPaginationChange?: (value: unknown) => void
}) {
  render(
    <DataTable
      columns={columns}
      data={items(Math.min(pagination.pageSize, totalRecords))}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={Math.ceil(totalRecords / pagination.pageSize)}
      totalRecords={totalRecords}
    />,
  )
  return onPaginationChange
}

afterEach(async () => {
  cleanup()
  await i18n.changeLanguage('en')
})

describe('DataTable pagination', () => {
  it('disables previous on the first page and moves forward with next', async () => {
    await i18n.changeLanguage('en')
    const onChange = renderTable({ pagination: { pageIndex: 0, pageSize: 10 }, totalRecords: 21 })

    const previous = screen.getByRole<HTMLButtonElement>('button', { name: 'Go to previous page' })
    const next = screen.getByRole<HTMLButtonElement>('button', { name: 'Go to next page' })
    expect(previous.disabled).toBe(true)
    expect(next.disabled).toBe(false)

    await userEvent.click(next)
    expect(onChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 })
  })

  it('disables next on the last page', async () => {
    await i18n.changeLanguage('en')
    renderTable({ pagination: { pageIndex: 2, pageSize: 10 }, totalRecords: 21 })

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Go to previous page' }).disabled).toBe(false)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Go to next page' }).disabled).toBe(true)
    expect(screen.getByText(/^Page/).textContent).toBe('Page 3 of 3')
  })

  it('writes the range as one pluralized sentence in English', async () => {
    await i18n.changeLanguage('en')
    renderTable({ pagination: { pageIndex: 0, pageSize: 10 }, totalRecords: 1 })
    expect(screen.getByText(/^Showing/).textContent).toBe('Showing 1–1 of 1 result')

    cleanup()
    renderTable({ pagination: { pageIndex: 2, pageSize: 10 }, totalRecords: 21 })
    expect(screen.getByText(/^Showing/).textContent).toBe('Showing 21–21 of 21 results')
  })

  it('uses Arabic digits and the Arabic plural form', async () => {
    await i18n.changeLanguage('ar')
    renderTable({ pagination: { pageIndex: 0, pageSize: 10 }, totalRecords: 5 })
    expect(screen.getByText(/^عرض/).textContent).toBe('عرض ١–٥ من ٥ نتائج')

    cleanup()
    renderTable({ pagination: { pageIndex: 1, pageSize: 10 }, totalRecords: 25 })
    expect(screen.getByText(/^عرض/).textContent).toBe('عرض ١١–٢٠ من ٢٥ نتيجة')
    expect(screen.getByText(/^صفحة/).textContent).toBe('صفحة ٢ من ٣')
  })
})

describe('DataTable clickable rows', () => {
  function renderRows(onRowClick: (row: Item) => void) {
    render(
      <DataTable
        columns={columns}
        data={items(2)}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    )
  }

  it('keeps table row semantics and exposes the row id', () => {
    renderRows(vi.fn())
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    const row = screen.getByRole('row', { name: 'Item 0' })
    expect(row.getAttribute('data-row-id')).toBe('id-0')
    expect(row.tabIndex).toBe(0)
  })

  it('activates the focused row with Enter and Space', async () => {
    const onRowClick = vi.fn()
    renderRows(onRowClick)
    const row = screen.getByRole('row', { name: 'Item 1' })

    row.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onRowClick.mock.calls).toEqual([
      [{ id: 'id-1', name: 'Item 1' }],
      [{ id: 'id-1', name: 'Item 1' }],
    ])
  })
})
