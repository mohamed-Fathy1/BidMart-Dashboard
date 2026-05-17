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
    <div className={cn('flex flex-wrap items-end gap-2', className)}>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted-foreground">{fromLabel}</span>
        <Input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-8 w-[148px] text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted-foreground">{toLabel}</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          min={from || undefined}
          className="h-8 w-[148px] text-sm"
        />
      </label>
    </div>
  )
}
