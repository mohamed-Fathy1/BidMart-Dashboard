import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { format } from '@/lib/format'
import { NotificationsFeed } from './notifications-feed'
import {
  useAdminNotificationsFirstPageQuery,
  useAdminUnreadCountQuery,
  useMarkNotificationReadMutation,
} from './notifications.queries'

interface NotificationsPopoverContentProps {
  onNavigate?: () => void
}

export function NotificationsPopoverContent({ onNavigate }: NotificationsPopoverContentProps) {
  const { t } = useTranslation()
  const listQuery = useAdminNotificationsFirstPageQuery(10)
  const countQuery = useAdminUnreadCountQuery()
  const markRead = useMarkNotificationReadMutation()

  const items = listQuery.data?.data ?? []
  const unread = countQuery.data ?? 0
  const loading = listQuery.isLoading

  return (
    <div className="flex flex-col">
      <Header unread={unread} />
      {!loading && items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t('notifications:empty.title')}
          message={t('notifications:empty.hint')}
          className="py-10"
        />
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          <NotificationsFeed
            items={items}
            variant="popover"
            isLoading={loading}
            onMarkRead={(id) => markRead.mutate(id)}
            markingId={markRead.isPending ? (markRead.variables ?? null) : null}
          />
        </div>
      )}
      <div className="border-t border-border p-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-center text-foreground"
        >
          <Link to="/notifications" onClick={onNavigate}>
            {t('notifications:actions.view_all')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Header({ unread }: { unread: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="text-sm font-semibold text-foreground">
        {t('notifications:popover.title')}
      </div>
      <div className="text-xs text-muted-foreground">
        {unread > 0
          ? t('notifications:popover.unread_count', { count: format.number(unread) })
          : t('notifications:popover.all_read')}
      </div>
    </div>
  )
}
