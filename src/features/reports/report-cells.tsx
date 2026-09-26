import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TruncatedTextCellProps {
  text: string
  /**
   * A `max-w-*` class; the cell truncates at that width and shows the full text on hover.
   * `dir="auto"` lets a Latin title in RTL truncate at its own end; `w-fit` keeps a short
   * one on the parent's side instead of aligning to its own start.
   */
  className?: string
}

export function TruncatedTextCell({ text, className }: TruncatedTextCellProps) {
  return (
    <span
      dir="auto"
      className={cn('block w-fit truncate text-sm text-foreground', className)}
      title={text}
    >
      {text}
    </span>
  )
}

interface OrderNumberCellProps {
  orderNumber: string
}

export function OrderNumberCell({ orderNumber }: OrderNumberCellProps) {
  return (
    <span className="font-mono text-xs text-foreground" title={orderNumber}>
      {orderNumber}
    </span>
  )
}

interface DateCellProps {
  iso: string
  withTime?: boolean
}

export function DateCell({ iso, withTime = false }: DateCellProps) {
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {withTime ? format.dateTime(iso) : format.date(iso)}
    </span>
  )
}
