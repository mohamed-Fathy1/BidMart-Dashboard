import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { Sparkline } from '@/components/shared/sparkline'
import { cn } from '@/lib/utils'
import { ActionQueue } from './action-queue'
import { GmvTrendChart } from './gmv-trend-chart'
import { RecentActivity } from './recent-activity'
import { TopProviders } from './top-providers'
import {
  CATEGORY_BREAKDOWN,
  GMV_SERIES,
  KPIS,
  type OverviewKpi,
} from './overview.mock'

const RANGES = ['7d', '30d', '90d', '1y'] as const
type Range = (typeof RANGES)[number]

export function OverviewPage() {
  const { t } = useTranslation()
  const [range, setRange] = useState<Range>('30d')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('shell:overview.title')}
        description={t('shell:overview.last_refreshed')}
        actions={
          <>
            <Button variant="outline" size="sm" disabled>
              <Clock className="size-3.5" />
              {t('shell:overview.actions.last_30_days')}
              <ChevronDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Download className="size-3.5" />
              {t('shell:overview.actions.export')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('shell:overview.chart.title')}</CardTitle>
            <CardDescription>
              {t('shell:overview.chart.subtitle')}
            </CardDescription>
            <CardAction>
              <div className="inline-flex gap-1 rounded-md bg-muted p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      'h-6 rounded px-3 text-xs font-medium transition-colors duration-(--duration-hover) ease-(--ease-default)',
                      range === r
                        ? 'bg-card text-foreground shadow-rest'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t(`shell:overview.chart.range.${r}`)}
                  </button>
                ))}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <GmvTrendChart data={GMV_SERIES} />
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
              {CATEGORY_BREAKDOWN.map((c) => (
                <div key={c.key}>
                  <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {t(`shell:overview.chart.breakdown.${c.key}`)}
                  </div>
                  <div className="mt-1 font-mono text-base font-semibold tabular-nums">
                    {c.value}
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${c.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ActionQueue />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivity />
        <TopProviders />
      </div>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: OverviewKpi }) {
  const { t } = useTranslation()
  const Arrow = kpi.positive ? ArrowUp : ArrowDown
  return (
    <Card className="gap-4 py-4">
      <CardContent className="space-y-2.5">
        <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {t(`shell:overview.kpi.${kpi.id}`)}
        </div>
        <div className="flex items-end justify-between gap-3">
          <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums leading-none text-foreground">
            {kpi.value}
          </span>
          <Sparkline
            data={kpi.spark}
            color={kpi.positive ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
            fill
            width={70}
            height={28}
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5',
              kpi.positive ? 'text-primary' : 'text-destructive',
            )}
          >
            <Arrow className="size-3" />
            <span className="font-mono tabular-nums">{kpi.delta}</span>
          </span>
          <span className="text-muted-foreground">
            · {t(`shell:overview.kpi.detail.${kpi.detail}`)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
