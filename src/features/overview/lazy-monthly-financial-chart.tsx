import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { MonthlyFinancialRow } from '@/types/api'

const Chart = lazy(() =>
  import('./monthly-financial-chart').then((m) => ({ default: m.MonthlyFinancialChart })),
)

interface LazyMonthlyFinancialChartProps {
  rows: MonthlyFinancialRow[]
}

/** Keeps recharts out of the main bundle; the chart chunk loads on first render. */
export function LazyMonthlyFinancialChart({ rows }: LazyMonthlyFinancialChartProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[260px] w-full" />}>
      <Chart rows={rows} />
    </Suspense>
  )
}
