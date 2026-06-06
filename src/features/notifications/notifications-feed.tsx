import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Bell, Check } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import { format } from '@/lib/format'
import type { AdminNotification } from '@/types/api'
import { iconFor, tintFor, TINT_CLASS } from './notification-icon'
import { resolveDeepLink } from './notification-action'

type FeedVariant = 'popover' | 'page'
type DateBucket = 'today' | 'yesterday' | 'earlier'

interface NotificationsFeedProps {
  items: AdminNotification[]
  variant: FeedVariant
  isLoading?: boolean
  /** Page-variant only: when set, an IntersectionObserver-friendly sentinel is rendered. */
  loadMoreSentinel?: ReactNode
  emptyState?: ReactNode
  onMarkRead?: (id: string) => void
  /** Disable the mark-read action while a mutation for that id is in flight. */
  markingId?: string | null
}

export function NotificationsFeed({
  items,
  variant,
  isLoading = false,
  loadMoreSentinel,
  emptyState,
  onMarkRead,
  markingId,
}: NotificationsFeedProps) {
  const { t } = useTranslation()

  if (isLoading && items.length === 0) {
    return <FeedSkeleton variant={variant} />
  }

  if (items.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          icon={Bell}
          title={t('notifications:empty.title')}
          message={t('notifications:empty.hint')}
        />
      )
    )
  }

  if (variant === 'popover') {
    return (
      <ul className="divide-y divide-border">
        {items.map((n) => (
          <NotificationRow
            key={n.id}
            item={n}
            variant="popover"
            onMarkRead={onMarkRead}
            isMarking={markingId === n.id}
          />
        ))}
      </ul>
    )
  }

  const grouped = groupByDateBucket(items)
  return (
    <div className="flex flex-col gap-6">
      {(['today', 'yesterday', 'earlier'] as DateBucket[]).map((bucket) => {
        const rows = grouped[bucket]
        if (rows.length === 0) return null
        return (
          <section key={bucket}>
            <h2 className="mb-2 ps-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t(`notifications:groups.${bucket}`)}
            </h2>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-rest">
              {rows.map((n) => (
                <NotificationRow
                  key={n.id}
                  item={n}
                  variant="page"
                  onMarkRead={onMarkRead}
                  isMarking={markingId === n.id}
                />
              ))}
            </ul>
          </section>
        )
      })}
      {loadMoreSentinel}
    </div>
  )
}

interface RowProps {
  item: AdminNotification
  variant: FeedVariant
  onMarkRead?: (id: string) => void
  isMarking?: boolean
}

function NotificationRow({ item, variant, onMarkRead, isMarking }: RowProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const Icon = iconFor(item.type)
  const tint = tintFor(item.type)
  const link = resolveDeepLink(item.action_type, item.action_id)
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const title = lang === 'ar' ? item.title_ar : item.title_en
  const body = lang === 'ar' ? item.body_ar : item.body_en

  const compact = variant === 'popover'

  const handleOpen = () => {
    if (!link) return
    if (!item.is_read && onMarkRead) onMarkRead(item.id)
    navigate({ to: link.to, params: link.params } as never)
  }

  return (
    <li
      className={cn(
        'group/notif relative flex items-start gap-3 transition-colors duration-(--duration-hover) ease-(--ease-default)',
        compact ? 'px-4 py-3' : 'px-4 py-4 sm:px-5',
        !item.is_read && 'bg-primary/5',
        'hover:bg-muted/40',
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-md',
          compact ? 'size-8' : 'size-9',
          TINT_CLASS[tint],
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-[18px]'} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {!item.is_read && (
            <span
              aria-hidden="true"
              className={cn(
                'mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary',
              )}
            />
          )}
          <div
            className={cn(
              'min-w-0 flex-1 text-sm leading-snug font-medium text-foreground',
            )}
          >
            {title}
          </div>
          <time
            dateTime={item.created_at}
            className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
          >
            {format.relative(item.created_at)}
          </time>
        </div>

        <p
          className={cn(
            'mt-1 text-xs leading-snug text-muted-foreground',
            compact ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {body}
        </p>

        {(link || (!item.is_read && onMarkRead)) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {link && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleOpen}
                className="gap-1"
              >
                {t('notifications:actions.open')}
                <ArrowUpRight className="size-3 rtl:-scale-x-100" />
              </Button>
            )}
            {!item.is_read && onMarkRead && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={isMarking}
                onClick={() => onMarkRead(item.id)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <Check className="size-3" />
                {t('notifications:actions.mark_read')}
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

function FeedSkeleton({ variant }: { variant: FeedVariant }) {
  const rows = variant === 'popover' ? 4 : 6
  return (
    <ul
      className={cn(
        'divide-y divide-border',
        variant === 'page' && 'rounded-xl border border-border bg-card shadow-rest',
      )}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3">
          <div className="size-8 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted/70" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function groupByDateBucket(items: AdminNotification[]): Record<DateBucket, AdminNotification[]> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const groups: Record<DateBucket, AdminNotification[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  }
  for (const n of items) {
    const t = new Date(n.created_at).getTime()
    if (t >= startOfToday) groups.today.push(n)
    else if (t >= startOfYesterday) groups.yesterday.push(n)
    else groups.earlier.push(n)
  }
  return groups
}
