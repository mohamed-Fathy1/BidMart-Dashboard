import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { MetricBandSkeleton, metricBandClass } from '@/components/shared/metric-band'
import { MetricValue } from '@/components/shared/metric-value'
import { cn } from '@/lib/utils'
import { ORDER_REPORT_GROUPS } from '@/features/reports/report-options'
import type { OrdersReportSummary, OrderReportGroup } from '@/types/api'

interface OrdersGroupTilesProps {
  summary: OrdersReportSummary | undefined
  isLoading: boolean
  activeGroup?: OrderReportGroup
  onGroupChange: (group: OrderReportGroup | undefined) => void
}

const SUMMARY_KEY: Record<OrderReportGroup, keyof OrdersReportSummary> = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'inProgress',
  REFUNDED: 'refunded',
}

const CELL = 'flex min-w-0 flex-col bg-card px-5 py-4 text-start'

/**
 * The four groups are toggles that filter the table; the last two cells are
 * plain figures. All six describe the whole window, so a toggle never changes
 * a number here.
 */
export function OrdersGroupTiles({
  summary,
  isLoading,
  activeGroup,
  onGroupChange,
}: OrdersGroupTilesProps) {
  const { t } = useTranslation()

  if (!summary && !isLoading) return null
  if (!summary) return <MetricBandSkeleton count={6} columns={6} />

  return (
    <div className="space-y-2">
      <div className={metricBandClass(6)}>
        {ORDER_REPORT_GROUPS.map((group) => {
          const pressed = activeGroup === group
          return (
            <button
              key={group}
              type="button"
              aria-pressed={pressed}
              onClick={() => onGroupChange(pressed ? undefined : group)}
              className={cn(
                CELL,
                'outline-none transition-[background-color,color] duration-(--duration-hover) ease-(--ease-default) focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50',
                pressed ? 'bg-primary/10' : 'hover:bg-muted/60',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  pressed ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {t(`reports:orders.tiles.${group.toLowerCase()}`)}
              </span>
              <MetricValue
                value={summary[SUMMARY_KEY[group]]}
                className={cn('mt-2.5', pressed && 'text-primary')}
              />
            </button>
          )
        })}

        <div className={CELL}>
          <span className="text-xs font-medium text-muted-foreground">
            {t('reports:orders.tiles.total_orders')}
          </span>
          <MetricValue value={summary.totalOrders} className="mt-2.5" />
        </div>

        <div className={CELL}>
          <span className="text-xs font-medium text-muted-foreground">
            {t('reports:orders.tiles.average_order_value')}
          </span>
          <MetricValue value={summary.averageOrderValue} currency className="mt-2.5" />
          <span className="mt-2 text-xs text-muted-foreground">
            {t('reports:orders.tiles.average_hint')}
          </span>
        </div>
      </div>

      <div className="flex min-h-8 flex-wrap items-center gap-3">
        <p className="text-xs text-muted-foreground">{t('reports:orders.tiles.filter_hint')}</p>
        {activeGroup && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onGroupChange(undefined)}>
            {t('reports:orders.tiles.clear')}
          </Button>
        )}
      </div>
    </div>
  )
}
