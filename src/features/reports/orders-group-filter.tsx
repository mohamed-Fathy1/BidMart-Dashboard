import { useRef } from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from '@/lib/format'
import { useKeepSelectedInView } from '@/lib/use-keep-selected-in-view'
import { cn } from '@/lib/utils'
import { readEnum } from '@/lib/list-search'
import { ORDER_REPORT_GROUPS } from '@/features/reports/report-options'
import type { OrdersReportSummary, OrderReportGroup } from '@/types/api'

interface OrdersGroupFilterProps {
  summary: OrdersReportSummary | undefined
  isLoading: boolean
  activeGroup?: OrderReportGroup
  onGroupChange: (group: OrderReportGroup | undefined) => void
}

const ALL = 'ALL'

const SUMMARY_KEY: Record<OrderReportGroup, keyof OrdersReportSummary> = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'inProgress',
  REFUNDED: 'refunded',
}

/**
 * Status groups as a single-choice filter over the table, each with its count
 * for the whole window. "All" carries the total, so the counts never change
 * with the choice. Average order value closes the row.
 */
export function OrdersGroupFilter({
  summary,
  isLoading,
  activeGroup,
  onGroupChange,
}: OrdersGroupFilterProps) {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)
  // Keyed on the summary too: the track only mounts once the counts arrive.
  useKeepSelectedInView(track, `${activeGroup ?? ALL}:${summary ? 'ready' : 'pending'}`)

  if (!summary && !isLoading) return null
  if (!summary) return <Skeleton className="h-11 w-full max-w-2xl rounded-lg" />

  const options = [
    { value: ALL, label: t('reports:orders.groups.all'), count: summary.totalOrders },
    ...ORDER_REPORT_GROUPS.map((group) => ({
      value: group,
      label: t(`reports:orders.groups.${group.toLowerCase()}`),
      count: summary[SUMMARY_KEY[group]],
    })),
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div ref={track} className="-mx-1 max-w-full overflow-x-auto px-1 py-0.5">
        <RadioGroupPrimitive.Root
          orientation="horizontal"
          aria-label={t('reports:orders.groups.label')}
          value={activeGroup ?? ALL}
          onValueChange={(next) => onGroupChange(readEnum(next, ORDER_REPORT_GROUPS))}
          className="inline-flex rounded-lg border border-border bg-background p-1"
        >
          <div className="flex gap-1">
            {options.map((option) => (
              <RadioGroupPrimitive.Item
                key={option.value}
                value={option.value}
                className="group/tab relative inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-[color] duration-(--duration-hover) ease-(--ease-default) data-[state=checked]:text-primary data-[state=unchecked]:hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-md ring-1 ring-transparent transition-[background-color,box-shadow] duration-(--duration-hover) ease-(--ease-default)',
                    'group-data-[state=unchecked]/tab:hover:bg-muted-foreground/10',
                    'group-data-[state=checked]/tab:bg-card group-data-[state=checked]/tab:shadow-rest group-data-[state=checked]/tab:ring-border',
                  )}
                />
                <span className="relative">{option.label}</span>
                <span
                  className={cn(
                    'relative min-w-6 rounded-full px-1.5 text-center text-xs leading-5 tabular-nums transition-[background-color,color] duration-(--duration-hover) ease-(--ease-default)',
                    'bg-muted text-muted-foreground group-data-[state=checked]/tab:bg-primary/10 group-data-[state=checked]/tab:text-primary',
                  )}
                >
                  {format.number(option.count)}
                </span>
              </RadioGroupPrimitive.Item>
            ))}
          </div>
        </RadioGroupPrimitive.Root>
      </div>

      <p className="flex items-baseline gap-2 text-sm">
        <span className="text-muted-foreground">{t('reports:orders.groups.average_order_value')}</span>
        <span className="font-semibold tabular-nums text-foreground">
          {format.currency(summary.averageOrderValue)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('reports:orders.groups.average_hint')}
        </span>
      </p>
    </div>
  )
}
