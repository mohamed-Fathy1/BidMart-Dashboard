import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MetricValueProps {
  /** Pass a number with `currency` to set the code smaller than the digits. */
  value: number | string
  currency?: boolean
  className?: string
}

/**
 * A headline figure. Sans with proportional digits: tabular figures read
 * loose at this size and only earn their place where numbers stack in a column.
 */
export function MetricValue({ value, currency = false, className }: MetricValueProps) {
  const base = cn(
    'inline-flex items-baseline gap-1.5 text-[1.625rem] leading-none font-semibold tracking-[-0.02em] text-foreground',
    className,
  )

  if (!currency || typeof value !== 'number') {
    return <span className={base}>{typeof value === 'number' ? format.number(value) : value}</span>
  }

  const { symbol, amount, symbolFirst } = format.currencyParts(value)
  const code = (
    <span className="text-[0.8125rem] font-medium tracking-normal text-muted-foreground">
      {symbol}
    </span>
  )
  return (
    <span className={base}>
      {symbolFirst && code}
      <bdi>{amount}</bdi>
      {!symbolFirst && code}
    </span>
  )
}
