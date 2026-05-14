import { useTranslation } from 'react-i18next'
import { CheckCircle2, Phone, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ComplaintDetail } from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'
import { cn } from '@/lib/utils'
import {
  InitialAvatar,
  complaintStatusTint,
  formatWaitDuration,
  shortComplaintId,
} from '@/features/complaints/complaint-ui'

interface ComplaintHeroCardProps {
  complaint: ComplaintDetail
  actions?: ReactNode
}

export function ComplaintHeroCard({ complaint, actions }: ComplaintHeroCardProps) {
  const { t, i18n } = useTranslation()
  const typeLabel = localizedName(complaint.complaint_type, i18n)
  const tint = complaintStatusTint(complaint.status)
  const isTerminal =
    complaint.status === 'RESOLVED' || complaint.status === 'REJECTED'

  return (
    <Card className="relative gap-0 overflow-hidden rounded-2xl border-border py-0">
      <span
        aria-hidden
        className={cn('absolute inset-x-0 top-0 h-[3px]', tint.rowStripe)}
      />

      <CardContent className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge type="complaint" status={complaint.status} />
              <span
                translate="no"
                className="font-mono text-[11px] tabular-nums text-muted-foreground"
              >
                {shortComplaintId(complaint.id)}
              </span>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-[length:var(--type-h1-size)] font-[number:var(--type-h1-weight)] leading-[var(--type-h1-leading)] tracking-[var(--type-h1-tracking)] text-pretty text-foreground">
                {typeLabel}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('complaints:hero.complaint_label')} · {shortComplaintId(complaint.id)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <InitialAvatar
                name={complaint.submitter.full_name}
                size="md"
                tone="neutral"
              />
              <div className="min-w-0 flex flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">
                  {complaint.submitter.full_name ?? '—'}
                </span>
                {complaint.submitter.phone_number && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    <Phone className="size-3 opacity-70" aria-hidden />
                    {complaint.submitter.phone_number}
                  </span>
                )}
              </div>
              <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  <span className="me-1 uppercase tracking-[0.12em]">
                    {t('complaints:info.submitted')}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatWaitDuration(complaint.created_at, t)}
                  </span>
                </span>
                <span>
                  <span className="me-1 uppercase tracking-[0.12em]">
                    {t('complaints:info.updated')}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatWaitDuration(complaint.updated_at, t)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {actions && (
            <div
              className={cn(
                '-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1',
                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                'sm:mx-0 sm:shrink-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0 sm:pb-0',
              )}
            >
              {actions}
            </div>
          )}
        </div>
      </CardContent>

      {isTerminal && complaint.resolution_note && (
        <div
          className={cn(
            'flex items-start gap-3 border-t border-border px-5 py-3 sm:px-6',
            tint.bandBg,
            tint.bandText,
          )}
        >
          <span
            aria-hidden
            className={cn(
              'inline-flex size-7 shrink-0 items-center justify-center rounded-full',
              complaint.status === 'RESOLVED'
                ? 'bg-emerald-500/10 text-emerald-700'
                : 'bg-red-500/10 text-red-700',
            )}
          >
            {complaint.status === 'RESOLVED' ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <XCircle className="size-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-pretty text-sm leading-relaxed text-foreground/90">
              {complaint.resolution_note}
            </p>
            {complaint.resolved_at && (
              <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                {format.dateTime(complaint.resolved_at)}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
