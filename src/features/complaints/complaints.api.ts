import { api } from '@/lib/axios'
import { i18n } from '@/lib/i18n'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type ComplaintDetail,
  type ComplaintNoteItem,
  type ComplaintStatus,
  type ComplaintSummary,
  type ComplaintTypeOption,
  type Paginated,
} from '@/types/api'
import {
  MOCK_COMPLAINT_DETAILS,
  MOCK_COMPLAINT_NOTES,
  MOCK_COMPLAINT_SUMMARIES,
  MOCK_COMPLAINT_TYPES,
  cloneComplaintDetail,
} from './complaints.mock'

export interface ListComplaintsParams {
  search?: string
  status?: ComplaintStatus
  type_id?: string
  page?: number
  limit?: number
}

// TODO(backend): once the admin complaints endpoints + admin types endpoint
// are live in every environment, delete every `isMissingEndpoint(err)` branch
// below, the `./complaints.mock` import, and `src/features/complaints/complaints.mock.ts`.
// The fallback is intentionally narrow — only fires in DEV builds when the
// server is unreachable (network error) or returns 404. Production never
// silently masks an outage.
const DEV_FALLBACK = import.meta.env.DEV

function isMissingEndpoint(err: unknown): boolean {
  const response = (err as { response?: { status?: number } } | undefined)?.response
  const status = response?.status
  if (!DEV_FALLBACK) return false
  return !response || status === 404
}

/* ------------------------------------------------------------------ */
/*  Reference data                                                     */
/* ------------------------------------------------------------------ */

export async function listComplaintTypes(): Promise<ComplaintTypeOption[]> {
  // Admin namespace — never call the mobile `/complaints/types` route from here:
  // it requires a user JWT and a 401 trips the global interceptor into a logout.
  try {
    const res = await api.get<ApiEnvelope<ComplaintTypeOption[]> | ComplaintTypeOption[]>(
      '/admin/complaints/types',
      { headers: { 'Accept-Language': i18n.language === 'ar' ? 'ar' : 'en' } },
    )
    return unwrap(res.data) as ComplaintTypeOption[]
  } catch (err) {
    if (isMissingEndpoint(err)) return MOCK_COMPLAINT_TYPES(i18n.language)
    // Non-404 errors (network, 500, etc.) shouldn't take down the filter dropdown.
    if (!DEV_FALLBACK) return []
    throw err
  }
}

/* ------------------------------------------------------------------ */
/*  List + detail                                                      */
/* ------------------------------------------------------------------ */

export async function listComplaints(
  params: ListComplaintsParams,
): Promise<Paginated<ComplaintSummary>> {
  try {
    const res = await api.get<ApiEnvelope<ComplaintSummary[]>>('/admin/complaints', { params })
    return unwrapPaginated(res.data)
  } catch (err) {
    if (isMissingEndpoint(err)) return mockListComplaints(params)
    throw err
  }
}

export async function getComplaintDetail(id: string): Promise<ComplaintDetail> {
  try {
    const res = await api.get<ApiEnvelope<ComplaintDetail> | ComplaintDetail>(
      `/admin/complaints/${id}`,
    )
    return unwrap(res.data)
  } catch (err) {
    if (isMissingEndpoint(err)) {
      const detail = MOCK_COMPLAINT_DETAILS[id] ?? Object.values(MOCK_COMPLAINT_DETAILS)[0]
      if (!detail) throw err
      return cloneComplaintDetail(detail)
    }
    throw err
  }
}

/* ------------------------------------------------------------------ */
/*  Moderation mutations                                               */
/* ------------------------------------------------------------------ */

export async function startInvestigation(id: string): Promise<void> {
  try {
    await api.patch(`/admin/complaints/${id}/start`)
  } catch (err) {
    if (isMissingEndpoint(err)) {
      mockMutateStatus(id, 'IN_PROGRESS', 'started_investigation')
      return
    }
    throw err
  }
}

export async function resolveComplaint(
  id: string,
  resolutionNote: string,
): Promise<void> {
  try {
    await api.patch(`/admin/complaints/${id}/resolve`, { resolution_note: resolutionNote })
  } catch (err) {
    if (isMissingEndpoint(err)) {
      mockMutateStatus(id, 'RESOLVED', 'resolved', { note: resolutionNote })
      return
    }
    throw err
  }
}

export async function rejectComplaint(
  id: string,
  rejectionReason: string,
): Promise<void> {
  try {
    await api.patch(`/admin/complaints/${id}/reject`, { rejection_reason: rejectionReason })
  } catch (err) {
    if (isMissingEndpoint(err)) {
      mockMutateStatus(id, 'REJECTED', 'rejected', { note: rejectionReason })
      return
    }
    throw err
  }
}

export async function closeComplaintConversation(id: string): Promise<void> {
  try {
    await api.patch(`/admin/complaints/${id}/close-conversation`)
  } catch (err) {
    if (isMissingEndpoint(err)) {
      mockCloseConversation(id)
      return
    }
    throw err
  }
}

/* ------------------------------------------------------------------ */
/*  Notes                                                              */
/* ------------------------------------------------------------------ */

export async function listComplaintNotes(id: string): Promise<ComplaintNoteItem[]> {
  try {
    const res = await api.get<ApiEnvelope<ComplaintNoteItem[]> | ComplaintNoteItem[]>(
      `/admin/complaints/${id}/notes`,
    )
    return unwrap(res.data) as ComplaintNoteItem[]
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return [...(MOCK_COMPLAINT_NOTES[id] ?? [])]
    }
    throw err
  }
}

export async function addComplaintNote(
  id: string,
  note: string,
): Promise<ComplaintNoteItem> {
  try {
    const res = await api.post<ApiEnvelope<ComplaintNoteItem> | ComplaintNoteItem>(
      `/admin/complaints/${id}/notes`,
      { note },
    )
    return unwrap(res.data) as ComplaintNoteItem
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return mockAddNote(id, note)
    }
    throw err
  }
}

/* ------------------------------------------------------------------ */
/*  Notification                                                       */
/* ------------------------------------------------------------------ */

export async function sendComplaintNotification(
  id: string,
  message: string,
): Promise<void> {
  try {
    await api.post(`/admin/complaints/${id}/notify`, { message })
  } catch (err) {
    if (isMissingEndpoint(err)) {
      mockAppendActivity(id, 'sent_notification', { message })
      return
    }
    throw err
  }
}

/* ------------------------------------------------------------------ */
/*  Dev-only mock helpers                                              */
/* ------------------------------------------------------------------ */

function mockListComplaints(params: ListComplaintsParams): Paginated<ComplaintSummary> {
  const search = params.search?.toLowerCase().trim() ?? ''
  const status = params.status
  const typeId = params.type_id
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  let filtered = MOCK_COMPLAINT_SUMMARIES.slice()
  if (search) {
    filtered = filtered.filter((row) => {
      const name = row.submitter.full_name?.toLowerCase() ?? ''
      return name.includes(search) || row.id.toLowerCase().includes(search)
    })
  }
  if (status) filtered = filtered.filter((row) => row.status === status)
  if (typeId) filtered = filtered.filter((row) => row.complaint_type.id === typeId)

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const rows = filtered.slice(start, start + limit)
  return {
    data: rows,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

function mockMutateStatus(
  id: string,
  status: ComplaintStatus,
  action: string,
  options?: { note?: string },
) {
  const detail = MOCK_COMPLAINT_DETAILS[id]
  if (!detail) return
  detail.status = status
  detail.updated_at = new Date().toISOString()
  if (status === 'RESOLVED' || status === 'REJECTED') {
    detail.conversation_closed = true
    detail.resolution_note = options?.note ?? null
    detail.resolved_at = new Date().toISOString()
    detail.resolved_by = 'mock-admin-id'
  }
  detail.activities = [
    ...detail.activities,
    {
      id: crypto.randomUUID(),
      actor_type: 'admin',
      actor_id: 'mock-admin-id',
      action,
      metadata: options?.note ? { note: options.note } : null,
      created_at: new Date().toISOString(),
    },
  ]
  const summary = MOCK_COMPLAINT_SUMMARIES.find((s) => s.id === id)
  if (summary) summary.status = status
}

function mockCloseConversation(id: string) {
  const detail = MOCK_COMPLAINT_DETAILS[id]
  if (!detail) return
  detail.conversation_closed = true
  detail.updated_at = new Date().toISOString()
  detail.activities = [
    ...detail.activities,
    {
      id: crypto.randomUUID(),
      actor_type: 'admin',
      actor_id: 'mock-admin-id',
      action: 'closed_conversation',
      metadata: null,
      created_at: new Date().toISOString(),
    },
  ]
}

function mockAddNote(id: string, note: string): ComplaintNoteItem {
  const created: ComplaintNoteItem = {
    id: crypto.randomUUID(),
    adminName: 'You',
    note,
    createdAt: new Date().toISOString(),
  }
  MOCK_COMPLAINT_NOTES[id] = [...(MOCK_COMPLAINT_NOTES[id] ?? []), created]
  mockAppendActivity(id, 'added_note', { note })
  return created
}

function mockAppendActivity(id: string, action: string, metadata: Record<string, unknown>) {
  const detail = MOCK_COMPLAINT_DETAILS[id]
  if (!detail) return
  detail.activities = [
    ...detail.activities,
    {
      id: crypto.randomUUID(),
      actor_type: 'admin',
      actor_id: 'mock-admin-id',
      action,
      metadata,
      created_at: new Date().toISOString(),
    },
  ]
}
