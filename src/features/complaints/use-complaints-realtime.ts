import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useAuthStore } from '@/features/auth/auth.store'
import { getComplaintSocket } from '@/features/complaints/complaint-socket'
import { complaintKeys } from '@/features/complaints/complaints.queries'

interface ComplaintRealtimePayload {
  id: string
  source: string
  lastMessageAt: string
  lastMessagePreview: string
  unreadCount: number
}

interface MessageNewPayload {
  complaintId: string
  senderId: string
}

/**
 * Global hook that listens for admin-level complaint socket events and:
 *  - Invalidates the complaints list + the specific detail on `conversation:updated`
 *  - Invalidates the complaints list on `complaint:updated`
 *  - Shows a toast notification with the preview and a "View" action for both
 *
 * Self-send suppression: `conversation:updated` has no senderId, so we intercept
 * the room-level `complaint:message:new` event (which does carry senderId) to
 * detect self-sends. When we see our own message arrive, we add the complaintId
 * to `selfSentRef` for a 5 s window. Any `conversation:updated` that arrives for
 * that complaint within the window is cache-invalidated but not toasted.
 *
 * Mount once at the authed layout level so any admin receives notifications
 * regardless of which page they're currently on.
 */
export function useComplaintsRealtime() {
  const canView = usePermission(PERMISSIONS.complaints.view)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  // Stable ref so listeners always read the latest locale without re-binding.
  const tRef = useRef(t)
  tRef.current = t
  // Tracks complaint IDs where the current admin recently sent a message.
  const selfSentRef = useRef(new Set<string>())

  useEffect(() => {
    if (!canView) return
    const socket = getComplaintSocket()
    if (!socket) return

    // complaint:message:new is room-scoped — only received when the admin is on
    // the detail page. We use it purely to detect self-sends and suppress the
    // corresponding conversation:updated toast.
    function handleMessageNew(msg: MessageNewPayload) {
      const myId = useAuthStore.getState().user?.id
      if (myId && msg.senderId === myId) {
        selfSentRef.current.add(msg.complaintId)
        setTimeout(() => selfSentRef.current.delete(msg.complaintId), 5000)
      }
    }

    function handleConversationUpdated(payload: ComplaintRealtimePayload) {
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(payload.id) })
      if (selfSentRef.current.has(payload.id)) return
      toast(tRef.current('complaints:realtime.new_message_title'), {
        description: payload.lastMessagePreview,
        action: {
          label: tRef.current('complaints:realtime.view'),
          onClick: () =>
            void navigate({
              to: '/complaints/$complaintId',
              params: { complaintId: payload.id },
            }),
        },
      })
    }

    function handleComplaintUpdated(payload: ComplaintRealtimePayload) {
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
      if (selfSentRef.current.has(payload.id)) return
      toast.info(tRef.current('complaints:realtime.complaint_updated'), {
        action: {
          label: tRef.current('complaints:realtime.view'),
          onClick: () =>
            void navigate({
              to: '/complaints/$complaintId',
              params: { complaintId: payload.id },
            }),
        },
      })
    }

    socket.on('complaint:message:new', handleMessageNew)
    socket.on('conversation:updated', handleConversationUpdated)
    socket.on('complaint:updated', handleComplaintUpdated)

    return () => {
      socket.off('complaint:message:new', handleMessageNew)
      socket.off('conversation:updated', handleConversationUpdated)
      socket.off('complaint:updated', handleComplaintUpdated)
    }
  }, [canView, queryClient, navigate])
}
