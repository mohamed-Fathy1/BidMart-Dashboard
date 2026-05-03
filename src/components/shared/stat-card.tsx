import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  delta?: {
    value: number
    positive: boolean
  }
  className?: string
}

export function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <Card data-slot="stat-card" className={cn('py-4', className)}>
      <CardContent className="px-5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight font-mono tabular-nums text-foreground">
            {value}
          </span>
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                delta.positive ? 'text-emerald-600' : 'text-destructive',
              )}
            >
              {delta.positive ? (
                <TrendingUpIcon className="size-3.5" />
              ) : (
                <TrendingDownIcon className="size-3.5" />
              )}
              {format.percent(Math.abs(delta.value) / 100)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
