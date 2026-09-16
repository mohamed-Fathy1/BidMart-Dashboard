import { useId } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import type { StatisticsPeriod } from '@/types/api'
import { isFutureIso, shiftAnchor, STATISTICS_PERIODS, todayIso } from '@/lib/report-period'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PeriodFilterValue {
  period: StatisticsPeriod
  date?: string
}

interface PeriodFilterProps {
  period: StatisticsPeriod
  date?: string
  onChange(next: PeriodFilterValue): void
  error?: string
  isFetching?: boolean
  className?: string
}

export function PeriodFilter({
  period,
  date,
  onChange,
  error,
  isFetching,
  className,
}: PeriodFilterProps) {
  const { t } = useTranslation()
  const errorId = useId()
  const anchor = date ?? todayIso()
  const nextAnchor = shiftAnchor(period, anchor, 1)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <RadioGroupPrimitive.Root
        orientation="horizontal"
        aria-label={t('components:period_filter.label')}
        value={period}
        onValueChange={(value) =>
          onChange({ period: value as StatisticsPeriod, date: date || undefined })
        }
        className="inline-flex rounded-lg border border-border bg-background p-1"
      >
        <div className="relative flex flex-wrap gap-1">
          {STATISTICS_PERIODS.map((entry) => (
            <RadioGroupPrimitive.Item
              key={entry}
              value={entry}
              className={cn(
                'group/tab relative z-10 inline-flex min-h-9 shrink-0 items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-[color,opacity] duration-(--duration-hover) ease-(--ease-default) outline-none data-[state=unchecked]:hover:text-foreground data-[state=checked]:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none absolute inset-0 rounded-md bg-transparent opacity-100 ring-1 ring-transparent transition-[background-color,box-shadow,opacity] duration-(--duration-hover) ease-(--ease-default)',
                  'group-data-[state=unchecked]/tab:hover:bg-muted-foreground/10 group-data-[state=unchecked]/tab:hover:ring-border',
                  'group-data-[state=checked]/tab:bg-card group-data-[state=checked]/tab:opacity-100 group-data-[state=checked]/tab:shadow-rest group-data-[state=checked]/tab:ring-border',
                )}
                aria-hidden
              />
              <span className="relative">{t(`components:period_filter.${entry}`)}</span>
            </RadioGroupPrimitive.Item>
          ))}
        </div>
      </RadioGroupPrimitive.Root>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={t('components:period_filter.previous')}
        onClick={() => onChange({ period, date: shiftAnchor(period, anchor, -1) })}
      >
        <ChevronLeft className="rtl:rotate-180" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={t('components:period_filter.next')}
        disabled={isFutureIso(nextAnchor)}
        onClick={() => onChange({ period, date: nextAnchor })}
      >
        <ChevronRight className="rtl:rotate-180" />
      </Button>

      <div className="flex flex-col gap-1">
        <Input
          type="date"
          max={todayIso()}
          value={date ?? ''}
          aria-label={t('components:period_filter.anchor')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange({ period, date: e.target.value || undefined })}
          className="h-8 w-[140px] text-sm"
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      {isFetching && (
        <Loader2 aria-hidden className="size-4 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
