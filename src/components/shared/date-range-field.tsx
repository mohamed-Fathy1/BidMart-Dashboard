import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateRangeFieldProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  fromLabel: string
  toLabel: string
  className?: string
}

export function DateRangeField({
  from,
  to,
  onFromChange,
  onToChange,
  fromLabel,
  toLabel,
  className,
}: DateRangeFieldProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label={fromLabel}
        className="h-8 w-[140px] text-sm"
      />
      <span className="select-none text-xs text-muted-foreground">—</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        min={from || undefined}
        aria-label={toLabel}
        className="h-8 w-[140px] text-sm"
      />
    </div>
  )
}
