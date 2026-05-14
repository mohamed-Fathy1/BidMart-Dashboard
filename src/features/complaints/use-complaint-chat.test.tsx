import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ComplaintDetail } from '@/types/api'
import { queryClient } from '@/lib/query-client'
import { complaintKeys } from './complaints.queries'

/* ---------- Fake socket module ---------- */

const handlers = new Map<string, Set<(payload: unknown) => void>>()
const fakeSocket = {
  emit: vi.fn(),
  on: vi.fn((name: string, h: (p: unknown) => void) => {
    if (!handlers.has(name)) handlers.set(name, new Set())
    handlers.get(name)!.add(h)
  }),
  off: vi.fn((name: string, h: (p: unknown) => void) => {
    handlers.get(name)?.delete(h)
  }),
}

function fireServer(name: string, payload: unknown) {
  handlers.get(name)?.forEach((h) => h(payload))
}

vi.mock('./complaint-socket', () => ({
  getComplaintSocket: () => fakeSocket,
  subscribeComplaintSocketStatus: (cb: (s: string) => void) => {
    cb('connected')
    return () => {}
  },
}))

import { useComplaintChat } from './use-complaint-chat'

/* ---------- Fixtures ---------- */

const COMPLAINT_ID = 'aaaa1111-2222-3333-4444-555566667777'
const SELF_ADMIN_ID = 'admin-self'

function seedDetail(overrides: Partial<ComplaintDetail> = {}): ComplaintDetail {
  return {
    id: COMPLAINT_ID,
    submitter: { id: 'u-1', full_name: 'Sara', phone_number: null },
    complaint_type: { id: 't-1', name_en: 'Type', name_ar: 'نوع' },
    status: 'IN_PROGRESS',
    description: '',
    attachment_urls: [],
    notes: [],
    activities: [],
    resolution_note: null,
    resolved_by: null,
    resolved_at: null,
    conversation_closed: false,
    messages: [],
    created_at: '2026-05-12T08:00:00.000Z',
    updated_at: '2026-05-12T08:00:00.000Z',
    ...overrides,
  }
}

function getDetail(): ComplaintDetail | undefined {
  return queryClient.getQueryData<ComplaintDetail>(
    complaintKeys.detail(COMPLAINT_ID),
  )
}

beforeEach(() => {
  queryClient.clear()
  handlers.clear()
  fakeSocket.emit.mockClear()
})

/* ---------- Tests ---------- */

describe('useComplaintChat', () => {
  it('inserts an optimistic message on send and reconciles with the server echo', async () => {
    queryClient.setQueryData(complaintKeys.detail(COMPLAINT_ID), seedDetail())

    const { result } = renderHook(() =>
      useComplaintChat(COMPLAINT_ID, {
        enabled: true,
        selfAdminId: SELF_ADMIN_ID,
        complainantName: 'Sara',
      }),
    )

    await act(async () => {
      await result.current.send({ text: 'hello there' })
    })

    const afterSend = getDetail()!
    expect(afterSend.messages).toHaveLength(1)
    expect(afterSend.messages[0]?.id.startsWith('tmp-')).toBe(true)
    expect(afterSend.messages[0]?.content).toBe('hello there')
    expect(afterSend.messages[0]?.isMe).toBe(true)
    expect(fakeSocket.emit).toHaveBeenCalledWith(
      'complaint:message:send',
      expect.objectContaining({
        complaintId: COMPLAINT_ID,
        message: 'hello there',
      }),
    )

    // Server echoes back the persisted message.
    act(() => {
      fireServer('complaint:message:new', {
        id: 'msg-server-1',
        complaintId: COMPLAINT_ID,
        sender: 'ADMIN',
        senderId: SELF_ADMIN_ID,
        messageType: 'TEXT',
        content: 'hello there',
        imageUrl: null,
        status: 'SENT',
        createdAt: new Date().toISOString(),
      })
    })

    const afterEcho = getDetail()!
    expect(afterEcho.messages).toHaveLength(1)
    expect(afterEcho.messages[0]?.id).toBe('msg-server-1')
    expect(afterEcho.messages[0]?.isMe).toBe(true)
  })

  it('appends incoming messages from the complainant without dedup', () => {
    queryClient.setQueryData(complaintKeys.detail(COMPLAINT_ID), seedDetail())

    renderHook(() =>
      useComplaintChat(COMPLAINT_ID, {
        enabled: true,
        selfAdminId: SELF_ADMIN_ID,
        complainantName: 'Sara',
      }),
    )

    act(() => {
      fireServer('complaint:message:new', {
        id: 'msg-from-user',
        complaintId: COMPLAINT_ID,
        sender: 'USER',
        senderId: 'u-1',
        messageType: 'TEXT',
        content: 'I need help',
        imageUrl: null,
        status: 'SENT',
        createdAt: '2026-05-14T12:00:00.000Z',
      })
    })

    const detail = getDetail()!
    expect(detail.messages).toHaveLength(1)
    expect(detail.messages[0]?.isMe).toBe(false)
    expect(detail.messages[0]?.content).toBe('I need help')
  })

  it('ignores events targeting a different complaintId', () => {
    queryClient.setQueryData(complaintKeys.detail(COMPLAINT_ID), seedDetail())

    renderHook(() =>
      useComplaintChat(COMPLAINT_ID, {
        enabled: true,
        selfAdminId: SELF_ADMIN_ID,
        complainantName: 'Sara',
      }),
    )

    act(() => {
      fireServer('complaint:message:new', {
        id: 'noise',
        complaintId: 'OTHER_COMPLAINT',
        sender: 'USER',
        senderId: 'u-99',
        messageType: 'TEXT',
        content: 'not for us',
        imageUrl: null,
        status: 'SENT',
        createdAt: '2026-05-14T12:00:00.000Z',
      })
    })

    expect(getDetail()!.messages).toHaveLength(0)
  })

  it('updates the complaint status on complaint:status:updated', () => {
    queryClient.setQueryData(
      complaintKeys.detail(COMPLAINT_ID),
      seedDetail({ status: 'UNDER_REVIEW' }),
    )

    renderHook(() =>
      useComplaintChat(COMPLAINT_ID, {
        enabled: true,
        selfAdminId: SELF_ADMIN_ID,
        complainantName: 'Sara',
      }),
    )

    act(() => {
      fireServer('complaint:status:updated', {
        complaintId: COMPLAINT_ID,
        status: 'in_progress',
      })
    })

    expect(getDetail()!.status).toBe('IN_PROGRESS')
  })

  it('emits complaint:message:read only when unread messages exist, and only once until a new inbound arrives', () => {
    queryClient.setQueryData(
      complaintKeys.detail(COMPLAINT_ID),
      seedDetail({
        messages: [
          {
            id: 'm1',
            sender: 'USER',
            senderId: 'u-1',
            messageType: 'TEXT',
            content: 'hi',
            imageUrl: null,
            status: 'DELIVERED',
            deliveredAt: null,
            readAt: null,
            isMe: false,
            createdAt: '2026-05-14T12:00:00.000Z',
          },
        ],
      }),
    )

    const { result } = renderHook(() =>
      useComplaintChat(COMPLAINT_ID, {
        enabled: true,
        selfAdminId: SELF_ADMIN_ID,
        complainantName: 'Sara',
      }),
    )

    act(() => {
      result.current.markRead()
    })
    const readCalls = fakeSocket.emit.mock.calls.filter(
      ([name]) => name === 'complaint:message:read',
    )
    expect(readCalls).toHaveLength(1)

    // Second call should no-op (already marked-read this session).
    act(() => {
      result.current.markRead()
    })
    expect(
      fakeSocket.emit.mock.calls.filter(
        ([name]) => name === 'complaint:message:read',
      ),
    ).toHaveLength(1)

    // A new inbound message re-arms the guard.
    act(() => {
      fireServer('complaint:message:new', {
        id: 'm2',
        complaintId: COMPLAINT_ID,
        sender: 'USER',
        senderId: 'u-1',
        messageType: 'TEXT',
        content: 'still there?',
        imageUrl: null,
        status: 'SENT',
        createdAt: '2026-05-14T12:05:00.000Z',
      })
    })

    act(() => {
      result.current.markRead()
    })
    expect(
      fakeSocket.emit.mock.calls.filter(
        ([name]) => name === 'complaint:message:read',
      ),
    ).toHaveLength(2)
  })

  it('does not emit complaint:message:read when there is nothing unread', () => {
    queryClient.setQueryData(
      complaintKeys.detail(COMPLAINT_ID),
      seedDetail({
        messages: [
          {
            id: 'm1',
            sender: 'USER',
            senderId: 'u-1',
            messageType: 'TEXT',
            content: 'hi',
            imageUrl: null,
            status: 'READ',
            deliveredAt: null,
            readAt: null,
            isMe: false,
            createdAt: '2026-05-14T12:00:00.000Z',
          },
        ],
      }),
    )

    const { result } = renderHook(() =>
      useComplaintChat(COMPLAINT_ID, {
        enabled: true,
        selfAdminId: SELF_ADMIN_ID,
        complainantName: 'Sara',
      }),
    )

    act(() => {
      result.current.markRead()
    })
    expect(
      fakeSocket.emit.mock.calls.filter(
        ([name]) => name === 'complaint:message:read',
      ),
    ).toHaveLength(0)
  })
})
