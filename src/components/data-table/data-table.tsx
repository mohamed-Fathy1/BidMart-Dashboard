import { type ReactNode, type ElementType, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type RowSelectionState,
  type OnChangeFn,
  type Row,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { EllipsisVertical, Inbox } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Row action types                                                   */
/* ------------------------------------------------------------------ */

export interface RowAction<TData> {
  label: string
  icon?: ElementType
  onClick: (row: TData) => void
  variant?: 'default' | 'destructive' | 'success'
  disabled?: boolean
}

export interface RowActionSeparator {
  type: 'separator'
}

export type RowActionItem<TData> = RowAction<TData> | RowActionSeparator

function isActionSeparator<TData>(item: RowActionItem<TData>): item is RowActionSeparator {
  return 'type' in item && item.type === 'separator'
}

/* ------------------------------------------------------------------ */
/*  Row actions cell                                                   */
/* ------------------------------------------------------------------ */

export function RowActionsCell<TData>({
  row,
  actions,
  rowLabel,
}: {
  row: Row<TData>
  actions: (row: TData) => RowActionItem<TData>[]
  rowLabel?: (row: TData) => string
}) {
  const { t } = useTranslation()
  const items = actions(row.original)

  if (items.length === 0) return null

  const label = rowLabel?.(row.original)
  const ariaLabel = label
    ? t('components:data_table.row_actions_for', { name: label })
    : t('components:data_table.row_actions')

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={ariaLabel}
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item, i) =>
            isActionSeparator(item) ? (
              <DropdownMenuSeparator key={i} />
            ) : (
              <DropdownMenuItem
                key={i}
                onClick={() => item.onClick(row.original)}
                variant={
                  item.variant === 'destructive'
                    ? 'destructive'
                    : item.variant === 'success'
                      ? 'success'
                      : 'default'
                }
                disabled={item.disabled}
              >
                {item.icon && <item.icon className="size-4" />}
                {item.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DataTable                                                          */
/* ------------------------------------------------------------------ */

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  totalRecords?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageSizeOptions?: number[]
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  isLoading?: boolean
  toolbar?: ReactNode

  /** Adds a sticky checkbox column on the inline-start edge. */
  enableSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  /** Adds a sticky kebab-menu column on the inline-end edge. */
  actions?: (row: TData) => RowActionItem<TData>[]

  /** Provides a per-row label so the action-menu trigger announces context to screen readers. */
  rowLabel?: (row: TData) => string

  /** Maps each row to a stable ID (for selection across pages). */
  getRowId?: (row: TData) => string

  /** Called when a data cell (not checkbox/actions) is clicked. */
  onRowClick?: (row: TData) => void

  /**
   * When true, the empty state copy reflects "no results from current filters"
   * and (if `onClearFilters` is provided) renders a Clear filters CTA.
   * When false / omitted, the empty state reflects "no records yet".
   */
  hasActiveFilters?: boolean
  onClearFilters?: () => void

  /**
   * i18n namespace prefix for the empty-state copy. Defaults to the generic
   * `components:data_table`. Pass a feature prefix (e.g. `users:empty`) to use
   * per-surface copy that names the resource ("No users yet" vs the generic
   * "No records yet"). The prefix must expose four keys:
   * `no_data_title`, `no_data_hint`, `no_results_title`, `no_results_hint`.
   */
  emptyKeyPrefix?: string
}

const defaultPageSizeOptions = [10, 25, 50]

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  totalRecords,
  pagination,
  onPaginationChange,
  pageSizeOptions = defaultPageSizeOptions,
  sorting,
  onSortingChange,
  isLoading,
  toolbar,
  enableSelection = false,
  rowSelection,
  onRowSelectionChange,
  actions,
  rowLabel,
  getRowId,
  onRowClick,
  hasActiveFilters = false,
  onClearFilters,
  emptyKeyPrefix = 'components:data_table',
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()

  const hasSelect = enableSelection
  const hasActions = !!actions
  const hasStickyColumns = hasSelect || hasActions

  /* ---------- build column array with injected select / actions ---------- */

  const allColumns = useMemo(() => {
    const cols: ColumnDef<TData, unknown>[] = []

    if (hasSelect) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label={t('components:data_table.select_all')}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={t('components:data_table.select_row')}
            />
          </div>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      })
    }

    cols.push(...(columns as ColumnDef<TData, unknown>[]))

    if (hasActions && actions) {
      cols.push({
        id: 'actions',
        header: () => null,
        cell: ({ row }) => <RowActionsCell row={row} actions={actions} rowLabel={rowLabel} />,
        size: 48,
        enableSorting: false,
        enableHiding: false,
      })
    }

    return cols
  }, [columns, hasSelect, hasActions, actions, rowLabel, t])

  /* ---------- table instance ---------- */

  const table = useReactTable({
    data,
    columns: allColumns,
    pageCount,
    state: {
      pagination,
      sorting,
      ...(hasSelect && rowSelection !== undefined ? { rowSelection } : {}),
    },
    onPaginationChange,
    onSortingChange,
    ...(hasSelect && onRowSelectionChange
      ? { onRowSelectionChange, enableRowSelection: true }
      : {}),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    ...(getRowId ? { getRowId } : {}),
  })

  /* ---------- sticky helpers ---------- */
  /*
   * position:sticky on <td> requires border-collapse:separate (CSS spec).
   * Tailwind Preflight sets border-collapse:collapse on all tables.
   * When sticky columns are active we switch to border-separate + border-spacing-0
   * and move row borders from <tr> to each <td>/<th>.
   *
   * Sticky columns get an inner-edge border (border-e for select, border-s for
   * actions) to visually separate fixed from scrollable content.
   */

  function getHeadSticky(id: string) {
    if (hasSelect && id === 'select')
      return 'sticky start-0 z-[2] bg-card border-e border-border'
    if (hasActions && id === 'actions')
      return 'sticky end-0 z-[2] bg-card border-s border-border'
    return undefined
  }

  function getCellSticky(id: string, isSelected: boolean) {
    const isSticky =
      (id === 'select' && hasSelect) || (id === 'actions' && hasActions)
    if (!isSticky) return undefined

    const edge = id === 'select' ? 'start-0 border-e border-border' : 'end-0 border-s border-border'
    return cn(
      'sticky z-[1]',
      edge,
      isSelected ? 'bg-muted' : 'bg-card',
      'group-hover/row:bg-[#F8F8F8]',
    )
  }

  function getWidthClass(id: string) {
    if (id === 'select') return 'w-12'
    if (id === 'actions') return 'w-14'
    return undefined
  }

  /* ---------- selection count ---------- */

  const selectedCount =
    hasSelect && rowSelection ? Object.keys(rowSelection).length : 0

  /* ---------- render ---------- */

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-4">
      {toolbar && <div>{toolbar}</div>}

      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            {t('components:data_table.selected', { count: selectedCount })}
          </span>
          {hasSelect && onRowSelectionChange && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onRowSelectionChange({})}
            >
              {t('common:buttons.reset')}
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        {/*
         * border-separate border-spacing-0: required for position:sticky on <td>.
         * Visually identical to border-collapse when spacing is 0, but borders
         * must live on cells, not on <tr>.
         */}
        <Table className={cn('w-auto min-w-full', hasStickyColumns && 'border-separate border-spacing-0')}>
          <TableHeader className={cn('sticky top-0 bg-card', hasStickyColumns && '[&_tr]:border-b-0')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={hasStickyColumns ? 'border-b-0' : undefined}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  const ariaSort =
                    !canSort || header.column.id === 'select' || header.column.id === 'actions'
                      ? undefined
                      : sortDir === 'asc'
                        ? 'ascending'
                        : sortDir === 'desc'
                          ? 'descending'
                          : 'none'
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={ariaSort as React.AriaAttributes['aria-sort']}
                      className={cn(
                        'h-12',
                        getHeadSticky(header.column.id),
                        getWidthClass(header.column.id),
                        hasStickyColumns && 'border-b border-border',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={hasStickyColumns ? '[&_tr:last-child]:border-0' : undefined}>
            {isLoading ? (
              Array.from({ length: Math.min(5, pagination?.pageSize ?? 5) }).map((_, i) => (
                <TableRow key={i} className={hasStickyColumns ? 'border-b-0' : undefined}>
                  {allColumns.map((col, j) => {
                    const colId = 'id' in col ? (col.id ?? '') : ''
                    return (
                      <TableCell
                        key={j}
                        className={cn(
                          'h-[var(--table-row-height)]',
                          getWidthClass(colId),
                          hasStickyColumns && i < 4 && 'border-b border-border',
                        )}
                      >
                        {colId === 'select' || colId === 'actions' ? (
                          <Skeleton className="size-4 rounded" />
                        ) : (
                          <Skeleton
                            className="h-4"
                            style={{ width: `${50 + ((i * 7 + j * 11) % 35)}%` }}
                          />
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row, rowIndex) => {
                const isSelected = row.getIsSelected()
                const isLastRow = rowIndex === rows.length - 1
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'group/row h-[var(--table-row-height)]',
                      hasStickyColumns && 'border-b-0',
                      onRowClick &&
                        'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60',
                      isSelected && 'bg-primary/5',
                    )}
                    onClick={() => onRowClick?.(row.original)}
                    {...(onRowClick
                      ? {
                          tabIndex: 0,
                          role: 'button',
                          onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onRowClick(row.original)
                            }
                          },
                        }
                      : {})}
                    data-state={isSelected ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          getCellSticky(cell.column.id, isSelected),
                          getWidthClass(cell.column.id),
                          hasStickyColumns && !isLastRow && 'border-b border-border',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className={hasStickyColumns ? 'border-b-0' : undefined}>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-64 p-0"
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground/70">
                      <Inbox className="size-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {hasActiveFilters
                        ? t(`${emptyKeyPrefix}.no_results_title`)
                        : t(`${emptyKeyPrefix}.no_data_title`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasActiveFilters
                        ? t(`${emptyKeyPrefix}.no_results_hint`)
                        : t(`${emptyKeyPrefix}.no_data_hint`)}
                    </p>
                    {hasActiveFilters && onClearFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={onClearFilters}
                      >
                        {t('common:buttons.clear_filters')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && onPaginationChange && (pageCount ?? 0) > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {totalRecords !== undefined && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t('common:labels.showing')}{' '}
                <span className="font-mono tabular-nums font-medium text-foreground">
                  {pagination.pageIndex * pagination.pageSize + 1}
                  &ndash;
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRecords)}
                </span>
                {' '}{t('common:labels.of')}{' '}
                <span className="font-mono tabular-nums font-medium text-foreground">{totalRecords}</span>
                {' '}{t('common:labels.results')}
              </span>
            )}
            {pageSizeOptions.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {t('common:labels.rows_per_page')}
                </span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(v) =>
                    onPaginationChange({ pageIndex: 0, pageSize: Number(v) })
                  }
                >
                  <SelectTrigger size="sm" className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {pageCount && pageCount > 1 && (
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      onPaginationChange((prev) =>
                        typeof prev === 'function'
                          ? prev
                          : { ...pagination, pageIndex: Math.max(0, pagination.pageIndex - 1) },
                      )
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground">
                    {t('common:labels.page')}{' '}
                    <span className="font-mono tabular-nums">{pagination.pageIndex + 1}</span>
                    {' '}{t('common:labels.of')}{' '}
                    <span className="font-mono tabular-nums">{pageCount}</span>
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      onPaginationChange((prev) =>
                        typeof prev === 'function'
                          ? prev
                          : {
                            ...pagination,
                            pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1),
                          },
                      )
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  )
}

