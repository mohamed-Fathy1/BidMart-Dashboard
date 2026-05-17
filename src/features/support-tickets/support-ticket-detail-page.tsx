import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeftIcon,
  ChevronDown,
  Copy,
  Mail,
  Phone,
} from 'lucide-react'
import type {
  SupportTicketDetail,
  SupportTicketStatus,
} from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import {
  useSupportTicketQuery,
  useUpdateSupportTicketStatusMutation,
} from '@/features/support-tickets/support-tickets.queries'

interface SupportTicketDetailPageProps {
  ticketId: string
}

const NEXT_STATES: Record<SupportTicketStatus, SupportTicketStatus[]> = {
  NEW: ['CONTACTED', 'UNDER_REVIEW'],
  CONTACTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['CONTACTED'],
}

const TRANSITION_COPY: Record<
  SupportTicketStatus,
  { titleKey: string; descriptionKey: string }
> = {
  NEW: {
    titleKey: 'supportTickets:transitions.to_new_title',
    descriptionKey: 'supportTickets:transitions.to_new_description',
  },
  CONTACTED: {
    titleKey: 'supportTickets:transitions.to_contacted_title',
    descriptionKey: 'supportTickets:transitions.to_contacted_description',
  },
  UNDER_REVIEW: {
    titleKey: 'supportTickets:transitions.to_under_review_title',
    descriptionKey: 'supportTickets:transitions.to_under_review_description',
  },
}

export function SupportTicketDetailPage({ ticketId }: SupportTicketDetailPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const canUpdate = usePermission(PERMISSIONS.contactMessages.update)

  const { data: ticket, isLoading, isError } = useSupportTicketQuery(ticketId)
  const updateMutation = useUpdateSupportTicketStatusMutation(ticketId)

  const [pendingStatus, setPendingStatus] = useState<SupportTicketStatus | null>(null)

  const backLink = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate({ to: '/support-tickets' })}
      className="-ms-2 h-7 px-2 text-xs text-muted-foreground"
    >
      <ArrowLeftIcon className="size-3.5 rtl:rotate-180" />
      {t('supportTickets:detail.back_to_list')}
    </Button>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {backLink}
        <DetailPageSkeleton cards={1} />
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted">
              <AlertCircle className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground">
              {t('supportTickets:errors.detail_load_failed')}
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/support-tickets' })}>
              {t('supportTickets:detail.back_to_list')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SupportTicketDetailContent
      ticket={ticket}
      backLink={backLink}
      canUpdate={canUpdate}
      pendingStatus={pendingStatus}
      onRequestStatus={setPendingStatus}
      onConfirmStatus={() => {
        if (!pendingStatus) return
        updateMutation.mutate(pendingStatus, {
          onSettled: () => setPendingStatus(null),
        })
      }}
      onCancelStatus={() => setPendingStatus(null)}
      isUpdating={updateMutation.isPending}
    />
  )
}

interface SupportTicketDetailContentProps {
  ticket: SupportTicketDetail
  backLink: React.ReactNode
  canUpdate: boolean
  pendingStatus: SupportTicketStatus | null
  onRequestStatus: (status: SupportTicketStatus) => void
  onConfirmStatus: () => void
  onCancelStatus: () => void
  isUpdating: boolean
}

function SupportTicketDetailContent({
  ticket,
  backLink,
  canUpdate,
  pendingStatus,
  onRequestStatus,
  onConfirmStatus,
  onCancelStatus,
  isUpdating,
}: SupportTicketDetailContentProps) {
  const { t } = useTranslation()
  const nextStates = NEXT_STATES[ticket.status] ?? []
  const history = ticket.status_history ?? []

  const description = useMemo(
    () => (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusBadge type="supportTicket" status={ticket.status} />
        <StatusBadge type="supportTicketType" status={ticket.message_type} />
        <span className="text-muted-foreground">
          {t('supportTickets:detail.submitted_at', {
            value: format.dateTime(ticket.created_at),
          })}
        </span>
      </span>
    ),
    [ticket.status, ticket.message_type, ticket.created_at, t],
  )

  const actions = canUpdate && nextStates.length > 0 ? (
    <Can permission={PERMISSIONS.contactMessages.update}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" disabled={isUpdating}>
            {t('supportTickets:actions.update_status')}
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {nextStates.map((status) => (
            <DropdownMenuItem
              key={status}
              onSelect={(e) => {
                e.preventDefault()
                onRequestStatus(status)
              }}
            >
              {t(`supportTickets:status.${status}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Can>
  ) : undefined

  const transition = pendingStatus ? TRANSITION_COPY[pendingStatus] : null

  return (
    <div className="space-y-6 pb-6">
      {backLink}

      <PageHeader
        title={t('supportTickets:detail.title', { serial: ticket.serial_number })}
        description={description}
        actions={actions}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="gap-0 rounded-xl border-border py-0">
          <CardContent className="space-y-2 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              {t('supportTickets:detail.message')}
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-foreground">
              {ticket.content}
            </p>
          </CardContent>
        </Card>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <SenderCard ticket={ticket} />
          {history.length > 0 && <HistoryCard history={history} />}
        </aside>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(next) => {
          if (!next) onCancelStatus()
        }}
        title={transition ? t(transition.titleKey) : ''}
        description={transition ? t(transition.descriptionKey) : ''}
        confirmLabel={t('supportTickets:transitions.confirm')}
        cancelLabel={t('supportTickets:transitions.cancel')}
        onConfirm={onConfirmStatus}
        isLoading={isUpdating}
      />
    </div>
  )
}

function SenderCard({ ticket }: { ticket: SupportTicketDetail }) {
  const { t } = useTranslation()

  function copyPhone() {
    void navigator.clipboard.writeText(ticket.phone_number).then(() => {
      toast.success(t('supportTickets:actions.phone_copied'), { duration: 1500 })
    })
  }

  return (
    <Card className="gap-0 rounded-xl border-border py-0">
      <CardContent className="space-y-3 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">
          {t('supportTickets:detail.sender')}
        </h2>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">{ticket.user_name}</p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-3.5 shrink-0" aria-hidden />
            <span className="font-mono tabular-nums">{ticket.phone_number}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={copyPhone}
              aria-label={t('supportTickets:actions.copy_phone')}
              className="ms-auto text-muted-foreground hover:text-foreground"
            >
              <Copy className="size-3" aria-hidden />
            </Button>
          </div>
          <a
            href={`mailto:${ticket.email}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Mail className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{ticket.email}</span>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryCard({
  history,
}: {
  history: NonNullable<SupportTicketDetail['status_history']>
}) {
  const { t } = useTranslation()
  return (
    <Card className="gap-0 rounded-xl border-border py-0">
      <CardContent className="space-y-3 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">
          {t('supportTickets:detail.history')}
        </h2>
        <ol className="space-y-2">
          {history.map((entry) => (
            <li key={entry.id} className="space-y-1 border-s-2 border-border ps-3">
              <div className="flex items-center gap-2">
                <StatusBadge type="supportTicket" status={entry.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('supportTickets:detail.status_set_by', { name: entry.admin_name })}
              </p>
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {format.dateTime(entry.changed_at)}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
