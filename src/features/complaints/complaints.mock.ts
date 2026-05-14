/* eslint-disable */
// Dev-only seed data for the complaints UI. Remove once the backend endpoints
// are reachable in every environment.

import type {
  ComplaintDetail,
  ComplaintNoteItem,
  ComplaintSummary,
  ComplaintTypeRef,
  ComplaintTypeOption,
} from '@/types/api'

const TYPE_WRONG_ITEM: ComplaintTypeRef = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name_en: 'Wrong Item Received',
  name_ar: 'استلام منتج خاطئ',
}

const TYPE_SHIPPING: ComplaintTypeRef = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  name_en: 'Delayed Shipment',
  name_ar: 'تأخّر الشحن',
}

const TYPE_UNRESPONSIVE: ComplaintTypeRef = {
  id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  name_en: 'Seller Unresponsive',
  name_ar: 'البائع لا يرد',
}

const TYPE_PAYMENT: ComplaintTypeRef = {
  id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
  name_en: 'Payment Issue',
  name_ar: 'مشكلة في الدفع',
}

export const MOCK_COMPLAINT_TYPE_REFS: ComplaintTypeRef[] = [
  TYPE_WRONG_ITEM,
  TYPE_SHIPPING,
  TYPE_UNRESPONSIVE,
  TYPE_PAYMENT,
]

export function MOCK_COMPLAINT_TYPES(lang: string): ComplaintTypeOption[] {
  return MOCK_COMPLAINT_TYPE_REFS.map((type) => ({
    id: type.id,
    name: lang === 'ar' ? type.name_ar : type.name_en,
  }))
}

export const MOCK_COMPLAINT_SUMMARIES: ComplaintSummary[] = [
  {
    id: 'aaaa1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-1', full_name: 'Omar Al-Rashidi' },
    complaint_type: TYPE_WRONG_ITEM,
    status: 'UNDER_REVIEW',
    description_preview:
      "I received the wrong item. Order #12345 was supposed to be a blue shirt but I received a red one.",
    adminUnreadCount: 0,
    lastMessage: null,
    created_at: '2026-05-12T09:14:00.000Z',
  },
  {
    id: 'bbbb1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-2', full_name: 'Sara Al-Otaibi' },
    complaint_type: TYPE_SHIPPING,
    status: 'IN_PROGRESS',
    description_preview:
      'My order has been stuck in transit for 14 days. The seller is not responding to my messages.',
    adminUnreadCount: 2,
    lastMessage: {
      content: 'I still have not received my order.',
      messageType: 'TEXT',
      createdAt: '2026-05-13T08:21:00.000Z',
      isRead: false,
    },
    created_at: '2026-04-28T11:42:00.000Z',
  },
  {
    id: 'cccc1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-3', full_name: 'Khalid Al-Mansour' },
    complaint_type: TYPE_UNRESPONSIVE,
    status: 'RESOLVED',
    description_preview:
      'Seller never confirmed my order despite multiple attempts to contact them over the past week.',
    adminUnreadCount: 0,
    lastMessage: {
      content: "We've reached out to the seller and the order is being shipped today.",
      messageType: 'TEXT',
      createdAt: '2026-05-09T15:03:00.000Z',
      isRead: true,
    },
    created_at: '2026-05-02T14:30:00.000Z',
  },
  {
    id: 'dddd1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-4', full_name: 'Layla Al-Harbi' },
    complaint_type: TYPE_PAYMENT,
    status: 'REJECTED',
    description_preview:
      'Charged twice for the same order. Want a refund for the duplicate transaction.',
    adminUnreadCount: 0,
    lastMessage: {
      content: 'We confirmed only one charge with the payment provider.',
      messageType: 'TEXT',
      createdAt: '2026-05-04T10:11:00.000Z',
      isRead: true,
    },
    created_at: '2026-04-30T09:55:00.000Z',
  },
]

export const MOCK_COMPLAINT_DETAILS: Record<string, ComplaintDetail> = {
  'aaaa1111-2222-3333-4444-555566667777': {
    id: 'aaaa1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-1', full_name: 'Omar Al-Rashidi', phone_number: '+966500000001' },
    complaint_type: TYPE_WRONG_ITEM,
    status: 'UNDER_REVIEW',
    description:
      "I received the wrong item. Order #12345 was supposed to be a blue shirt but I received a red one. Please send the correct item or refund the order.",
    attachment_urls: [],
    notes: [],
    activities: [],
    resolution_note: null,
    resolved_by: null,
    resolved_at: null,
    conversation_closed: false,
    messages: [],
    created_at: '2026-05-12T09:14:00.000Z',
    updated_at: '2026-05-12T09:14:00.000Z',
  },
  'bbbb1111-2222-3333-4444-555566667777': {
    id: 'bbbb1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-2', full_name: 'Sara Al-Otaibi', phone_number: '+966500000002' },
    complaint_type: TYPE_SHIPPING,
    status: 'IN_PROGRESS',
    description:
      'My order has been stuck in transit for 14 days. The seller is not responding to my messages. The tracking page has not updated since the initial pickup scan.',
    attachment_urls: [],
    notes: [],
    activities: [
      {
        id: 'act-1',
        actor_type: 'admin',
        actor_id: 'mock-admin-id',
        action: 'started_investigation',
        metadata: null,
        created_at: '2026-04-29T08:00:00.000Z',
      },
    ],
    resolution_note: null,
    resolved_by: null,
    resolved_at: null,
    conversation_closed: false,
    messages: [
      {
        id: 'msg-1',
        sender: 'USER',
        senderId: 'u-2',
        messageType: 'TEXT',
        content: 'Any update on my order? It has been more than two weeks now.',
        imageUrl: null,
        status: 'READ',
        deliveredAt: '2026-05-12T08:01:00.000Z',
        readAt: '2026-05-12T08:05:00.000Z',
        isMe: false,
        createdAt: '2026-05-12T08:00:00.000Z',
      },
      {
        id: 'msg-2',
        sender: 'ADMIN',
        senderId: 'mock-admin-id',
        messageType: 'TEXT',
        content:
          "Thank you for reaching out. We are following up with the courier and will respond within 24 hours.",
        imageUrl: null,
        status: 'READ',
        deliveredAt: '2026-05-12T08:11:00.000Z',
        readAt: '2026-05-12T08:12:00.000Z',
        isMe: true,
        createdAt: '2026-05-12T08:10:00.000Z',
      },
      {
        id: 'msg-3',
        sender: 'USER',
        senderId: 'u-2',
        messageType: 'TEXT',
        content: 'I still have not received my order.',
        imageUrl: null,
        status: 'DELIVERED',
        deliveredAt: '2026-05-13T08:21:05.000Z',
        readAt: null,
        isMe: false,
        createdAt: '2026-05-13T08:21:00.000Z',
      },
    ],
    created_at: '2026-04-28T11:42:00.000Z',
    updated_at: '2026-05-13T08:21:00.000Z',
  },
  'cccc1111-2222-3333-4444-555566667777': {
    id: 'cccc1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-3', full_name: 'Khalid Al-Mansour', phone_number: '+966500000003' },
    complaint_type: TYPE_UNRESPONSIVE,
    status: 'RESOLVED',
    description:
      'Seller never confirmed my order despite multiple attempts to contact them over the past week.',
    attachment_urls: [],
    notes: [],
    activities: [
      {
        id: 'act-3a',
        actor_type: 'admin',
        actor_id: 'mock-admin-id',
        action: 'started_investigation',
        metadata: null,
        created_at: '2026-05-03T10:00:00.000Z',
      },
      {
        id: 'act-3b',
        actor_type: 'admin',
        actor_id: 'mock-admin-id',
        action: 'resolved',
        metadata: { note: 'Seller confirmed and is shipping.' },
        created_at: '2026-05-09T15:03:00.000Z',
      },
    ],
    resolution_note: 'We have contacted the seller and your order is being shipped today.',
    resolved_by: 'mock-admin-id',
    resolved_at: '2026-05-09T15:03:00.000Z',
    conversation_closed: true,
    messages: [
      {
        id: 'msg-3-1',
        sender: 'USER',
        senderId: 'u-3',
        messageType: 'TEXT',
        content: 'The seller has not confirmed my order.',
        imageUrl: null,
        status: 'READ',
        deliveredAt: '2026-05-03T11:00:00.000Z',
        readAt: '2026-05-03T11:01:00.000Z',
        isMe: false,
        createdAt: '2026-05-03T11:00:00.000Z',
      },
      {
        id: 'msg-3-2',
        sender: 'ADMIN',
        senderId: 'mock-admin-id',
        messageType: 'TEXT',
        content: "We've reached out to the seller and the order is being shipped today.",
        imageUrl: null,
        status: 'READ',
        deliveredAt: '2026-05-09T15:03:00.000Z',
        readAt: '2026-05-09T15:04:00.000Z',
        isMe: true,
        createdAt: '2026-05-09T15:03:00.000Z',
      },
    ],
    created_at: '2026-05-02T14:30:00.000Z',
    updated_at: '2026-05-09T15:03:00.000Z',
  },
  'dddd1111-2222-3333-4444-555566667777': {
    id: 'dddd1111-2222-3333-4444-555566667777',
    submitter: { id: 'u-4', full_name: 'Layla Al-Harbi', phone_number: '+966500000004' },
    complaint_type: TYPE_PAYMENT,
    status: 'REJECTED',
    description:
      'Charged twice for the same order. Want a refund for the duplicate transaction.',
    attachment_urls: [],
    notes: [],
    activities: [
      {
        id: 'act-4',
        actor_type: 'admin',
        actor_id: 'mock-admin-id',
        action: 'rejected',
        metadata: { note: 'Only one charge confirmed with the payment provider.' },
        created_at: '2026-05-04T10:11:00.000Z',
      },
    ],
    resolution_note: 'We confirmed only one charge with the payment provider. No duplicate exists.',
    resolved_by: 'mock-admin-id',
    resolved_at: '2026-05-04T10:11:00.000Z',
    conversation_closed: true,
    messages: [],
    created_at: '2026-04-30T09:55:00.000Z',
    updated_at: '2026-05-04T10:11:00.000Z',
  },
}

export const MOCK_COMPLAINT_NOTES: Record<string, ComplaintNoteItem[]> = {
  'bbbb1111-2222-3333-4444-555566667777': [
    {
      id: 'note-1',
      adminName: 'Operations',
      note: 'Confirmed courier delay across the region. Coordinating with the seller for a reship.',
      createdAt: '2026-05-12T09:00:00.000Z',
    },
  ],
}

export function cloneComplaintDetail(detail: ComplaintDetail): ComplaintDetail {
  return JSON.parse(JSON.stringify(detail)) as ComplaintDetail
}
