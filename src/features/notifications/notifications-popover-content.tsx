import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  NOTIFICATIONS,
  type NotificationItem,
  type NotificationKind,
} from './notifications.mock'

const TINT: Record<NotificationKind, string> = {
  alert: 'bg-destructive/10 text-destructive',
  pending: 'bg-amber-100 text-amber-800',
  info: 'bg-primary/10 text-primary',
}

export function NotificationsPopoverContent() {
  const { t } = useTranslation()

  if (NOTIFICATIONS.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {t('shell:topbar.notifications')}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            {t('shell:topbar.notifications_empty')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('shell:topbar.notifications_empty_hint')}
          </p>
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            {t('shell:topbar.notifications')}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {t('shell:notifications.summary', {
              unread: NOTIFICATIONS.length,
              today: 28,
            })}
          </div>
        </div>
      </div>
      <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
        {NOTIFICATIONS.map((n) => (
          <NotificationRow key={n.id} item={n} />
        ))}
      </ul>
      <div className="flex gap-2 border-t border-border px-3 py-2">
        <Button variant="outline" size="sm" className="flex-1" disabled>
          {t('shell:notifications.mark_all_read')}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" disabled>
          {t('shell:notifications.view_all')}
        </Button>
      </div>
    </div>
  )
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const { t } = useTranslation()
  const Icon = item.icon
  return (
    <li className="flex cursor-default items-start gap-3 px-4 py-3 transition-colors duration-(--duration-hover) ease-(--ease-default) hover:bg-muted/60">
      <span
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-md',
          TINT[item.kind],
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-snug text-foreground">
          {t(item.titleKey)}
        </div>
        <div className="mt-0.5 text-xs leading-snug text-muted-foreground">
          {t(item.subtitleKey)}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        {item.when}
      </span>
    </li>
  )
}
