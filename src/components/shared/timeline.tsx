import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

export type TimelineTone =
  | 'positive'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'neutral'

export interface TimelineItem {
  id: string
  icon: LucideIcon
  tone: TimelineTone
  title: ReactNode
  subtitle?: ReactNode
  at: string
}

interface TimelineProps {
  items: TimelineItem[]
  emptyLabel: string
  className?: string
}

const TONE_CLASSES: Record<TimelineTone, string> = {
  positive: 'text-emerald-700 bg-emerald-50 ring-emerald-200/70',
  warning: 'text-amber-700 bg-amber-50 ring-amber-200/70',
  danger: 'text-red-700 bg-red-50 ring-red-200/70',
  info: 'text-blue-700 bg-blue-50 ring-blue-200/70',
  accent: 'text-primary bg-primary/10 ring-primary/20',
  neutral: 'text-muted-foreground bg-muted ring-border',
}

export function Timeline({ items, emptyLabel, className }: TimelineProps) {
  if (items.length === 0) {
    return (
      <p className={cn('py-6 text-center text-sm text-muted-foreground', className)}>
        {emptyLabel}
      </p>
    )
  }

  return (
    <ol className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <li key={item.id} className="flex gap-3">
            <div className="flex shrink-0 flex-col items-center">
              <span
                className={cn(
                  'inline-flex size-7 items-center justify-center rounded-full ring-1 ring-inset',
                  TONE_CLASSES[item.tone],
                )}
                aria-hidden
              >
                <item.icon className="size-3.5" />
              </span>
              {!isLast && <span aria-hidden className="my-1.5 w-px flex-1 bg-border" />}
            </div>
            <div className={cn('flex min-w-0 flex-col gap-0.5 pt-0.5', !isLast && 'pb-4')}>
              <p className="text-sm leading-snug text-foreground">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {format.dateTime(item.at)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
