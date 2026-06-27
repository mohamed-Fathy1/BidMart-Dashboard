import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Check,
  CheckCheck,
  Image as ImageIcon,
  Lock,
} from 'lucide-react'
import type {
  ComplaintChatClosedReason,
  ComplaintMessageAdmin,
  ComplaintStatus,
} from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'
import { InitialAvatar, complaintStatusTint } from '@/features/complaints/complaint-ui'
import { ComplaintComposer } from '@/features/complaints/complaint-composer'
import type { ComplaintSocketStatus } from '@/features/complaints/complaint-socket'

interface ComplaintChatThreadProps {
  status: ComplaintStatus
  messages: ComplaintMessageAdmin[]
  conversationClosed: boolean
  /** Name of the complainant, used for the user-side avatar. */
  complainantName?: string | null
  connectionStatus: ComplaintSocketStatus
  typingActorIds: string[]
  onSend: (payload: { text?: string; fileUrl?: string }) => void | Promise<void>
  onTyping: (active: boolean) => void
  onMarkRead: () => void
}

export interface DateGroup {
  date: string
  messages: ComplaintMessageAdmin[]
}

export function groupByDate(messages: ComplaintMessageAdmin[]): DateGroup[] {
  const groups: DateGroup[] = []
  let current: DateGroup | null = null
  for (const message of messages) {
    const date = message.createdAt.slice(0, 10)
    if (!current || current.date !== date) {
      current = { date, messages: [] }
      groups.push(current)
    }
    current.messages.push(message)
  }
  return groups
}

/**
 * Whether a message belongs to the same "run" as the previous one — same sender
 * within 3 minutes. Run continuations skip the avatar and meta row.
 */
function isContinuation(
  prev: ComplaintMessageAdmin | undefined,
  current: ComplaintMessageAdmin,
): boolean {
  if (!prev) return false
  if (prev.senderId !== current.senderId) return false
  const gap = Date.parse(current.createdAt) - Date.parse(prev.createdAt)
  return gap >= 0 && gap < 3 * 60_000
}

function deriveChatClosedReason(
  status: ComplaintStatus,
  conversationClosed: boolean,
): ComplaintChatClosedReason {
  if (status === 'RESOLVED') return 'resolved'
  if (status === 'REJECTED') return 'rejected'
  if (status === 'UNDER_REVIEW') return null
  if (conversationClosed) return 'manually_closed'
  return null
}

function chatAvailable(
  status: ComplaintStatus,
  conversationClosed: boolean,
): boolean {
  return status === 'IN_PROGRESS' && !conversationClosed
}

export function ComplaintChatThread({
  status,
  messages,
  conversationClosed,
  complainantName,
  connectionStatus,
  typingActorIds,
  onSend,
  onTyping,
  onMarkRead,
}: ComplaintChatThreadProps) {
  const { t, i18n } = useTranslation()

  const groups = useMemo(() => groupByDate(messages), [messages])
  const isOpen = chatAvailable(status, conversationClosed)
  const closedReason = deriveChatClosedReason(status, conversationClosed)
  const dateFormatter = useMemo(
    () =>
      // Force the Gregorian calendar in Arabic (ar-SA defaults to Hijri) so
      // chat day separators match the app-wide date convention in lib/format.
      new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [i18n.language],
  )

  // Fire mark-read on mount and when messages mutate while the tab is visible.
  const onMarkReadRef = useRef(onMarkRead)
  onMarkReadRef.current = onMarkRead
  useEffect(() => {
    if (!isOpen) return
    onMarkReadRef.current()
  }, [isOpen, messages.length])

  // Auto-scroll to the latest bubble.
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typingActorIds.length])

  const connectionLabel =
    connectionStatus === 'connecting'
      ? t('complaints:chat.connecting')
      : connectionStatus === 'reconnecting'
        ? t('complaints:chat.reconnecting')
        : connectionStatus === 'disconnected'
          ? t('complaints:chat.disconnected')
          : null

  const connectionDotClass =
    connectionStatus === 'connected'
      ? 'bg-emerald-500'
      : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
        ? 'bg-amber-400 motion-safe:animate-pulse'
        : 'bg-stone-300'

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border py-0">
      <CardContent className="flex min-h-[460px] max-h-[78vh] flex-col p-0">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <InitialAvatar
              name={complainantName}
              size="sm"
              tone="neutral"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold text-foreground">
                {complainantName ?? t('complaints:chat.complainant')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('complaints:chat.title')}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span aria-hidden className={cn('size-1.5 rounded-full', connectionDotClass)} />
            <span>
              {connectionLabel ??
                t('complaints:chat.connected', { defaultValue: 'Live' })}
            </span>
          </span>
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/20 px-4 py-3 sm:px-5"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="max-w-sm text-center text-sm text-muted-foreground">
                {t('complaints:chat.empty')}
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.date} className="space-y-1">
                <div className="relative my-1.5 flex items-center">
                  <span aria-hidden className="h-px flex-1 bg-border" />
                  <span className="px-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {dateFormatter.format(new Date(group.date))}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>
                {group.messages.map((message, idx) => (
                  <MessageRow
                    key={message.id}
                    message={message}
                    complainantName={complainantName}
                    continuation={isContinuation(group.messages[idx - 1], message)}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {isOpen ? (
          <>
            {typingActorIds.length > 0 && (
              <TypingIndicator who={complainantName ?? t('complaints:chat.complainant')} />
            )}
            <ComplaintComposer
              connectionStatus={connectionStatus}
              onSend={onSend}
              onTyping={onTyping}
            />
          </>
        ) : (
          <ChatClosedBanner status={status} reason={closedReason} />
        )}
      </CardContent>
    </Card>
  )
}

function TypingIndicator({ who }: { who: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-4 py-1.5 sm:px-5">
      <span className="inline-flex items-center gap-1" aria-hidden>
        <span className="size-1.5 rounded-full bg-primary/70 motion-safe:animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-primary/70 motion-safe:animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-primary/70 motion-safe:animate-bounce" />
      </span>
      <span className="text-[11px] text-muted-foreground">
        {t('complaints:chat.typing_someone', { who })}
      </span>
    </div>
  )
}

function MessageRow({
  message,
  complainantName,
  continuation,
}: {
  message: ComplaintMessageAdmin
  complainantName?: string | null
  continuation: boolean
}) {
  const { t } = useTranslation()
  const isMe = message.isMe
  const senderLabel = isMe
    ? t('complaints:chat.you')
    : message.sender === 'USER'
      ? (complainantName ?? t('complaints:chat.complainant'))
      : t('complaints:chat.support')

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2',
        isMe ? 'justify-end' : 'justify-start',
        continuation ? 'mt-0.5' : 'mt-1.5 first:mt-0',
      )}
    >
      {!isMe && (
        <span className="w-8 shrink-0">
          {!continuation && (
            <InitialAvatar
              name={senderLabel}
              size="sm"
              tone={message.sender === 'ADMIN' ? 'primary' : 'neutral'}
            />
          )}
        </span>
      )}
      <div
        className={cn(
          'flex max-w-[min(100%,28rem)] flex-col gap-0.5 px-3 py-1.5 ring-1 ring-inset',
          isMe
            ? 'bg-primary text-primary-foreground ring-primary/30'
            : 'bg-card text-foreground ring-border',
          // Sharper trailing corner only on the run's first bubble — chat tail.
          isMe
            ? continuation
              ? 'rounded-2xl'
              : 'rounded-2xl rounded-ee-md'
            : continuation
              ? 'rounded-2xl'
              : 'rounded-2xl rounded-es-md',
        )}
      >
        {!continuation && (
          <div
            className={cn(
              'flex justify-between pe-2 items-baseline gap-2 text-[11px]',
              isMe ? 'text-primary-foreground/80' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'font-semibold',
                isMe ? 'text-primary-foreground' : 'text-foreground',
              )}
            >
              {senderLabel}
            </span>
            <span className="tabular-nums">
              {format.time(message.createdAt)}
            </span>
          </div>
        )}

        {message.messageType === 'MEDIA' && message.fileUrl ? (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'relative block aspect-[4/3] w-64 max-w-full overflow-hidden rounded-md ring-1 ring-inset',
              isMe ? 'ring-primary-foreground/30' : 'ring-border',
            )}
          >
            <img
              src={message.fileUrl}
              alt=""
              width={400}
              height={300}
              loading="lazy"
              className="absolute inset-0 block size-full object-cover"
            />
          </a>
        ) : null}

        {message.content ? (
          <p className="text-pretty text-sm leading-relaxed">{message.content}</p>
        ) : message.messageType === 'MEDIA' ? (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs',
              isMe ? 'text-primary-foreground/80' : 'text-muted-foreground',
            )}
          >
            <ImageIcon className="size-3.5" aria-hidden />
          </span>
        ) : null}

        {isMe && !continuation && (
          <div className="inline-flex items-center justify-end gap-1 text-[11px] text-primary-foreground/85">
            <MessageStatus status={message.status} />
          </div>
        )}
      </div>
      {isMe && (
        <span className="w-8 shrink-0">
          {!continuation && (
            <InitialAvatar
              name={senderLabel}
              size="sm"
              tone="primary"
            />
          )}
        </span>
      )}
    </div>
  )
}

function MessageStatus({ status }: { status: ComplaintMessageAdmin['status'] }) {
  const { t } = useTranslation()
  if (status === 'READ') {
    return (
      <span className="inline-flex items-center gap-1">
        <CheckCheck className="size-3.5" aria-hidden />
        {t('complaints:chat.status_read')}
      </span>
    )
  }
  if (status === 'DELIVERED') {
    return (
      <span className="inline-flex items-center gap-1">
        <CheckCheck className="size-3.5" aria-hidden />
        {t('complaints:chat.status_delivered')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Check className="size-3.5" aria-hidden />
      {t('complaints:chat.status_sent')}
    </span>
  )
}

function ChatClosedBanner({
  status,
  reason,
}: {
  status: ComplaintStatus
  reason: ComplaintChatClosedReason
}) {
  const { t } = useTranslation()
  const tint = complaintStatusTint(status)
  const message =
    reason === 'resolved'
      ? t('complaints:chat.locked_resolved')
      : reason === 'rejected'
        ? t('complaints:chat.locked_rejected')
        : reason === 'manually_closed'
          ? t('complaints:chat.locked_manually_closed')
          : status === 'UNDER_REVIEW'
            ? t('complaints:chat.locked_under_review')
            : t('complaints:chat.locked_manually_closed')
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 border-t border-border px-4 py-3 text-sm sm:px-5',
        tint.bandBg,
        tint.bandText,
      )}
    >
      <Lock className="size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  )
}
