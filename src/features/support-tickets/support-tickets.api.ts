import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type Paginated,
  type SupportTicketDetail,
  type SupportTicketListItem,
  type SupportTicketMessageType,
  type SupportTicketStatus,
} from '@/types/api'

export interface ListSupportTicketsParams {
  search?: string
  status?: SupportTicketStatus
  message_type?: SupportTicketMessageType
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export async function listSupportTickets(
  params: ListSupportTicketsParams,
): Promise<Paginated<SupportTicketListItem>> {
  const res = await api.get<ApiEnvelope<SupportTicketListItem[]>>(
    '/admin/support-tickets',
    { params },
  )
  return unwrapPaginated(res.data)
}

export async function getSupportTicket(id: string): Promise<SupportTicketDetail> {
  const res = await api.get<ApiEnvelope<SupportTicketDetail> | SupportTicketDetail>(
    `/admin/support-tickets/${id}`,
  )
  return unwrap(res.data)
}

export async function updateSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
): Promise<void> {
  await api.patch(`/admin/support-tickets/${id}/status`, { status })
}
