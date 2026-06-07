import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Hourglass,
  Pencil,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { StatusBadge } from '@/components/shared/status-badge'
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import {
  useAdjustSettlementMutation,
  useApproveSettlementMutation,
  useRejectSettlementMutation,
  useRevealIbanMutation,
  useWithdrawalDetailQuery,
} from '@/features/withdrawals/withdrawals.queries'

interface WithdrawalDetailPageProps {
  id: string
}

const adjustFormSchema = z.object({
  adjustedAmount: z
    .number({ message: 'withdrawals:errors.amount_required' })
    .positive({ message: 'withdrawals:errors.amount_positive' })
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: 'withdrawals:errors.amount_two_decimals',
    }),
  notes: z
    .string()
    .max(500, { message: 'withdrawals:errors.notes_max' })
    .optional(),
})
type AdjustFormValues = z.infer<typeof adjustFormSchema>

type HeroTone = 'positive' | 'warning' | 'info' | 'danger'

const HERO_TONE_STYLES: Record<HeroTone, { rail: string; chip: string; iconText: string }> = {
  positive: {
    rail: 'border-s-emerald-500',
    chip: 'bg-emerald-50 ring-emerald-200/70 text-emerald-900',
    iconText: 'text-emerald-600',
  },
  warning: {
    rail: 'border-s-amber-500',
    chip: 'bg-amber-50 ring-amber-200/70 text-amber-900',
    iconText: 'text-amber-600',
  },
  info: {
    rail: 'border-s-blue-500',
    chip: 'bg-blue-50 ring-blue-200/70 text-blue-900',
    iconText: 'text-blue-600',
  },
  danger: {
    rail: 'border-s-red-500',
    chip: 'bg-red-50 ring-red-200/70 text-red-900',
    iconText: 'text-red-600',
  },
}

export function WithdrawalDetailPage({ id }: WithdrawalDetailPageProps) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const navigate = useNavigate()

  const { data: detail, isLoading, isError } = useWithdrawalDetailQuery(id)

  const [approveOpen, setApproveOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [revealedIban, setRevealedIban] = useState<string | null>(null)
  const [revealedAt, setRevealedAt] = useState<string | null>(null)

  const approveMutation = useApproveSettlementMutation()
  const adjustMutation = useAdjustSettlementMutation()
  const rejectMutation = useRejectSettlementMutation()
  const revealMutation = useRevealIbanMutation()

  const adjustForm = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustFormSchema),
    mode: 'onBlur',
    defaultValues: { adjustedAmount: undefined as unknown as number, notes: '' },
  })

  const canApprove = usePermission(PERMISSIONS.withdrawals.approve)
  const canReject = usePermission(PERMISSIONS.withdrawals.reject)

  if (isLoading) return <DetailPageSkeleton cards={3} hero={false} />
  if (isError || !detail) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('withdrawals:detail_title')}
          onBack={() => navigate({ to: '/withdrawals' })}
        />
        <Card>
          <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
            <AlertCircle className="size-4 text-destructive" aria-hidden />
            {t('withdrawals:errors.not_found')}
          </CardContent>
        </Card>
      </div>
    )
  }

  const bankName = isAr ? detail.bankNameAr : detail.bankNameEn
  const isPending = detail.status === 'NEW'
  const ibanDisplay = revealedIban ?? detail.ibanMasked

  function handleReveal() {
    if (revealedIban) {
      setRevealedIban(null)
      setRevealedAt(null)
      return
    }
    revealMutation.mutate(detail!.id, {
      onSuccess: (res) => {
        setRevealedIban(res.iban)
        setRevealedAt(new Date().toISOString())
      },
    })
  }

  async function handleCopyIban() {
    if (!revealedIban) return
    try {
      await navigator.clipboard.writeText(revealedIban)
      toast.success(t('withdrawals:actions.iban_copied'), {
        id: 'iban-copied',
        duration: 2000,
      })
    } catch {
      /* clipboard unavailable — silent */
    }
  }

  function openAdjust() {
    adjustForm.reset({ adjustedAmount: undefined as unknown as number, notes: '' })
    setAdjustOpen(true)
  }

  const headerDescription = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-foreground">{detail.sellerName}</span>
      <span className="text-muted-foreground">·</span>
      <span className="font-mono tabular-nums text-muted-foreground" dir="ltr">
        {detail.sellerPhone}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{bankName}</span>
    </div>
  )

  // Approve + Adjust are both "ways to pay" — group them as one cluster.
  // Reject is the opposite intent — set apart with a divider so the action row
  // reads as [pay options] | [decline] rather than three peer buttons.
  const actions = isPending ? (
    <>
      {canApprove && (
        <>
          <Button
            size="sm"
            onClick={() => setApproveOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/50"
          >
            <CheckCircle className="size-4" />
            {t('withdrawals:actions.approve')}
          </Button>
          <Button size="sm" variant="outline" onClick={openAdjust}>
            <Pencil className="size-4" />
            {t('withdrawals:actions.adjust')}
          </Button>
        </>
      )}
      {canReject && (
        <>
          {canApprove && (
            <span
              aria-hidden
              className="mx-1 inline-block h-5 w-px self-center bg-border/70"
            />
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="size-4" />
            {t('withdrawals:actions.reject')}
          </Button>
        </>
      )}
    </>
  ) : null

  const adjustFirstErrorKey = (['adjustedAmount', 'notes'] as const).find(
    (k) => adjustForm.formState.errors[k]?.message,
  )
  const adjustFirstErrorMessage =
    adjustFirstErrorKey &&
    typeof adjustForm.formState.errors[adjustFirstErrorKey]?.message === 'string'
      ? t(adjustForm.formState.errors[adjustFirstErrorKey]!.message as string)
      : undefined

  const requestedNum = Number(detail.requestedAmount)
  const availableNum = Number(detail.balanceSnapshot)
  const adjustedNum = detail.adjustedAmount ? Number(detail.adjustedAmount) : null
  const exceedsAvailable = isPending && requestedNum > availableNum
  const heroAmount = format.currency(
    detail.status === 'ADJUSTED' && adjustedNum !== null ? adjustedNum : requestedNum,
  )
  const heroAmountLabel =
    detail.status === 'APPROVED' || detail.status === 'ADJUSTED'
      ? t('withdrawals:hero.paid')
      : t('withdrawals:hero.requested')
  const submittedRelative = t('withdrawals:hero.submitted_relative', {
    relative: format.relative(detail.submittedAt),
  })

  // `detailIsNumeric` controls font-mono on the chip's secondary line: numeric
  // for currency strings (NEW/ADJUSTED variants), unset for absolute datetimes.
  const heroSignal: {
    tone: HeroTone
    title: string
    detail: string
    detailIsNumeric: boolean
    icon: typeof CheckCircle
  } =
    detail.status === 'NEW'
      ? exceedsAvailable
        ? {
            tone: 'warning',
            title: t('withdrawals:hero.exceeds'),
            detail: t('withdrawals:hero.exceeds_by', {
              amount: format.currency(requestedNum - availableNum),
            }),
            detailIsNumeric: true,
            icon: AlertTriangle,
          }
        : {
            tone: 'positive',
            title: t('withdrawals:hero.within'),
            detail: t('withdrawals:hero.available', {
              amount: format.currency(availableNum),
            }),
            detailIsNumeric: true,
            icon: CheckCircle,
          }
      : detail.status === 'APPROVED'
        ? {
            tone: 'positive',
            title: t('withdrawals:hero.paid_in_full'),
            detail: detail.actionedAt ? format.dateTime(detail.actionedAt) : '',
            detailIsNumeric: false,
            icon: CheckCircle,
          }
        : detail.status === 'ADJUSTED'
          ? {
              tone: 'info',
              title: t('withdrawals:hero.adjusted'),
              detail: t('withdrawals:hero.adjusted_from', {
                amount: format.currency(requestedNum),
              }),
              detailIsNumeric: true,
              icon: Pencil,
            }
          : {
              tone: 'danger',
              title: t('withdrawals:hero.rejected'),
              detail: detail.actionedAt ? format.dateTime(detail.actionedAt) : '',
              detailIsNumeric: false,
              icon: XCircle,
            }

  const tone = HERO_TONE_STYLES[heroSignal.tone]
  const HeroIcon = heroSignal.icon

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('withdrawals:detail_title')}
        description={headerDescription}
        badge={<StatusBadge type="settlement" status={detail.status} />}
        onBack={() => navigate({ to: '/withdrawals' })}
        actions={actions}
      />

      <Card className={cn('overflow-hidden border-s-4', tone.rail)}>
        <CardContent className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {heroAmountLabel}
            </p>
            <p
              className={cn(
                'font-mono text-4xl font-semibold tabular-nums leading-none text-foreground',
                detail.status === 'REJECTED' && 'line-through decoration-2 decoration-red-300/80',
              )}
              dir="ltr"
            >
              {heroAmount}
            </p>
            <p className="text-xs text-muted-foreground">{submittedRelative}</p>
          </div>
          <div className={cn('flex shrink-0 items-start gap-3 rounded-lg px-4 py-3 ring-1', tone.chip)}>
            <HeroIcon className={cn('mt-0.5 size-4 shrink-0', tone.iconText)} aria-hidden />
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-tight">{heroSignal.title}</p>
              {heroSignal.detail && (
                <p
                  className={cn(
                    'text-xs opacity-80',
                    heroSignal.detailIsNumeric && 'font-mono tabular-nums',
                  )}
                  dir="ltr"
                >
                  {heroSignal.detail}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title={t('withdrawals:sections.snapshot')} columns={2}>
          <DetailField
            label={t('withdrawals:fields.balance_snapshot')}
            value={
              <span
                className={cn(
                  'font-mono tabular-nums',
                  exceedsAvailable ? 'text-red-700' : 'text-emerald-700',
                )}
              >
                {format.currency(availableNum)}
              </span>
            }
          />
          <DetailField
            label={t('withdrawals:fields.requested_amount')}
            value={
              <span className="font-mono font-medium tabular-nums text-foreground">
                {format.currency(requestedNum)}
              </span>
            }
          />
          {detail.status === 'ADJUSTED' && adjustedNum !== null && (
            <DetailField
              label={t('withdrawals:fields.adjusted_amount')}
              value={
                <span className="font-mono font-medium tabular-nums text-blue-700">
                  {format.currency(adjustedNum)}
                </span>
              }
              span={2}
            />
          )}
          <DetailField
            label={t('withdrawals:fields.holding_snapshot')}
            value={format.currency(Number(detail.holdingSnapshot))}
            mono
          />
          <DetailField
            label={t('withdrawals:fields.full_balance_snapshot')}
            value={format.currency(Number(detail.fullBalanceSnapshot))}
            mono
          />
        </DetailCard>

        <DetailCard title={t('withdrawals:sections.destination')} columns={1}>
          <DetailField label={t('withdrawals:fields.bank')} value={bankName} />
          <div className="grid gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t('withdrawals:fields.iban')}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-md border border-border bg-muted/50 px-3 py-1.5 font-mono text-sm tabular-nums text-foreground"
                dir="ltr"
              >
                {ibanDisplay}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReveal}
                disabled={revealMutation.isPending}
              >
                {revealedIban ? (
                  <>
                    <EyeOff className="size-4" />
                    {t('withdrawals:actions.hide_iban')}
                  </>
                ) : (
                  <>
                    <Eye className="size-4" />
                    {t('withdrawals:actions.reveal_iban')}
                  </>
                )}
              </Button>
              {revealedIban && (
                <Button size="sm" variant="ghost" onClick={handleCopyIban}>
                  <Copy className="size-4" />
                  {t('withdrawals:actions.copy_iban')}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {revealedIban && revealedAt
                ? t('withdrawals:iban_revealed_hint', {
                    when: format.dateTime(revealedAt),
                  })
                : t('withdrawals:iban_hint')}
            </p>
          </div>
        </DetailCard>

        {isPending ? (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-[length:var(--type-h3-size)] font-[number:var(--type-h3-weight)]">
                {t('withdrawals:sections.decision')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200/70"
                >
                  <Hourglass className="size-4 text-amber-600" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {t('withdrawals:decision.awaiting')}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t('withdrawals:decision.awaiting_hint')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DetailCard
            title={t('withdrawals:sections.decision')}
            columns={2}
            className="lg:col-span-1"
          >
            <DetailField
              label={t('withdrawals:fields.actioned_by')}
              value={detail.actionedByName}
            />
            <DetailField
              label={t('withdrawals:fields.actioned_at')}
              value={detail.actionedAt ? format.dateTime(detail.actionedAt) : null}
              mono
            />
            <DetailField
              label={t('withdrawals:fields.admin_notes')}
              value={detail.adminNotes}
              span={2}
            />
          </DetailCard>
        )}

        <DetailCard title={t('withdrawals:sections.seller')} columns={2}>
          <DetailField
            label={t('withdrawals:fields.seller_name')}
            value={detail.sellerName}
          />
          <DetailField
            label={t('withdrawals:fields.seller_phone')}
            value={
              <span className="font-mono tabular-nums" dir="ltr">
                {detail.sellerPhone}
              </span>
            }
          />
          <DetailField
            label={t('withdrawals:fields.seller_email')}
            value={detail.sellerEmail}
            span={2}
          />
        </DetailCard>
      </div>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={t('withdrawals:approve_dialog.title', { name: detail.sellerName })}
        description={t('withdrawals:approve_dialog.description', {
          amount: format.currency(Number(detail.requestedAmount)),
        })}
        confirmLabel={t('withdrawals:approve_dialog.confirm')}
        onConfirm={() =>
          approveMutation.mutate(detail.id, {
            onSettled: () => setApproveOpen(false),
          })
        }
        isLoading={approveMutation.isPending}
      />

      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={t('withdrawals:reject_dialog.title', { name: detail.sellerName })}
        description={t('withdrawals:reject_dialog.description')}
        reasonLabel={t('withdrawals:reject_dialog.reason_label')}
        reasonPlaceholder={t('withdrawals:reject_dialog.reason_placeholder')}
        confirmLabel={t('withdrawals:reject_dialog.confirm')}
        onConfirm={(reason) =>
          rejectMutation.mutate(
            { id: detail.id, payload: { reason } },
            { onSettled: () => setRejectOpen(false) },
          )
        }
        isLoading={rejectMutation.isPending}
        maxLength={500}
        variant="destructive"
      />

      <FormDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        title={t('withdrawals:adjust_dialog.title', { name: detail.sellerName })}
        description={t('withdrawals:adjust_dialog.description')}
        isLoading={adjustMutation.isPending}
        submitLabel={t('withdrawals:adjust_dialog.confirm')}
        errorMessage={adjustFirstErrorMessage}
        suppressInitialFocus
        size="md"
        onSubmit={adjustForm.handleSubmit((values) => {
          adjustMutation.mutate(
            {
              id: detail.id,
              payload: {
                adjustedAmount: values.adjustedAmount,
                notes: values.notes?.trim() || undefined,
              },
            },
            { onSettled: () => setAdjustOpen(false) },
          )
        })}
      >
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">
                {t('withdrawals:adjust_dialog.summary_requested')}
              </dt>
              <dd className="font-mono text-sm font-medium tabular-nums text-foreground">
                {format.currency(Number(detail.requestedAmount))}
              </dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">
                {t('withdrawals:adjust_dialog.summary_available')}
              </dt>
              <dd className="font-mono text-sm font-medium tabular-nums text-emerald-700">
                {format.currency(Number(detail.balanceSnapshot))}
              </dd>
            </div>
          </dl>

          <div className="grid gap-2">
            <Label htmlFor="adjust-amount">
              {t('withdrawals:adjust_dialog.amount_label')}
            </Label>
            <Controller
              name="adjustedAmount"
              control={adjustForm.control}
              render={({ field }) => (
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    SAR
                  </span>
                  <Input
                    id="adjust-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    className="ps-14 font-mono tabular-nums"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value
                      field.onChange(raw === '' ? undefined : Number(raw))
                    }}
                    onBlur={field.onBlur}
                    aria-invalid={
                      adjustForm.formState.errors.adjustedAmount ? true : undefined
                    }
                  />
                </div>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adjust-notes">
              {t('withdrawals:adjust_dialog.notes_label')}
            </Label>
            <Textarea
              id="adjust-notes"
              {...adjustForm.register('notes')}
              placeholder={t('withdrawals:adjust_dialog.notes_placeholder')}
              maxLength={500}
              aria-invalid={
                adjustForm.formState.errors.notes ? true : undefined
              }
            />
          </div>
        </div>
      </FormDialog>
    </div>
  )
}
