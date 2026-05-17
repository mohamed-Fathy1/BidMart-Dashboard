import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import type { SupportTicketStatus } from '@/types/api'
import {
  getSupportTicket,
  listSupportTickets,
  updateSupportTicketStatus,
  type ListSupportTicketsParams,
} from '@/features/support-tickets/support-tickets.api'

export const supportTicketKeys = createResourceKeys<ListSupportTicketsParams>(
  'support-tickets',
)

export function useSupportTicketsQuery(params: ListSupportTicketsParams) {
  return useQuery({
    queryKey: supportTicketKeys.list(params),
    queryFn: () => listSupportTickets(params),
  })
}

export function useSupportTicketQuery(id: string) {
  return useQuery({
    queryKey: supportTicketKeys.detail(id),
    queryFn: () => getSupportTicket(id),
    enabled: !!id,
  })
}

export function useUpdateSupportTicketStatusMutation(id: string) {
  return useResourceMutation({
    mutationFn: (status: SupportTicketStatus) => updateSupportTicketStatus(id, status),
    invalidate: [supportTicketKeys.all, supportTicketKeys.detail(id)],
    successKey: 'supportTickets:toasts.update_success',
    errorKey: 'supportTickets:errors.update_failed',
  })
}
