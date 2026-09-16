import { ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateRangeFieldProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  fromLabel: string
  toLabel: string
  max?: string
  invalid?: boolean
  describedBy?: string
  className?: string
}

export function DateRangeField({
  from,
  to,
  onFromChange,
  onToChange,
  fromLabel,
  toLabel,
  max,
  invalid,
  describedBy,
  className,
}: DateRangeFieldProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        max={max}
        aria-label={fromLabel}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className="h-8 w-[140px] text-sm"
      />
      <ArrowRight aria-hidden className="size-3.5 text-muted-foreground rtl:rotate-180" />
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        min={from || undefined}
        max={max}
        aria-label={toLabel}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className="h-8 w-[140px] text-sm"
      />
    </div>
  )
}
