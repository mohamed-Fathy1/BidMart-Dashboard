import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ProportionBar } from '@/components/shared/proportion-bar'
import { cn } from '@/lib/utils'

interface RankedListProps<T> {
  items: T[]
  getKey: (item: T) => string
  metric: (item: T) => number
  primary: (item: T) => ReactNode
  secondary?: (item: T) => ReactNode
  leading?: (item: T) => ReactNode
  value: (item: T) => ReactNode
  count?: (item: T) => ReactNode
  onSelect?: (item: T) => void
  emptyLabel: string
  ariaLabel?: string
  className?: string
}

export function RankedList<T>({
  items,
  getKey,
  metric,
  primary,
  secondary,
  leading,
  value,
  count,
  onSelect,
  emptyLabel,
  ariaLabel,
  className,
}: RankedListProps<T>) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <p className={cn('py-6 text-center text-sm text-muted-foreground', className)}>
        {emptyLabel}
      </p>
    )
  }

  const metrics = items.map(metric)
  const maxMetric = Math.max(...metrics, 0)

  return (
    <ol className={cn('space-y-1', className)} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const rank = index + 1
        const body = (
          <>
            <span
              aria-label={t('components:ranked_list.rank', { rank })}
              className="w-5 shrink-0 text-end font-mono tabular-nums text-sm text-muted-foreground"
            >
              {rank}
            </span>
            {leading && (
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                {leading(item)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{primary(item)}</p>
              {secondary && (
                <p className="truncate text-xs text-muted-foreground">{secondary(item)}</p>
              )}
              <ProportionBar className="mt-1.5" value={metrics[index] ?? 0} max={maxMetric} />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 text-end">
              <span className="font-mono tabular-nums text-sm text-foreground">
                {value(item)}
              </span>
              {count && (
                <span className="text-xs text-muted-foreground">{count(item)}</span>
              )}
            </div>
          </>
        )

        return (
          <li key={getKey(item)}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-start transition-[background-color] duration-(--duration-hover) ease-(--ease-default) hover:bg-muted/50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {body}
              </button>
            ) : (
              <div className="flex w-full items-center gap-3 px-2 py-2">{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
