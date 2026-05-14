import { useQueries, useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import type { ComplaintStatus } from '@/types/api'
import {
  addComplaintNote,
  closeComplaintConversation,
  getComplaintDetail,
  listComplaintNotes,
  listComplaintTypes,
  listComplaints,
  rejectComplaint,
  resolveComplaint,
  sendComplaintNotification,
  startInvestigation,
  type ListComplaintsParams,
} from '@/features/complaints/complaints.api'

export const complaintKeys = createResourceKeys<ListComplaintsParams>('complaints')

export const complaintTypeKeys = {
  all: ['complaint-types'] as const,
}

export const complaintNoteKeys = {
  all: ['complaint-notes'] as const,
  list: (id: string) => ['complaint-notes', id] as const,
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export function useComplaintsQuery(params: ListComplaintsParams) {
  return useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => listComplaints(params),
  })
}

export function useComplaintDetailQuery(id: string) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => getComplaintDetail(id),
    enabled: !!id,
  })
}

export function useComplaintTypesQuery() {
  return useQuery({
    queryKey: complaintTypeKeys.all,
    queryFn: () => listComplaintTypes(),
    staleTime: 60 * 60 * 1000,
  })
}

export function useComplaintNotesQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: complaintNoteKeys.list(id),
    queryFn: () => listComplaintNotes(id),
    enabled: enabled && !!id,
  })
}

const STATUS_VALUES: ComplaintStatus[] = [
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
]

export interface ComplaintStatusCounts {
  total: number
  UNDER_REVIEW: number
  IN_PROGRESS: number
  RESOLVED: number
  REJECTED: number
  isLoading: boolean
}

/**
 * Per-status totals for the triage strip on the list page. Issues four
 * parallel `limit=1` requests and reads `meta.total`. Cheap, cached, and
 * doesn't require a dedicated backend endpoint.
 */
export function useComplaintStatusCounts(): ComplaintStatusCounts {
  const queries = useQueries({
    queries: STATUS_VALUES.map((status) => ({
      queryKey: complaintKeys.list({ status, page: 1, limit: 1 }),
      queryFn: () => listComplaints({ status, page: 1, limit: 1 }),
      staleTime: 60_000,
    })),
  })

  const byStatus = {} as Record<ComplaintStatus, number>
  let total = 0
  let isLoading = false
  queries.forEach((q, idx) => {
    const status = STATUS_VALUES[idx]!
    const count = q.data?.meta.total ?? 0
    byStatus[status] = count
    total += count
    if (q.isLoading) isLoading = true
  })

  return {
    total,
    UNDER_REVIEW: byStatus.UNDER_REVIEW ?? 0,
    IN_PROGRESS: byStatus.IN_PROGRESS ?? 0,
    RESOLVED: byStatus.RESOLVED ?? 0,
    REJECTED: byStatus.REJECTED ?? 0,
    isLoading,
  }
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

export function useStartInvestigationMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => startInvestigation(id),
    invalidate: [complaintKeys.all],
    successKey: 'complaints:toasts.start_success',
    errorKey: 'complaints:errors.start_failed',
  })
}

export function useResolveComplaintMutation() {
  return useResourceMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      resolveComplaint(id, note),
    invalidate: [complaintKeys.all],
    successKey: 'complaints:toasts.resolve_success',
    errorKey: 'complaints:errors.resolve_failed',
  })
}

export function useRejectComplaintMutation() {
  return useResourceMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectComplaint(id, reason),
    invalidate: [complaintKeys.all],
    successKey: 'complaints:toasts.reject_success',
    errorKey: 'complaints:errors.reject_failed',
  })
}

export function useCloseConversationMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => closeComplaintConversation(id),
    invalidate: [complaintKeys.all],
    successKey: 'complaints:toasts.close_success',
    errorKey: 'complaints:errors.close_failed',
  })
}

export function useAddComplaintNoteMutation(complaintId: string) {
  return useResourceMutation({
    mutationFn: (note: string) => addComplaintNote(complaintId, note),
    invalidate: [complaintNoteKeys.list(complaintId), complaintKeys.detail(complaintId)],
    successKey: 'complaints:toasts.note_success',
    errorKey: 'complaints:errors.note_failed',
  })
}

export function useSendComplaintNotificationMutation() {
  return useResourceMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      sendComplaintNotification(id, message),
    invalidate: [complaintKeys.all],
    successKey: 'complaints:toasts.notify_success',
    errorKey: 'complaints:errors.notify_failed',
  })
}
