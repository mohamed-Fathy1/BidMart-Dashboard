import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  ArrowLeftIcon,
  Bell,
  CheckCircle2,
  MessageSquareOff,
  PlayCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import {
  useCloseConversationMutation,
  useComplaintDetailQuery,
  useComplaintNotesQuery,
  useRejectComplaintMutation,
  useResolveComplaintMutation,
  useSendComplaintNotificationMutation,
  useStartInvestigationMutation,
} from '@/features/complaints/complaints.queries'
import { ComplaintActivityTimeline } from '@/features/complaints/complaint-activity-timeline'
import { ComplaintChatThread } from '@/features/complaints/complaint-chat-thread'
import { ComplaintHeroCard } from '@/features/complaints/complaint-hero-card'
import { ComplaintInfoCard } from '@/features/complaints/complaint-info-card'
import { ComplaintNotesPanel } from '@/features/complaints/complaint-notes-panel'
import { useComplaintChat } from '@/features/complaints/use-complaint-chat'
import { useAuthStore } from '@/features/auth/auth.store'

interface ComplaintDetailPageProps {
  complaintId: string
}

const RESOLUTION_MAX = 1000
const NOTIFICATION_MAX = 500

export function ComplaintDetailPage({ complaintId }: ComplaintDetailPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: complaint, isLoading, isError } = useComplaintDetailQuery(complaintId)
  const { data: notes } = useComplaintNotesQuery(complaintId)
  const selfAdminId = useAuthStore((s) => s.user?.id)

  const chat = useComplaintChat(complaintId, {
    enabled: !!complaint,
    selfAdminId,
    complainantName: complaint?.submitter.full_name ?? null,
  })

  const startMutation = useStartInvestigationMutation()
  const resolveMutation = useResolveComplaintMutation()
  const rejectMutation = useRejectComplaintMutation()
  const closeMutation = useCloseConversationMutation()
  const notifyMutation = useSendComplaintNotificationMutation()

  const [startOpen, setStartOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)

  const [resolveNote, setResolveNote] = useState('')
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)
  const [notifyMessage, setNotifyMessage] = useState('')
  const [notifyError, setNotifyError] = useState<string | null>(null)

  const resolveFieldId = useId()
  const rejectFieldId = useId()
  const notifyFieldId = useId()

  const backLink = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate({ to: '/complaints' })}
      className="-ms-2 h-7 px-2 text-xs text-muted-foreground"
    >
      <ArrowLeftIcon className="size-3.5 rtl:rotate-180" />
      {t('complaints:actions.back_to_list')}
    </Button>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {backLink}
        <DetailPageSkeleton cards={2} />
      </div>
    )
  }

  if (isError || !complaint) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted">
              <AlertCircle className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground">
              {t('complaints:errors.detail_load_failed')}
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/complaints' })}>
              {t('complaints:actions.back_to_list')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isTerminal = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED'
  const notesCount = notes?.length ?? 0
  const activityCount = complaint.activities.length

  const showStart = complaint.status === 'UNDER_REVIEW'
  const showCloseConversation =
    !isTerminal && !complaint.conversation_closed && complaint.status !== 'UNDER_REVIEW'
  const showResolveReject = !isTerminal

  const actions = (
    <>
      {showStart && (
        <Can permission={PERMISSIONS.complaints.start}>
          <Button size="sm" onClick={() => setStartOpen(true)}>
            <PlayCircle className="size-4" aria-hidden />
            {t('complaints:actions.start')}
          </Button>
        </Can>
      )}
      {showResolveReject && (
        <Can permission={PERMISSIONS.complaints.resolve}>
          <Button size="sm" onClick={() => setResolveOpen(true)}>
            <CheckCircle2 className="size-4" aria-hidden />
            {t('complaints:actions.resolve')}
          </Button>
        </Can>
      )}
      {showResolveReject && (
        <Can permission={PERMISSIONS.complaints.reject}>
          <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
            <XCircle className="size-4" aria-hidden />
            {t('complaints:actions.reject')}
          </Button>
        </Can>
      )}
      {showCloseConversation && (
        <Can permission={PERMISSIONS.complaints.closeConversation}>
          <Button variant="outline" size="sm" onClick={() => setCloseOpen(true)}>
            <MessageSquareOff className="size-4" aria-hidden />
            {t('complaints:actions.close_conversation')}
          </Button>
        </Can>
      )}
      <Can permission={PERMISSIONS.complaints.sendNotification}>
        <Button variant="outline" size="sm" onClick={() => setNotifyOpen(true)}>
          <Bell className="size-4" aria-hidden />
          {t('complaints:actions.send_notification')}
        </Button>
      </Can>
    </>
  )

  function handleResolveSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = resolveNote.trim()
    if (!trimmed) {
      setResolveError(t('complaints:validation.resolution_required'))
      return
    }
    if (trimmed.length > RESOLUTION_MAX) {
      setResolveError(t('complaints:validation.resolution_too_long'))
      return
    }
    resolveMutation.mutate(
      { id: complaintId, note: trimmed },
      {
        onSuccess: () => {
          setResolveNote('')
          setResolveError(null)
          setResolveOpen(false)
        },
      },
    )
  }

  function handleRejectSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = rejectReason.trim()
    if (!trimmed) {
      setRejectError(t('complaints:validation.reason_required'))
      return
    }
    if (trimmed.length > RESOLUTION_MAX) {
      setRejectError(t('complaints:validation.reason_too_long'))
      return
    }
    rejectMutation.mutate(
      { id: complaintId, reason: trimmed },
      {
        onSuccess: () => {
          setRejectReason('')
          setRejectError(null)
          setRejectOpen(false)
        },
      },
    )
  }

  function handleNotifySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = notifyMessage.trim()
    if (!trimmed) {
      setNotifyError(t('complaints:validation.notification_required'))
      return
    }
    if (trimmed.length > NOTIFICATION_MAX) {
      setNotifyError(t('complaints:validation.notification_too_long'))
      return
    }
    notifyMutation.mutate(
      { id: complaintId, message: trimmed },
      {
        onSuccess: () => {
          setNotifyMessage('')
          setNotifyError(null)
          setNotifyOpen(false)
        },
      },
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {backLink}

      <ComplaintHeroCard complaint={complaint} actions={actions} />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <Tabs defaultValue="conversation" className="gap-3">
            <TabsList variant="line" className="border-b border-border w-full justify-start gap-4 rounded-none px-0">
              <TabsTrigger value="conversation">
                {t('complaints:tabs.conversation')}
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                {t('complaints:tabs.notes')}
                <TabBadge value={notesCount} />
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                {t('complaints:tabs.activity')}
                <TabBadge value={activityCount} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversation">
              <ComplaintChatThread
                status={complaint.status}
                messages={complaint.messages}
                conversationClosed={complaint.conversation_closed}
                complainantName={complaint.submitter.full_name}
                connectionStatus={chat.connectionStatus}
                typingActorIds={chat.typingActorIds}
                onSend={chat.send}
                onTyping={chat.setTyping}
                onMarkRead={chat.markRead}
              />
            </TabsContent>

            <TabsContent value="notes">
              <ComplaintNotesPanel
                complaintId={complaintId}
                isTerminal={isTerminal}
              />
            </TabsContent>

            <TabsContent value="activity">
              <ComplaintActivityTimeline activities={complaint.activities} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <ComplaintInfoCard complaint={complaint} />
        </aside>
      </div>

      <ConfirmDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        title={t('complaints:dialogs.start.title')}
        description={t('complaints:dialogs.start.description')}
        confirmLabel={t('complaints:dialogs.start.confirm')}
        onConfirm={() =>
          startMutation.mutate(complaintId, {
            onSettled: () => setStartOpen(false),
          })
        }
        isLoading={startMutation.isPending}
      />

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title={t('complaints:dialogs.close_conversation.title')}
        description={t('complaints:dialogs.close_conversation.description')}
        confirmLabel={t('complaints:dialogs.close_conversation.confirm')}
        variant="destructive"
        onConfirm={() =>
          closeMutation.mutate(complaintId, {
            onSettled: () => setCloseOpen(false),
          })
        }
        isLoading={closeMutation.isPending}
      />

      <FormDialog
        open={resolveOpen}
        onOpenChange={(next) => {
          if (!next) {
            setResolveNote('')
            setResolveError(null)
          }
          setResolveOpen(next)
        }}
        title={t('complaints:dialogs.resolve.title')}
        description={t('complaints:dialogs.resolve.description')}
        onSubmit={handleResolveSubmit}
        submitLabel={t('complaints:dialogs.resolve.submit')}
        isLoading={resolveMutation.isPending}
        size="md"
        suppressInitialFocus
        errorMessage={resolveError}
      >
        <div className="space-y-2">
          <label
            htmlFor={resolveFieldId}
            className="block text-xs font-medium text-muted-foreground"
          >
            {t('complaints:dialogs.resolve.note_label')}
          </label>
          <Textarea
            id={resolveFieldId}
            value={resolveNote}
            onChange={(e) => {
              setResolveNote(e.target.value)
              if (resolveError) setResolveError(null)
            }}
            placeholder={t('complaints:dialogs.resolve.note_placeholder')}
            rows={5}
            maxLength={RESOLUTION_MAX}
          />
          <p className="text-end font-mono text-[11px] tabular-nums text-muted-foreground">
            {t('complaints:dialogs.resolve.counter', { count: resolveNote.length })}
          </p>
        </div>
      </FormDialog>

      <FormDialog
        open={rejectOpen}
        onOpenChange={(next) => {
          if (!next) {
            setRejectReason('')
            setRejectError(null)
          }
          setRejectOpen(next)
        }}
        title={t('complaints:dialogs.reject.title')}
        description={t('complaints:dialogs.reject.description')}
        onSubmit={handleRejectSubmit}
        submitLabel={t('complaints:dialogs.reject.submit')}
        isLoading={rejectMutation.isPending}
        size="md"
        suppressInitialFocus
        errorMessage={rejectError}
      >
        <div className="space-y-2">
          <label
            htmlFor={rejectFieldId}
            className="block text-xs font-medium text-muted-foreground"
          >
            {t('complaints:dialogs.reject.reason_label')}
          </label>
          <Textarea
            id={rejectFieldId}
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value)
              if (rejectError) setRejectError(null)
            }}
            placeholder={t('complaints:dialogs.reject.reason_placeholder')}
            rows={5}
            maxLength={RESOLUTION_MAX}
          />
          <p className="text-end font-mono text-[11px] tabular-nums text-muted-foreground">
            {t('complaints:dialogs.reject.counter', { count: rejectReason.length })}
          </p>
        </div>
      </FormDialog>

      <FormDialog
        open={notifyOpen}
        onOpenChange={(next) => {
          if (!next) {
            setNotifyMessage('')
            setNotifyError(null)
          }
          setNotifyOpen(next)
        }}
        title={t('complaints:dialogs.notify.title')}
        description={t('complaints:dialogs.notify.description')}
        onSubmit={handleNotifySubmit}
        submitLabel={t('complaints:dialogs.notify.submit')}
        isLoading={notifyMutation.isPending}
        size="md"
        suppressInitialFocus
        errorMessage={notifyError}
      >
        <div className="space-y-2">
          <label
            htmlFor={notifyFieldId}
            className="block text-xs font-medium text-muted-foreground"
          >
            {t('complaints:dialogs.notify.message_label')}
          </label>
          <Textarea
            id={notifyFieldId}
            value={notifyMessage}
            onChange={(e) => {
              setNotifyMessage(e.target.value)
              if (notifyError) setNotifyError(null)
            }}
            placeholder={t('complaints:dialogs.notify.message_placeholder')}
            rows={4}
            maxLength={NOTIFICATION_MAX}
          />
          <p className="text-end font-mono text-[11px] tabular-nums text-muted-foreground">
            {t('complaints:dialogs.notify.counter', { count: notifyMessage.length })}
          </p>
        </div>
      </FormDialog>
    </div>
  )
}

function TabBadge({ value }: { value: number }) {
  if (value <= 0) return null
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
      {value}
    </span>
  )
}
