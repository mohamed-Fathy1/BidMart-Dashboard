import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  Unlock,
  XCircle,
} from 'lucide-react'
import type { AccountStatus } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import { format } from '@/lib/format'
import { providerAccountStatusForSellerBadge } from '@/features/providers/providers.api'
import {
  useApproveProviderMutation,
  useBlockProviderMutation,
  useProviderDetailQuery,
  useRejectProviderMutation,
  useToggleVerificationMutation,
  useUnblockProviderMutation,
} from '@/features/providers/providers.queries'

interface ProviderDetailPageProps {
  storeId: string
}

function parseReturnPolicySnippet(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  return undefined
}

function isAccountStatus(value: string): value is AccountStatus {
  return (
    value === 'active' ||
    value === 'suspended' ||
    value === 'banned' ||
    value === 'pending_verification' ||
    value === 'deleted'
  )
}

export function ProviderDetailPage({ storeId }: ProviderDetailPageProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { data: provider, isLoading, isError } = useProviderDetailQuery(storeId)

  const approveMutation = useApproveProviderMutation()
  const rejectMutation = useRejectProviderMutation()
  const verifyMutation = useToggleVerificationMutation()
  const blockMutation = useBlockProviderMutation()
  const unblockMutation = useUnblockProviderMutation()

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [unblockOpen, setUnblockOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="border-b border-border pb-8">
          <div className="space-y-4">
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-8 w-[min(100%,320px)]" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-9 w-35 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-rest sm:p-8">
          <div className="flex flex-col gap-8 sm:flex-row">
            <Skeleton className="size-24 shrink-0 rounded-xl" />
            <div className="grid min-w-0 flex-1 gap-6">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-36 rounded-full" />
              </div>
              <Skeleton className="h-20 max-w-xl rounded-lg" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !provider) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('providers:detail.page_title')} onBack={() => navigate({ to: '/providers' })} />
        <Card className="border-border">
          <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted shadow-rest">
              <AlertCircle className="size-6 text-muted-foreground" aria-hidden />
            </span>
            <div className="max-w-md space-y-2">
              <p className="text-sm font-medium text-foreground">{t('providers:detail.load_failed')}</p>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {t('providers:detail.load_failed_hint')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/providers' })}>
              {t('providers:detail.back_to_list')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const countryLabel = provider.country
    ? i18n.language === 'ar'
      ? provider.country.name_ar
      : provider.country.name_en
    : null

  const ownerStatus = provider.owner.accountStatus

  const subtitle = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {provider.owner.phoneNumber}
      </span>
      {countryLabel && (
        <>
          <span aria-hidden className="text-muted-foreground/60 select-none">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 opacity-80" aria-hidden />
            {countryLabel}
          </span>
        </>
      )}
      <>
        <span aria-hidden className="text-muted-foreground/60 select-none">
          ·
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {t('providers:detail.summary_since')} {format.dateTime(provider.createdAt)}
        </span>
      </>
    </div>
  )

  const actions = (
    <>
      {provider.status === 'pending' && (
        <>
          <Can permission={PERMISSIONS.providers.approve}>
            <Button variant="default" size="sm" onClick={() => setApproveOpen(true)}>
              <CheckCircle className="size-4" aria-hidden />
              {t('providers:actions.approve')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.providers.reject}>
            <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
              <XCircle className="size-4" aria-hidden />
              {t('providers:actions.reject')}
            </Button>
          </Can>
        </>
      )}
      {provider.status === 'approved' && (
        <>
          <Can permission={PERMISSIONS.providers.verify}>
            <Button variant="outline" size="sm" onClick={() => setVerifyOpen(true)}>
              <ShieldCheck className="size-4" aria-hidden />
              {provider.isVerified
                ? t('providers:actions.toggle_verify_off')
                : t('providers:actions.toggle_verify_on')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.providers.block}>
            <Button variant="destructive" size="sm" onClick={() => setBlockOpen(true)}>
              <Ban className="size-4" aria-hidden />
              {t('providers:actions.block')}
            </Button>
          </Can>
        </>
      )}
      {provider.status === 'blocked' && (
        <Can permission={PERMISSIONS.providers.unblock}>
          <Button variant="outline" size="sm" onClick={() => setUnblockOpen(true)}>
            <Unlock className="size-4" aria-hidden />
            {t('providers:actions.unblock')}
          </Button>
        </Can>
      )}
    </>
  )

  const returnEn = parseReturnPolicySnippet(provider.returnPolicy?.en)
  const returnAr = parseReturnPolicySnippet(provider.returnPolicy?.ar)
  const hasReturnPolicyContent = Boolean(
    (returnEn && returnEn.trim() !== '') || (returnAr && returnAr.trim() !== ''),
  )

  const docUrl = provider.documents.commercialRegistrationDoc
  const addr = provider.detailedAddress?.trim()

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={provider.owner.fullName}
        description={subtitle}
        onBack={() => navigate({ to: '/providers' })}
        actions={actions}
      />

      <Card className="overflow-hidden rounded-xl border-border">
        <CardContent className="flex flex-col gap-8 px-6 py-8 sm:flex-row sm:items-start sm:px-8">
          <div className="shrink-0">
            <ImagePreview
              src={provider.storeLogo}
              alt={provider.owner.fullName}
              size="xl"
              className="ring-2 ring-border"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                type="seller"
                status={providerAccountStatusForSellerBadge(provider.status)}
              />
              <StatusBadge
                type="sellerVerified"
                status={provider.isVerified ? 'true' : 'false'}
              />
              <StatusBadge
                type="providerVerification"
                status={provider.documents.verificationStatus}
              />
            </div>

            {addr ? (
              <blockquote className="not-italic border-s-[3px] border-primary/35 ps-4 text-start">
                <p className="text-sm leading-relaxed text-foreground">{addr}</p>
              </blockquote>
            ) : (
              <p className="text-sm text-muted-foreground">{t('providers:detail.address_empty')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <DetailCard title={t('providers:detail.owner_info')} columns={2}>
          <DetailField label={t('providers:detail.owner_name')} value={provider.owner.fullName} />
          <DetailField label={t('providers:detail.owner_email')} value={provider.owner.email} mono />
          <DetailField label={t('providers:detail.owner_phone')} value={provider.owner.phoneNumber} mono />
          <DetailField
            label={t('providers:detail.owner_account_status')}
            value={
              isAccountStatus(ownerStatus) ? (
                <StatusBadge type="account" status={ownerStatus} />
              ) : (
                <span className="text-sm">{ownerStatus}</span>
              )
            }
          />
          <DetailField
            label={t('providers:detail.owner_registered_at')}
            value={format.dateTime(provider.owner.registeredAt)}
            mono
            span={2}
          />
        </DetailCard>

        <DetailCard title={t('providers:detail.documents')} columns={2}>
          <DetailField
            label={t('providers:detail.cr_number')}
            value={provider.documents.commercialRegistrationNumber}
            mono
          />
          <DetailField
            label={t('providers:detail.documents_verification')}
            value={
              <StatusBadge type="providerVerification" status={provider.documents.verificationStatus} />
            }
          />
          <DetailField
            label={t('providers:detail.cr_document')}
            value={
              docUrl ? (
                <Button variant="default" size="sm" asChild className="w-full gap-2 sm:w-auto">
                  <a href={docUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4 shrink-0" aria-hidden />
                    {t('providers:detail.open_document')}
                    <ExternalLink className="size-4 shrink-0 opacity-70" aria-hidden />
                  </a>
                </Button>
              ) : undefined
            }
            span={2}
          />
        </DetailCard>
      </div>

      {hasReturnPolicyContent ? (
        <DetailCard title={t('providers:detail.return_policy')} columns={2}>
          <DetailField label={t('providers:detail.return_policy_en')} value={returnEn} span={returnAr?.trim() ? 1 : 2} />
          {returnAr != null && returnAr.trim() !== '' ? (
            <DetailField
              label={t('providers:detail.return_policy_ar')}
              value={
                <span dir="rtl" className="block text-pretty leading-relaxed">
                  {returnAr}
                </span>
              }
            />
          ) : null}
        </DetailCard>
      ) : null}

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={t('providers:approve_dialog.title')}
        description={t('providers:approve_dialog.description')}
        onConfirm={() => {
          approveMutation.mutate(storeId, {
            onSettled: () => setApproveOpen(false),
          })
        }}
        isLoading={approveMutation.isPending}
      />
      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={t('providers:reject_dialog.title')}
        description={t('providers:reject_dialog.description')}
        onConfirm={(reason) => {
          rejectMutation.mutate(
            { storeId, reason },
            { onSettled: () => setRejectOpen(false) },
          )
        }}
        isLoading={rejectMutation.isPending}
        variant="destructive"
      />
      <ConfirmDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        title={
          provider.isVerified
            ? t('providers:verify_dialog.unverify_title')
            : t('providers:verify_dialog.verify_title')
        }
        description={
          provider.isVerified
            ? t('providers:verify_dialog.unverify_description')
            : t('providers:verify_dialog.verify_description')
        }
        onConfirm={() => {
          verifyMutation.mutate(storeId, {
            onSettled: () => setVerifyOpen(false),
          })
        }}
        isLoading={verifyMutation.isPending}
      />
      <ConfirmDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title={t('providers:block_dialog.title')}
        description={t('providers:block_dialog.description')}
        confirmLabel={t('providers:actions.block')}
        onConfirm={() => {
          blockMutation.mutate(storeId, {
            onSettled: () => setBlockOpen(false),
          })
        }}
        isLoading={blockMutation.isPending}
        variant="destructive"
      />
      <ConfirmDialog
        open={unblockOpen}
        onOpenChange={setUnblockOpen}
        title={t('providers:unblock_dialog.title')}
        description={t('providers:unblock_dialog.description')}
        confirmLabel={t('providers:actions.unblock')}
        onConfirm={() => {
          unblockMutation.mutate(storeId, {
            onSettled: () => setUnblockOpen(false),
          })
        }}
        isLoading={unblockMutation.isPending}
      />
    </div>
  )
}
