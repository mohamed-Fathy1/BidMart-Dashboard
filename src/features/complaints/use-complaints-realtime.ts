import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { getComplaintSocket } from '@/features/complaints/complaint-socket'
import { complaintKeys } from '@/features/complaints/complaints.queries'

interface ComplaintRealtimePayload {
  id: string
  source: string
  lastMessageAt: string
  lastMessagePreview: string
  unreadCount?: number
  sender?: string
  senderId?: string
  isMe?: boolean
}

/**
 * Global hook that listens for admin-level complaint socket events and:
 *  - Invalidates the complaints list + the specific detail on `conversation:updated`
 *  - Invalidates the complaints list on `complaint:updated`
 *  - Shows a toast notification with the preview and a "View" action for both
 *  - Suppresses the toast when `payload.isMe` is true (current admin triggered it)
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

  useEffect(() => {
    if (!canView) return
    const socket = getComplaintSocket()
    if (!socket) return

    function handleConversationUpdated(payload: ComplaintRealtimePayload) {
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(payload.id) })
      if (payload.isMe) return
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
      if (payload.isMe) return
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

    socket.on('conversation:updated', handleConversationUpdated)
    socket.on('complaint:updated', handleComplaintUpdated)

    return () => {
      socket.off('conversation:updated', handleConversationUpdated)
      socket.off('complaint:updated', handleComplaintUpdated)
    }
  }, [canView, queryClient, navigate])
}
