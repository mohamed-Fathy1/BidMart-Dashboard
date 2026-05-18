import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/features/auth/auth.store'
import type {
  ComplaintDetail,
  ComplaintMessageAdmin,
  ComplaintMessageStatus,
  ComplaintStatus,
} from '@/types/api'
import { complaintKeys } from '@/features/complaints/complaints.queries'
import {
  getComplaintSocket,
  subscribeComplaintSocketStatus,
  type ComplaintSocketStatus,
} from '@/features/complaints/complaint-socket'

interface UseComplaintChatOptions {
  enabled: boolean
  selfAdminId: string | undefined
  complainantName: string | null
}

interface SendPayload {
  text?: string
  fileUrl?: string
}

interface IncomingMessage {
  id: string
  complaintId: string
  sender: 'USER' | 'ADMIN'
  senderId: string
  messageType: 'TEXT' | 'MEDIA'
  content: string | null
  fileUrl: string | null
  status: ComplaintMessageStatus
  createdAt: string
}

interface MessageStatusPayload {
  messageId: string
  status: ComplaintMessageStatus
  deliveredAt?: string
  readAt?: string
}

interface MessagesReadPayload {
  complaintId: string
  messageIds: string[]
  readAt: string
}

interface ForceLogoutPayload {
  reason: 'TOKEN_REVOKED' | 'USER_BLOCKED' | string
}

interface SocketErrorPayload {
  message: string
}

interface TypingPayload {
  actorId: string
  actorType: 'admin' | 'user'
}

/**
 * Tie a complaint detail page to the live `/complaint-chat` socket. Owns the
 * cache writes (via the global `queryClient`), typing state, optimistic send
 * reconciliation, and mark-read lifecycle.
 */
export function useComplaintChat(
  complaintId: string,
  { enabled, selfAdminId, complainantName }: UseComplaintChatOptions,
) {
  const { t } = useTranslation()
  const [connectionStatus, setConnectionStatus] =
    useState<ComplaintSocketStatus>('idle')
  const [typingActorIds, setTypingActorIds] = useState<string[]>([])
  const [lastError, setLastError] = useState<{ code: string } | null>(null)

  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const lastInvalidateRef = useRef(0)
  const lastSentRef = useRef<
    Array<{ id: string; content: string | null; fileUrl: string | null; createdAt: number }>
  >([])
  const markReadSentRef = useRef(false)
  // Stable ref so listeners can read the latest `t` without re-binding on every render.
  const tRef = useRef(t)
  tRef.current = t

  // Subscribe to status changes from the singleton.
  useEffect(() => {
    if (!enabled) return
    return subscribeComplaintSocketStatus(setConnectionStatus)
  }, [enabled])

  // Wire the per-mount listeners.
  useEffect(() => {
    if (!enabled) return
    const socket = getComplaintSocket()
    if (!socket) return

    /* ----- helpers scoped to this mount ----- */
    function invalidateListsDebounced() {
      const now = Date.now()
      if (now - lastInvalidateRef.current < 500) return
      lastInvalidateRef.current = now
      queryClient.invalidateQueries({
        queryKey: complaintKeys.lists(),
      })
    }

    function patchDetail(mutator: (prev: ComplaintDetail) => ComplaintDetail) {
      queryClient.setQueryData<ComplaintDetail>(
        complaintKeys.detail(complaintId),
        (prev) => (prev ? mutator(prev) : prev),
      )
    }

    /* ----- handlers ----- */
    function handleMessageNew(data: IncomingMessage) {
      if (data.complaintId !== complaintId) {
        invalidateListsDebounced()
        return
      }
      const isMine = !!selfAdminId && data.senderId === selfAdminId
      const incomingTs = Date.parse(data.createdAt)
      patchDetail((prev) => {
        const messages = prev.messages.slice()
        if (isMine) {
          // Reconcile against an optimistic tmp message by content + window.
          const idx = messages.findIndex((m) => {
            if (!m.id.startsWith('tmp-')) return false
            if (m.content !== data.content) return false
            if ((m.fileUrl ?? null) !== (data.fileUrl ?? null)) return false
            return Math.abs(Date.parse(m.createdAt) - incomingTs) <= 5_000
          })
          const merged: ComplaintMessageAdmin = {
            id: data.id,
            sender: data.sender,
            senderId: data.senderId,
            messageType: data.messageType,
            content: data.content,
            fileUrl: data.fileUrl,
            status: data.status,
            deliveredAt: null,
            readAt: null,
            isMe: true,
            createdAt: data.createdAt,
          }
          if (idx >= 0) {
            messages[idx] = merged
          } else {
            messages.push(merged)
          }
          // Drop matched id from local pending log.
          lastSentRef.current = lastSentRef.current.filter(
            (p) =>
              !(
                p.content === data.content &&
                Math.abs(p.createdAt - incomingTs) <= 5_000
              ),
          )
        } else {
          messages.push({
            id: data.id,
            sender: data.sender,
            senderId: data.senderId,
            messageType: data.messageType,
            content: data.content,
            fileUrl: data.fileUrl,
            status: data.status,
            deliveredAt: null,
            readAt: null,
            isMe: false,
            createdAt: data.createdAt,
          })
          // A new inbound message means there are unread items again — re-arm
          // the mark-read guard so the next visible-render emits.
          markReadSentRef.current = false
        }
        return { ...prev, messages }
      })
      invalidateListsDebounced()
    }

    function handleStatusUpdated(data: { complaintId: string; status: string }) {
      if (data.complaintId !== complaintId) {
        invalidateListsDebounced()
        return
      }
      patchDetail((prev) => ({
        ...prev,
        status: data.status.toUpperCase() as ComplaintStatus,
      }))
      invalidateListsDebounced()
    }

    function handleClosed(data: { complaintId: string; status: string }) {
      if (data.complaintId !== complaintId) {
        invalidateListsDebounced()
        return
      }
      patchDetail((prev) => ({
        ...prev,
        status: data.status.toUpperCase() as ComplaintStatus,
        conversation_closed: true,
      }))
      // Refetch detail to pick up resolution_note / resolved_at / resolved_by.
      queryClient.invalidateQueries({
        queryKey: complaintKeys.detail(complaintId),
      })
      invalidateListsDebounced()
    }

    function handleConversationClosed(data: { complaintId: string }) {
      if (data.complaintId !== complaintId) return
      patchDetail((prev) => ({ ...prev, conversation_closed: true }))
    }

    function handleTypingStart(data: TypingPayload) {
      if (!data.actorId) return
      setTypingActorIds((prev) =>
        prev.includes(data.actorId) ? prev : [...prev, data.actorId],
      )
    }

    function handleTypingStop(data: TypingPayload) {
      if (!data.actorId) return
      setTypingActorIds((prev) => prev.filter((id) => id !== data.actorId))
    }

    function handleMessageStatus(data: MessageStatusPayload) {
      patchDetail((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === data.messageId
            ? {
                ...m,
                status: data.status,
                deliveredAt: data.deliveredAt ?? m.deliveredAt,
                readAt: data.readAt ?? m.readAt,
              }
            : m,
        ),
      }))
    }

    function handleMessagesRead(data: MessagesReadPayload) {
      if (data.complaintId !== complaintId) return
      patchDetail((prev) => {
        const ids = new Set(data.messageIds)
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            ids.has(m.id) ? { ...m, status: 'READ', readAt: data.readAt } : m,
          ),
        }
      })
    }

    function handleForceLogout(data: ForceLogoutPayload) {
      const reasonKey = `complaints:force_logout.${data.reason}`
      const translate = tRef.current
      toast.error(translate(reasonKey, { defaultValue: translate('common:errors.unexpected') }))
      useAuthStore.getState().clearSession()
      window.location.href = '/login'
    }

    function handleError(data: SocketErrorPayload) {
      const code = data?.message ?? 'UNKNOWN'
      setLastError({ code })
      if (code === 'COMPLAINT_CHAT_NOT_OPEN') return // informational only
      const messageKey = `complaints:socket_errors.${code}`
      const translate = tRef.current
      toast.error(
        translate(messageKey, { defaultValue: translate('common:errors.unexpected') }),
        { id: `complaints-socket-${code}` },
      )
    }

    /* ----- attach ----- */
    socket.on('complaint:message:new', handleMessageNew)
    socket.on('complaint:status:updated', handleStatusUpdated)
    socket.on('complaint:closed', handleClosed)
    socket.on('complaint:conversation:closed', handleConversationClosed)
    socket.on('complaint:typing:start', handleTypingStart)
    socket.on('complaint:typing:stop', handleTypingStop)
    socket.on('complaint:message:status', handleMessageStatus)
    socket.on('complaint:messages:read', handleMessagesRead)
    socket.on('force:logout', handleForceLogout)
    socket.on('error', handleError)

    return () => {
      socket.off('complaint:message:new', handleMessageNew)
      socket.off('complaint:status:updated', handleStatusUpdated)
      socket.off('complaint:closed', handleClosed)
      socket.off('complaint:conversation:closed', handleConversationClosed)
      socket.off('complaint:typing:start', handleTypingStart)
      socket.off('complaint:typing:stop', handleTypingStop)
      socket.off('complaint:message:status', handleMessageStatus)
      socket.off('complaint:messages:read', handleMessagesRead)
      socket.off('force:logout', handleForceLogout)
      socket.off('error', handleError)
      setTypingActorIds([])
    }
  }, [enabled, complaintId, selfAdminId])

  /* ----- outgoing actions ----- */

  const send = useCallback(
    async ({ text, fileUrl }: SendPayload) => {
      const socket = getComplaintSocket()
      if (!socket) return
      if (!text && !fileUrl) return
      const trimmed = text?.trim()
      const tmpId = `tmp-${crypto.randomUUID()}`
      const createdAt = new Date().toISOString()
      const messageType: 'TEXT' | 'MEDIA' = fileUrl ? 'MEDIA' : 'TEXT'
      const optimistic: ComplaintMessageAdmin = {
        id: tmpId,
        sender: 'ADMIN',
        senderId: selfAdminId ?? 'me',
        messageType,
        content: trimmed && trimmed.length > 0 ? trimmed : null,
        fileUrl: fileUrl ?? null,
        status: 'SENT',
        deliveredAt: null,
        readAt: null,
        isMe: true,
        createdAt,
      }
      // Insert optimistic bubble.
      queryClient.setQueryData<ComplaintDetail>(
        complaintKeys.detail(complaintId),
        (prev) =>
          prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev,
      )
      lastSentRef.current.push({
        id: tmpId,
        content: optimistic.content,
        fileUrl: optimistic.fileUrl,
        createdAt: Date.parse(createdAt),
      })
      // Emit. Server echoes via complaint:message:new which reconciles.
      socket.emit('complaint:message:send', {
        complaintId,
        messageType,
        ...(trimmed && trimmed.length > 0 ? { message: trimmed } : {}),
        ...(fileUrl ? { fileUrl } : {}),
      })
      // Always stop typing on send.
      if (isTypingRef.current) {
        socket.emit('complaint:typing:stop', { complaintId })
        isTypingRef.current = false
      }
    },
    [complaintId, selfAdminId],
  )

  const markRead = useCallback(() => {
    const socket = getComplaintSocket()
    if (!socket) return
    if (markReadSentRef.current) return
    const detail = queryClient.getQueryData<ComplaintDetail>(
      complaintKeys.detail(complaintId),
    )
    if (!detail) return
    const hasUnread = detail.messages.some((m) => !m.isMe && m.status !== 'READ')
    if (!hasUnread) return
    socket.emit('complaint:message:read', { complaintId })
    markReadSentRef.current = true
  }, [complaintId])

  const setTyping = useCallback(
    (active: boolean) => {
      const socket = getComplaintSocket()
      if (!socket) return
      if (active && !isTypingRef.current) {
        socket.emit('complaint:typing:start', { complaintId })
        isTypingRef.current = true
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current)
      }
      if (active) {
        typingDebounceRef.current = setTimeout(() => {
          if (isTypingRef.current) {
            socket.emit('complaint:typing:stop', { complaintId })
            isTypingRef.current = false
          }
        }, 3_000)
      } else if (isTypingRef.current) {
        socket.emit('complaint:typing:stop', { complaintId })
        isTypingRef.current = false
      }
    },
    [complaintId],
  )

  // Auto mark-read when window regains focus.
  useEffect(() => {
    if (!enabled) return
    function onVisible() {
      if (document.visibilityState === 'visible') markRead()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [enabled, markRead])

  // The typing label is one string ("Sara is typing…") — only one peer at a
  // time in support chat. Pull from the prop for the display.
  const typingLabel =
    typingActorIds.length > 0 && complainantName
      ? complainantName
      : typingActorIds.length > 0
        ? null
        : null

  return {
    connectionStatus,
    typingActorIds,
    typingLabel,
    lastError,
    send,
    markRead,
    setTyping,
  }
}
