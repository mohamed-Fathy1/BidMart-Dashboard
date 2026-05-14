import { describe, expect, it } from 'vitest'
import type { ComplaintMessageAdmin } from '@/types/api'
import { groupByDate } from './complaint-chat-thread'

function makeMessage(id: string, iso: string): ComplaintMessageAdmin {
  return {
    id,
    sender: 'USER',
    senderId: 'u-1',
    messageType: 'TEXT',
    content: id,
    imageUrl: null,
    status: 'SENT',
    deliveredAt: null,
    readAt: null,
    isMe: false,
    createdAt: iso,
  }
}

describe('groupByDate', () => {
  it('returns an empty list when there are no messages', () => {
    expect(groupByDate([])).toEqual([])
  })

  it('groups consecutive same-date messages together', () => {
    const groups = groupByDate([
      makeMessage('a', '2026-05-12T08:00:00.000Z'),
      makeMessage('b', '2026-05-12T09:00:00.000Z'),
      makeMessage('c', '2026-05-13T10:00:00.000Z'),
    ])
    expect(groups).toHaveLength(2)
    expect(groups[0]).toMatchObject({ date: '2026-05-12' })
    expect(groups[0]?.messages.map((m) => m.id)).toEqual(['a', 'b'])
    expect(groups[1]).toMatchObject({ date: '2026-05-13' })
    expect(groups[1]?.messages.map((m) => m.id)).toEqual(['c'])
  })

  it('preserves message order within each date group', () => {
    const groups = groupByDate([
      makeMessage('a', '2026-05-12T08:00:00.000Z'),
      makeMessage('b', '2026-05-12T07:00:00.000Z'),
      makeMessage('c', '2026-05-12T09:00:00.000Z'),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0]?.messages.map((m) => m.id)).toEqual(['a', 'b', 'c'])
  })

  it('starts a new group when the date flips back to a prior day', () => {
    // Defensive: server may reorder; helper should not collapse non-adjacent groups.
    const groups = groupByDate([
      makeMessage('a', '2026-05-12T08:00:00.000Z'),
      makeMessage('b', '2026-05-13T08:00:00.000Z'),
      makeMessage('c', '2026-05-12T08:30:00.000Z'),
    ])
    expect(groups.map((g) => g.date)).toEqual([
      '2026-05-12',
      '2026-05-13',
      '2026-05-12',
    ])
  })
})
