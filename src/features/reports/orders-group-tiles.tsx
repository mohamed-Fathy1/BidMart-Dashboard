import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/shared/stat-card'
import { cn } from '@/lib/utils'
import { format } from '@/lib/format'
import type { OrdersReportSummary, OrderReportGroup } from '@/types/api'

interface OrdersGroupTilesProps {
  summary: OrdersReportSummary | undefined
  activeGroup?: OrderReportGroup
  onGroupChange: (group: OrderReportGroup | undefined) => void
}

const TILES: { group: OrderReportGroup; key: keyof OrdersReportSummary; labelKey: string }[] = [
  { group: 'COMPLETED', key: 'completed', labelKey: 'completed' },
  { group: 'CANCELLED', key: 'cancelled', labelKey: 'cancelled' },
  { group: 'IN_PROGRESS', key: 'inProgress', labelKey: 'in_progress' },
  { group: 'REFUNDED', key: 'refunded', labelKey: 'refunded' },
]

export function OrdersGroupTiles({ summary, activeGroup, onGroupChange }: OrdersGroupTilesProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      {summary === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {TILES.map(({ group, key, labelKey }) => {
            const pressed = activeGroup === group
            return (
              <button
                key={group}
                type="button"
                aria-pressed={pressed}
                onClick={() => onGroupChange(pressed ? undefined : group)}
                className={cn(
                  'rounded-lg border border-border bg-card px-5 py-4 text-start shadow-rest',
                  'transition-colors duration-(--duration-hover) ease-(--ease-default)',
                  'focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
                  pressed
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'hover:bg-muted/50',
                )}
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`reports:orders.tiles.${labelKey}`)}
                </p>
                <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums">
                  {format.number(summary[key])}
                </p>
              </button>
            )
          })}

          <StatCard
            label={t('reports:orders.tiles.total_orders')}
            value={format.number(summary.totalOrders)}
          />

          <StatCard
            label={t('reports:orders.tiles.average_order_value')}
            value={format.currency(summary.averageOrderValue)}
            hint={t('reports:orders.tiles.average_hint')}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
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
