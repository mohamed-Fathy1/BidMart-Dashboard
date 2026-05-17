import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { SupportTicketListItem } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'
import { InitialAvatar } from '@/features/complaints/complaint-ui'

export function useSupportTicketColumns(): ColumnDef<SupportTicketListItem>[] {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        id: 'serial',
        header: t('supportTickets:columns.serial'),
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            #{row.original.serial_number}
          </span>
        ),
      },
      {
        id: 'sender',
        header: t('supportTickets:columns.sender'),
        cell: ({ row }) => {
          const name = row.original.user_name
          return (
            <div className="flex min-w-0 items-center gap-3">
              <InitialAvatar name={name} size="md" />
              <div className="min-w-0 flex flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground" title={name}>
                  {name}
                </span>
                <span
                  className="truncate text-[11px] text-muted-foreground"
                  title={row.original.email}
                >
                  {row.original.email}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'phone_number',
        header: t('supportTickets:columns.phone'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'message_type',
        header: t('supportTickets:columns.type'),
        cell: ({ row }) => (
          <StatusBadge type="supportTicketType" status={row.original.message_type} />
        ),
      },
      {
        accessorKey: 'status',
        header: t('supportTickets:columns.status'),
        cell: ({ row }) => (
          <StatusBadge type="supportTicket" status={row.original.status} />
        ),
      },
      {
        accessorKey: 'created_at',
        header: t('supportTickets:columns.submitted'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {format.dateTime(getValue<string>())}
          </span>
        ),
      },
    ],
    [t],
  )
}
