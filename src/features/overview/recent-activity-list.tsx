import { Link } from '@tanstack/react-router'
import { Radio, ShoppingBag, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from '@/lib/format'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import type { RecentActivityItem, RecentActivityType } from '@/types/api'

interface RecentActivityListProps {
  items: RecentActivityItem[]
}

const TYPE_ICONS: Record<RecentActivityType, LucideIcon> = {
  ORDER: ShoppingBag,
  LIVE_SHOW: Radio,
  NEW_USER: UserPlus,
}

const ROW_CLASSES =
  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-start transition-[background-color] duration-(--duration-hover) ease-(--ease-default)'
const INTERACTIVE_CLASSES =
  'hover:bg-muted/50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

/**
 * The newest events in the window. Order rows open the drill-down sheet on the
 * financial report; new-user rows go to the buyer when the admin may view
 * users. Live shows have no admin surface yet, so they stay inert.
 */
export function RecentActivityList({ items }: RecentActivityListProps) {
  const { t } = useTranslation()
  const canOpenUser = usePermission(PERMISSIONS.users.view)

  return (
    <>
      <CardHeader>
        <CardTitle>{t('overview:general.recent_activity.title')}</CardTitle>
        <CardDescription>{t('overview:general.recent_activity.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('overview:general.recent_activity.empty')}
          </p>
        ) : (
          <ul className="space-y-1">
            {items.slice(0, 10).map((item) => {
              const Icon = TYPE_ICONS[item.type]
              const body = (
                <>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon aria-hidden className="size-4" />
                    <span className="sr-only">
                      {t(`overview:general.recent_activity.type.${item.type}`)}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    {item.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-end">
                    {item.type === 'ORDER' && item.amount !== null && (
                      <span className="font-mono text-sm tabular-nums text-foreground">
                        {format.currency(item.amount)}
                      </span>
                    )}
                    <time
                      dateTime={item.occurredAt}
                      title={format.dateTime(item.occurredAt)}
                      className="text-xs text-muted-foreground"
                    >
                      {format.relative(item.occurredAt)}
                    </time>
                  </div>
                </>
              )

              return (
                <li key={`${item.type}-${item.id}`}>
                  {item.type === 'ORDER' ? (
                    <Link
                      to="/reports/financial"
                      search={{ order: item.id }}
                      className={cn(ROW_CLASSES, INTERACTIVE_CLASSES)}
                    >
                      {body}
                    </Link>
                  ) : item.type === 'NEW_USER' && canOpenUser ? (
                    <Link
                      to="/users/$userId"
                      params={{ userId: item.id }}
                      className={cn(ROW_CLASSES, INTERACTIVE_CLASSES)}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className={ROW_CLASSES}>{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </>
  )
}
