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
import { Timeline, type TimelineItem, type TimelineTone } from '@/components/shared/timeline'

interface ComplaintActivityTimelineProps {
  activities: ComplaintActivityItem[]
}

interface IconSpec {
  icon: LucideIcon
  tone: TimelineTone
}

const ICON_BY_ACTION: Record<string, IconSpec> = {
  started_investigation: { icon: CircleDot, tone: 'info' },
  resolved: { icon: CheckCircle2, tone: 'positive' },
  rejected: { icon: XCircle, tone: 'danger' },
  added_note: { icon: StickyNote, tone: 'warning' },
  sent_notification: { icon: Send, tone: 'accent' },
  closed_conversation: { icon: MessageSquare, tone: 'neutral' },
}

const DEFAULT_ICON: IconSpec = {
  icon: CircleDot,
  tone: 'neutral',
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

  const items: TimelineItem[] = activities.map((activity) => {
    const spec = ICON_BY_ACTION[activity.action] ?? DEFAULT_ICON
    const labelKey = `complaints:activity.action.${activity.action}`
    const fallback = activity.action.replace(/_/g, ' ')
    const actor =
      activity.actor_type === 'system'
        ? t('complaints:activity.actor_system')
        : t('complaints:activity.actor_admin')
    return {
      id: activity.id,
      icon: spec.icon,
      tone: spec.tone,
      title: (
        <>
          <span className="font-semibold">{actor}</span>{' '}
          <span className="text-muted-foreground">
            {t(labelKey, { defaultValue: fallback })}
          </span>
        </>
      ),
      at: activity.created_at,
    }
  })

  return (
    <Card className="gap-0 rounded-xl border-border py-0">
      <CardContent className="px-6 py-4">
        <Timeline items={items} emptyLabel={t('complaints:activity.empty')} />
      </CardContent>
    </Card>
  )
}
