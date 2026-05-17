import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  CheckCircle2,
  Pause,
  ShieldCheck,
  XCircle,
  type LucideIcon,
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
import { cn } from '@/lib/utils'
import { RECENT_ACTIVITY, type RecentActivityItem } from './overview.mock'

const ICON_BY_ACTION: Record<RecentActivityItem['actionKey'], LucideIcon> = {
  approved_withdrawal: CheckCircle2,
  verified_provider: ShieldCheck,
  suspended_user: XCircle,
  flagged_withdrawal: AlertTriangle,
  ended_stream: Pause,
}

const TONE: Record<RecentActivityItem['tone'], string> = {
  positive: 'bg-primary/10 text-primary',
  negative: 'bg-destructive/10 text-destructive',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-muted text-muted-foreground',
}

export function RecentActivity() {
  const { t } = useTranslation()

  return (
    <Card className="gap-4">
      <CardHeader className="border-b pb-4">
        <CardTitle>{t('shell:overview.recent_activity.title')}</CardTitle>
        <CardDescription>
          {t('shell:overview.recent_activity.subtitle')}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="xs" disabled>
            {t('shell:overview.recent_activity.view_audit_log')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {RECENT_ACTIVITY.map((r) => {
            const Icon = ICON_BY_ACTION[r.actionKey]
            return (
              <li key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    'inline-flex size-7 shrink-0 items-center justify-center rounded-md',
                    TONE[r.tone],
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium text-foreground">{r.actor}</span>{' '}
                  <span className="text-muted-foreground">
                    {t(`shell:overview.recent_activity.actions.${r.actionKey}`)}
                  </span>{' '}
                  <span className="font-mono text-xs tabular-nums">{r.target}</span>
                  {r.amount && (
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {' '}
                      · {r.amount}
                    </span>
                  )}
                </p>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {r.when}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
