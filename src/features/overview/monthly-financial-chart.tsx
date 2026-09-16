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
import { i18n } from '@/lib/i18n'
import type { MonthlyFinancialRow } from '@/types/api'

interface MonthlyFinancialChartProps {
  rows: MonthlyFinancialRow[]
}

/** `YYYY-MM` → short localized month name; same locale rule as `lib/format.ts`. */
function formatMonthShort(month: string): string {
  const [year, mon] = month.split('-')
  const date = new Date(Date.UTC(Number(year), Number(mon) - 1, 1))
  const locale = i18n.language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-SA'
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
}

/** Indicator dots for the tooltip rows; ChartStyle injects `--color-<key>`. */
const SERIES_DOT: Record<string, string> = {
  grossSales: 'bg-(--color-grossSales)',
  platformRevenue: 'bg-(--color-platformRevenue)',
  net: 'bg-(--color-net)',
}

export function MonthlyFinancialChart({ rows }: MonthlyFinancialChartProps) {
  const { t } = useTranslation()

  const chartConfig = {
    grossSales: { label: t('overview:financial.monthly.gross_sales'), color: 'var(--chart-1)' },
    platformRevenue: { label: t('overview:financial.monthly.platform_revenue'), color: 'var(--chart-2)' },
    net: { label: t('overview:financial.monthly.net'), color: 'var(--chart-3)' },
    refunds: { label: t('overview:financial.monthly.refunds') },
  } satisfies ChartConfig

  return (
    <div dir="ltr" role="img" aria-label={t('overview:financial.monthly.chart_label')}>
      <ChartContainer className="h-[260px] w-full" config={chartConfig}>
        <ComposedChart data={rows}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatMonthShort}
          />
          <YAxis
            hide
            domain={[
              (dataMin: number) => Math.min(0, dataMin),
              (dataMax: number) => Math.max(0, dataMax),
            ]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => formatMonthShort(String(label))}
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
                        <span className={cn('text-muted-foreground', isRefunds && 'text-destructive')}>
                          {label}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'font-mono font-medium tabular-nums',
                          isRefunds ? 'text-destructive' : 'text-foreground',
                        )}
                      >
                        {format.currency(Number(value))}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <Bar dataKey="grossSales" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="platformRevenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          <Line dataKey="net" type="monotone" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
          {/* Hidden series: feeds the tooltip's refunds row, never drawn, absent from the legend. */}
          <Line
            dataKey="refunds"
            type="monotone"
            stroke="transparent"
            strokeWidth={0}
            dot={false}
            legendType="none"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
