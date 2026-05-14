import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { ComplaintSummary } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'
import { cn } from '@/lib/utils'
import {
  InitialAvatar,
  formatWaitDuration,
  shortComplaintId,
  waitTone,
} from '@/features/complaints/complaint-ui'

const WAIT_TONE_CLASSES = {
  cool: 'text-muted-foreground',
  warm: 'text-amber-700',
  hot: 'text-red-600 font-semibold',
} as const

export function useComplaintColumns(): ColumnDef<ComplaintSummary>[] {
  const { t, i18n } = useTranslation()

  return useMemo(
    () => [
      {
        id: 'submitter',
        header: t('complaints:columns.submitter'),
        cell: ({ row }) => {
          const name = row.original.submitter.full_name ?? '—'
          return (
            <div className="flex min-w-0 items-center gap-3">
              <InitialAvatar name={row.original.submitter.full_name} size="md" />
              <div className="min-w-0 flex flex-col leading-tight">
                <span
                  className="truncate text-sm font-medium text-foreground"
                  title={name}
                >
                  {name}
                </span>
                <span
                  className="truncate font-mono text-[11px] tabular-nums text-muted-foreground"
                  title={row.original.id}
                >
                  {shortComplaintId(row.original.id)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: 'type',
        header: t('complaints:columns.type'),
        cell: ({ row }) => {
          const label = localizedName(row.original.complaint_type, i18n)
          return (
            <span
              className="block max-w-44 truncate text-sm text-muted-foreground"
              title={label}
            >
              {label}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: t('complaints:columns.status'),
        cell: ({ row }) => (
          <StatusBadge type="complaint" status={row.original.status} />
        ),
      },
      {
        id: 'lastMessage',
        header: t('complaints:columns.last_message'),
        cell: ({ row }) => {
          const last = row.original.lastMessage
          const unread = row.original.adminUnreadCount > 0
          if (!last) {
            return (
              <span className="text-xs italic text-muted-foreground/80">
                {t('complaints:columns.no_messages')}
              </span>
            )
          }
          const preview =
            last.messageType === 'IMAGE'
              ? t('complaints:columns.image_message')
              : last.content
          return (
            <div className="flex max-w-[20rem] min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  'truncate text-sm',
                  unread
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
                title={preview}
              >
                {preview}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {format.dateTime(last.createdAt)}
                </span>
                {unread && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-inset ring-primary/20">
                    <span aria-hidden className="size-1 rounded-full bg-primary" />
                    {t('complaints:columns.unread_label', {
                      count: row.original.adminUnreadCount,
                    })}
                  </span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: 'waiting',
        header: t('complaints:columns.waiting'),
        cell: ({ row }) => {
          // Wait = age since the last sender-side message OR the complaint
          // creation time. This is what an operator actually triages by.
          const reference = row.original.lastMessage?.createdAt
            ? row.original.lastMessage.isRead
              ? row.original.created_at
              : row.original.lastMessage.createdAt
            : row.original.created_at
          const tone = waitTone(reference)
          const label = formatWaitDuration(reference, t)
          return (
            <span
              className={cn(
                'font-mono text-xs tabular-nums',
                WAIT_TONE_CLASSES[tone],
              )}
              title={format.dateTime(reference)}
            >
              {label}
            </span>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: t('complaints:columns.created_at'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {format.dateTime(getValue<string>())}
          </span>
        ),
      },
    ],
    [t, i18n.language],
  )
}
