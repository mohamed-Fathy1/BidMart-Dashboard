import { useTranslation } from 'react-i18next'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { format } from '@/lib/format'
import type { MonthlyFinancialRow } from '@/types/api'

interface MonthlyFinancialChartProps {
  rows: MonthlyFinancialRow[]
}

/** Indicator dots for the tooltip rows; ChartStyle injects `--color-<key>`. */
const SERIES_DOT: Record<string, string> = {
  grossSales: 'bg-(--color-grossSales)',
  platformRevenue: 'bg-(--color-platformRevenue)',
  net: 'bg-(--color-net)',
}

const AXIS_TICK = { fontSize: 11, fill: 'var(--color-muted-foreground)' }

/** Round tick values (0, 2.5K, 5K, ...) spanning the data and always including zero. */
function niceTicks(rows: MonthlyFinancialRow[], count = 4): number[] {
  const values = rows.flatMap((row) => [row.grossSales, row.platformRevenue, row.net])
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  if (max === min) return [0]
  const raw = (max - min) / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = ([1, 2, 2.5, 5, 10].find((f) => f * magnitude >= raw) ?? 10) * magnitude
  const ticks: number[] = []
  for (let tick = Math.floor(min / step) * step; tick <= Math.ceil(max / step) * step; tick += step) {
    ticks.push(tick)
  }
  return ticks
}

/**
 * An emphasis chart: platform revenue is the accent, drawn inside the gross
 * sales column it was earned from, which stays gray as context. Net rides on
 * top as a straight line; a smoothed curve would invent values between months.
 */
export function MonthlyFinancialChart({ rows }: MonthlyFinancialChartProps) {
  const { t } = useTranslation()
  const ticks = niceTicks(rows)

  const chartConfig = {
    grossSales: {
      label: t('overview:financial.monthly.gross_sales'),
      color: 'var(--chart-context)',
    },
    platformRevenue: {
      label: t('overview:financial.monthly.platform_revenue'),
      color: 'var(--chart-1)',
    },
    net: { label: t('overview:financial.monthly.net'), color: 'var(--chart-3)' },
    refunds: { label: t('overview:financial.monthly.refunds') },
  } satisfies ChartConfig

  return (
    <div dir="ltr" role="img" aria-label={t('overview:financial.monthly.chart_label')}>
      <ChartContainer className="aspect-auto h-[300px] w-full" config={chartConfig}>
        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={AXIS_TICK}
            tickFormatter={(month: string) => format.month(month)}
          />
          {/* Second band axis at the same positions, so revenue draws over its gross column. */}
          <XAxis xAxisId="overlay" dataKey="month" hide />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={AXIS_TICK}
            ticks={ticks}
            domain={[ticks[0] ?? 0, ticks[ticks.length - 1] ?? 0]}
            tickFormatter={(value: number) => format.compactNumber(value)}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--color-muted)', opacity: 0.6 }}
            content={
              <ChartTooltipContent
                labelFormatter={(label) => format.month(String(label), { withYear: true })}
                formatter={(value, name) => {
                  const key = String(name)
                  const isRefunds = key === 'refunds'
                  const label = chartConfig[key as keyof typeof chartConfig].label
                  return (
                    <div className="flex w-full items-center justify-between gap-4 leading-none">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          aria-hidden
                          className={cn(
                            'size-2.5 shrink-0 rounded-[2px]',
                            isRefunds ? 'bg-destructive' : SERIES_DOT[key],
                          )}
                        />
                        <span className="text-muted-foreground">{label}</span>
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {format.currency(Number(value))}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <Bar
            dataKey="grossSales"
            fill="var(--color-grossSales)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            xAxisId="overlay"
            dataKey="platformRevenue"
            fill="var(--color-platformRevenue)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <Line
            dataKey="net"
            type="linear"
            stroke="var(--color-net)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            dot={{ r: 4, fill: 'var(--color-net)', stroke: 'var(--color-card)', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: 'var(--color-net)', stroke: 'var(--color-card)', strokeWidth: 2 }}
          />
          {/* Hidden series: feeds the tooltip's refunds row, never drawn, absent from the legend. */}
          <Line
            dataKey="refunds"
            type="linear"
            stroke="transparent"
            strokeWidth={0}
            dot={false}
            activeDot={false}
            legendType="none"
          />
          <ChartLegend content={<ChartLegendContent className="pt-4" />} />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
