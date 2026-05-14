import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  CircleDot,
  MessageSquare,
  Send,
  StickyNote,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComplaintActivityItem } from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ComplaintActivityTimelineProps {
  activities: ComplaintActivityItem[]
}

interface IconSpec {
  Icon: LucideIcon
  tone: string
}

const ICON_BY_ACTION: Record<string, IconSpec> = {
  started_investigation: { Icon: CircleDot, tone: 'text-blue-700 bg-blue-50 ring-blue-200/70' },
  resolved: { Icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50 ring-emerald-200/70' },
  rejected: { Icon: XCircle, tone: 'text-red-700 bg-red-50 ring-red-200/70' },
  added_note: { Icon: StickyNote, tone: 'text-amber-700 bg-amber-50 ring-amber-200/70' },
  sent_notification: { Icon: Send, tone: 'text-primary bg-primary/10 ring-primary/20' },
  closed_conversation: { Icon: MessageSquare, tone: 'text-stone-700 bg-stone-100 ring-stone-200/70' },
}

const DEFAULT_ICON: IconSpec = {
  Icon: CircleDot,
  tone: 'text-muted-foreground bg-muted ring-border',
}

export function ComplaintActivityTimeline({
  activities,
}: ComplaintActivityTimelineProps) {
  const { t } = useTranslation()

  if (activities.length === 0) {
    return (
      <Card className="gap-0 border-dashed py-0">
        <CardContent className="px-6 py-6 text-center text-sm text-muted-foreground">
          {t('complaints:activity.empty')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 rounded-xl border-border py-0">
      <CardContent className="px-6 py-4">
        <ol className="relative space-y-3 ps-7">
          <span
            aria-hidden
            className="absolute inset-y-2 inset-inline-start-[13px] w-px bg-border"
          />
          {activities.map((activity) => {
            const spec = ICON_BY_ACTION[activity.action] ?? DEFAULT_ICON
            const labelKey = `complaints:activity.action.${activity.action}`
            const fallback = activity.action.replace(/_/g, ' ')
            const actor =
              activity.actor_type === 'system'
                ? t('complaints:activity.actor_system')
                : t('complaints:activity.actor_admin')
            return (
              <li key={activity.id} className="relative">
                <span
                  className={cn(
                    'absolute inset-inline-start-[-34px] inline-flex size-7 items-center justify-center rounded-full ring-1 ring-inset',
                    spec.tone,
                  )}
                  aria-hidden
                >
                  <spec.Icon className="size-3.5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-semibold">{actor}</span>{' '}
                    <span className="text-muted-foreground">
                      {t(labelKey, { defaultValue: fallback })}
                    </span>
                  </p>
                  <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {format.dateTime(activity.created_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
