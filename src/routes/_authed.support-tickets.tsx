import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SupportTicketsListPage } from '@/features/support-tickets/support-tickets-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readEnum, type ListSearchBase } from '@/lib/list-search'
import type {
  SupportTicketMessageType,
  SupportTicketStatus,
} from '@/types/api'

const STATUS_VALUES: readonly SupportTicketStatus[] = [
  'NEW',
  'CONTACTED',
  'UNDER_REVIEW',
]

const TYPE_VALUES: readonly SupportTicketMessageType[] = [
  'COMPLAINT',
  'SUGGESTION',
  'INQUIRY',
  'ADVERTISEMENT',
  'OTHER',
]

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function readIsoDate(raw: unknown): string | undefined {
  return typeof raw === 'string' && ISO_DATE_REGEX.test(raw) ? raw : undefined
}

export interface SupportTicketsSearch extends ListSearchBase {
  status?: SupportTicketStatus
  message_type?: SupportTicketMessageType
  date_from?: string
  date_to?: string
}

export const Route = createFileRoute('/_authed/support-tickets')({
  validateSearch: (search: Record<string, unknown>): SupportTicketsSearch => ({
    ...parseListSearchBase(search),
    status: readEnum(search.status, STATUS_VALUES),
    message_type: readEnum(search.message_type, TYPE_VALUES),
    date_from: readIsoDate(search.date_from),
    date_to: readIsoDate(search.date_to),
  }),
  component: SupportTicketsRoute,
})

function SupportTicketsRoute() {
  const allowed = usePermission(PERMISSIONS.contactMessages.view)
  if (!allowed) return <PermissionDenied />

  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/support-tickets/$ticketId' })

  return detailMatch ? <Outlet /> : <SupportTicketsListPage />
}
