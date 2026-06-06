import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Megaphone, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import { format } from '@/lib/format'
import type { AdminNotification, NotificationType } from '@/types/api'
import { NotificationsFeed } from './notifications-feed'
import {
  useAdminNotificationsInfiniteQuery,
  useAdminUnreadCountQuery,
  useMarkNotificationReadMutation,
  useTestBroadcastMutation,
} from './notifications.queries'

const TYPE_VALUES: readonly NotificationType[] = [
  'NEW_SELLER_APPLICATION',
  'VERIFICATION_REQUESTED',
  'SETTLEMENT_REQUESTED',
  'CONTACT_MESSAGE_RECEIVED',
  'NEW_COMPLAINT',
  'COMPLAINT_MESSAGE',
  'ACCOUNT_DELETION_REQUESTED',
  'GENERAL',
]

const UNREAD_ONLY_ID = 'notifications-unread-only'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [broadcastOpen, setBroadcastOpen] = useState(false)

  const list = useAdminNotificationsInfiniteQuery({
    type: (type || undefined) as NotificationType | undefined,
  })
  const unreadQuery = useAdminUnreadCountQuery()
  const markRead = useMarkNotificationReadMutation()
  const broadcast = useTestBroadcastMutation()

  const allRows = useMemo<AdminNotification[]>(
    () => list.data?.pages.flatMap((p) => p.data) ?? [],
    [list.data],
  )

  const filtered = useMemo(
    () => filterClientSide(allRows, { search, unreadOnly, lang: i18n.language }),
    [allRows, search, unreadOnly, i18n.language],
  )

  const totalUnread = unreadQuery.data ?? 0
  const hasActiveFilters = !!search || !!type || unreadOnly

  const typeOptions = TYPE_VALUES.map((value) => ({
    value,
    label: t(`notifications:filters.type.${value}`),
  }))

  /* Infinite scroll: callback ref + stable observer reading latest query state
   * from a ref so the observer is created once per sentinel mount, not on
   * every render. */
  const stateRef = useRef({
    hasNextPage: list.hasNextPage,
    isFetching: list.isFetchingNextPage,
    fetchNextPage: list.fetchNextPage,
  })
  stateRef.current = {
    hasNextPage: list.hasNextPage,
    isFetching: list.isFetchingNextPage,
    fetchNextPage: list.fetchNextPage,
  }
  const observerRef = useRef<IntersectionObserver | null>(null)
  const setSentinel = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        const s = stateRef.current
        if (s.hasNextPage && !s.isFetching) s.fetchNextPage()
      },
      { rootMargin: '0px 0px 320px 0px' },
    )
    observerRef.current.observe(node)
  }, [])

  const handleClearFilters = () => {
    setSearch('')
    setType('')
    setUnreadOnly(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('notifications:page.title')}
        description={t('notifications:page.description')}
        actions={
          <Can permission={PERMISSIONS.notifications.broadcast}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBroadcastOpen(true)}
              className="gap-2"
              disabled={broadcast.isPending}
            >
              <Megaphone className="size-4" />
              {t('notifications:broadcast.button')}
            </Button>
          </Can>
        }
      />

      <TableFiltersShell
        meta={
          <span>
            {t('notifications:filters.total_count', {
              count: format.number(filtered.length),
            })}
            {' · '}
            {t('notifications:popover.unread_count', {
              count: format.number(totalUnread),
            })}
          </span>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('notifications:filters.search_placeholder')}
          className="min-w-[18rem]"
        />
        <FilterSelect
          value={type}
          onChange={setType}
          options={typeOptions}
          placeholder={t('notifications:filters.type_label')}
        />
        <div className="flex h-9 items-center gap-2 ps-1">
          <Checkbox
            id={UNREAD_ONLY_ID}
            checked={unreadOnly}
            onCheckedChange={(v) => setUnreadOnly(v === true)}
          />
          <Label
            htmlFor={UNREAD_ONLY_ID}
            className="cursor-pointer text-sm text-foreground"
          >
            {t('notifications:filters.unread_only')}
          </Label>
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('notifications:filters.clear')}
          </Button>
        )}
      </TableFiltersShell>

      {filtered.length === 0 && !list.isLoading ? (
        <EmptyState
          icon={hasActiveFilters ? SlidersHorizontal : Bell}
          title={t(
            hasActiveFilters
              ? 'notifications:empty.filtered_title'
              : 'notifications:empty.title',
          )}
          message={t(
            hasActiveFilters
              ? 'notifications:empty.filtered_hint'
              : 'notifications:empty.hint',
          )}
          {...(hasActiveFilters
            ? {
                actionLabel: t('notifications:filters.clear'),
                onAction: handleClearFilters,
              }
            : {})}
        />
      ) : (
        <NotificationsFeed
          items={filtered}
          variant="page"
          isLoading={list.isLoading}
          onMarkRead={(id) => markRead.mutate(id)}
          markingId={markRead.isPending ? (markRead.variables ?? null) : null}
          loadMoreSentinel={
            list.hasNextPage ? (
              <div
                ref={setSentinel}
                className="flex items-center justify-center py-6 text-xs text-muted-foreground"
              >
                {list.isFetchingNextPage ? t('notifications:popover.loading') : ''}
              </div>
            ) : null
          }
        />
      )}

      <ConfirmDialog
        open={broadcastOpen}
        onOpenChange={setBroadcastOpen}
        title={t('notifications:broadcast.confirm_title')}
        description={t('notifications:broadcast.confirm_body')}
        confirmLabel={t('notifications:broadcast.confirm_action')}
        isLoading={broadcast.isPending}
        onConfirm={() => {
          broadcast.mutate(undefined, {
            onSettled: () => setBroadcastOpen(false),
          })
        }}
      />
    </div>
  )
}

function filterClientSide(
  items: AdminNotification[],
  opts: { search: string; unreadOnly: boolean; lang: string },
): AdminNotification[] {
  const q = opts.search.trim().toLocaleLowerCase()
  const lang = opts.lang === 'ar' ? 'ar' : 'en'
  return items.filter((n) => {
    if (opts.unreadOnly && n.is_read) return false
    if (q) {
      const title = lang === 'ar' ? n.title_ar : n.title_en
      const body = lang === 'ar' ? n.body_ar : n.body_en
      if (!title.toLocaleLowerCase().includes(q) && !body.toLocaleLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })
}
