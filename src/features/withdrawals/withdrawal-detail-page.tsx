import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { StatusBadge } from '@/components/shared/status-badge'
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
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

  const actions = (
    <>
      {isPending && (
        <>
          <Can permission={PERMISSIONS.withdrawals.approve}>
            <Button
              size="sm"
              onClick={() => setApproveOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/50"
            >
              <CheckCircle className="size-4" />
              {t('withdrawals:actions.approve')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.withdrawals.approve}>
            <Button size="sm" variant="outline" onClick={openAdjust}>
              <Pencil className="size-4" />
              {t('withdrawals:actions.adjust')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.withdrawals.reject}>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="size-4" />
              {t('withdrawals:actions.reject')}
            </Button>
          </Can>
        </>
      )}
    </>
  )

  const adjustFirstErrorKey = (['adjustedAmount', 'notes'] as const).find(
    (k) => adjustForm.formState.errors[k]?.message,
  )
  const adjustFirstErrorMessage =
    adjustFirstErrorKey &&
    typeof adjustForm.formState.errors[adjustFirstErrorKey]?.message === 'string'
      ? t(adjustForm.formState.errors[adjustFirstErrorKey]!.message as string)
      : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('withdrawals:detail_title')}
        description={headerDescription}
        badge={<StatusBadge type="settlement" status={detail.status} />}
        onBack={() => navigate({ to: '/withdrawals' })}
        actions={actions}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title={t('withdrawals:sections.snapshot')} columns={2}>
          <DetailField
            label={t('withdrawals:fields.requested_amount')}
            value={format.currency(Number(detail.requestedAmount))}
            mono
          />
          {detail.status === 'ADJUSTED' && detail.adjustedAmount && (
            <DetailField
              label={t('withdrawals:fields.adjusted_amount')}
              value={format.currency(Number(detail.adjustedAmount))}
              mono
            />
          )}
          <DetailField
            label={t('withdrawals:fields.balance_snapshot')}
            value={format.currency(Number(detail.balanceSnapshot))}
            mono
          />
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
          <DetailField
            label={t('withdrawals:fields.submitted_at')}
            value={format.dateTime(detail.submittedAt)}
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
