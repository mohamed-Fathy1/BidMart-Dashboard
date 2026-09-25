import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface MetricBandItem {
  key: string
  label: string
  value: ReactNode
  hint?: ReactNode
  /** Two columns wide: a full row below `lg`, two of the grid's columns from `lg` up. */
  span?: 2
}

interface MetricBandProps {
  items: MetricBandItem[]
  /** Column count from `lg` up; two columns below. */
  columns: 3 | 4 | 5 | 6
  className?: string
}

const COLUMNS: Record<MetricBandProps['columns'], string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-3 xl:grid-cols-6',
}

/**
 * Related figures on one surface, split by hairlines instead of a card each.
 * The 1px gap over a border-coloured backdrop draws the rules, so they stay
 * correct however the grid wraps.
 */
function metricBandClass(columns: MetricBandProps['columns']) {
  return cn(
    'grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-rest',
    COLUMNS[columns],
  )
}

export function MetricBand({ items, columns, className }: MetricBandProps) {
  const widenOnPhone = orphanCells(items)
  return (
    <dl
      className={cn(metricBandClass(columns), className)}
    >
      {items.map((item, index) => (
        <div
          key={item.key}
          className={cn(
            'flex min-w-0 flex-col bg-card px-5 py-4',
            item.span === 2 && 'col-span-2',
            widenOnPhone.has(index) && 'col-span-2 lg:col-span-1',
          )}
        >
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-2.5 min-w-0">{item.value}</dd>
          {item.hint != null && (
            <dd className="mt-2 text-xs text-muted-foreground">{item.hint}</dd>
          )}
        </div>
      ))}
    </dl>
  )
}

/**
 * Cells left alone on a row of the two-column phone layout: one followed by a
 * two-wide cell, or an odd last one. Widening them closes the hole the 1px
 * gap backdrop would otherwise show.
 */
function orphanCells(items: MetricBandItem[]): Set<number> {
  const orphans = new Set<number>()
  let column = 0
  items.forEach((item, index) => {
    if (item.span === 2) {
      if (column === 1) orphans.add(index - 1)
      column = 0
      return
    }
    column = (column + 1) % 2
  })
  if (column === 1) orphans.add(items.length - 1)
  return orphans
}

interface MetricBandSkeletonProps {
  count: number
  columns: MetricBandProps['columns']
  className?: string
}

export function MetricBandSkeleton({ count, columns, className }: MetricBandSkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border',
        COLUMNS[columns],
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 bg-card px-5 py-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-28" />
        </div>
      ))}
    </div>
  )
}
