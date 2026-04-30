import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import { format } from '@/lib/format'
import {
  useProviderDetailQuery,
  useApproveProviderMutation,
  useRejectProviderMutation,
  useToggleVerificationMutation,
} from '@/features/providers/providers.queries'

interface ProviderDetailPageProps {
  storeId: string
}

export function ProviderDetailPage({ storeId }: ProviderDetailPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: provider, isLoading } = useProviderDetailQuery(storeId)

  /* ---------- mutations ---------- */
  const approveMutation = useApproveProviderMutation()
  const rejectMutation = useRejectProviderMutation()
  const verifyMutation = useToggleVerificationMutation()

  /* ---------- dialogs ---------- */
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm">{t('common:states.no_data')}</p>
      </div>
    )
  }

  const actions = (
    <div className="flex items-center gap-2">
      {provider.status === 'PENDING' && (
        <>
          <Can permission={PERMISSIONS.providers.approve}>
            <Button variant="outline" size="sm" onClick={() => setApproveOpen(true)}>
              <CheckCircle className="size-4" />
              {t('providers:actions.approve')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.providers.reject}>
            <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
              <XCircle className="size-4" />
              {t('providers:actions.reject')}
            </Button>
          </Can>
        </>
      )}
      {provider.status === 'APPROVED' && (
        <Can permission={PERMISSIONS.providers.verify}>
          <Button variant="outline" size="sm" onClick={() => setVerifyOpen(true)}>
            <ShieldCheck className="size-4" />
            {provider.isVerified
              ? t('providers:actions.unverify')
              : t('providers:actions.verify')}
          </Button>
        </Can>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('providers:detail.page_title')}
        onBack={() => navigate({ to: '/providers' })}
        actions={actions}
      />

      <DetailCard title={t('providers:detail.store_info')} columns={3}>
        <DetailField label={t('providers:detail.name_en')} value={provider.nameEn} />
        <DetailField label={t('providers:detail.name_ar')} value={provider.nameAr} />
        <DetailField
          label={t('providers:detail.status')}
          value={<StatusBadge type="seller" status={provider.status} />}
        />
        <DetailField
          label={t('providers:detail.verified')}
          value={
            <StatusBadge
              type="boolean"
              status={provider.isVerified ? 'true' : 'false'}
            />
          }
        />
        <DetailField
          label={t('providers:detail.avg_rating')}
          value={format.number(provider.averageRating)}
          mono
        />
        <DetailField
          label={t('providers:detail.total_sold')}
          value={format.number(provider.totalSold)}
          mono
        />
        <DetailField
          label={t('providers:detail.created_at')}
          value={format.dateTime(provider.createdAt)}
          mono
        />
      </DetailCard>

      <DetailCard title={t('providers:detail.owner_info')} columns={3}>
        <DetailField label={t('providers:detail.owner_name')} value={provider.user.fullName} />
        <DetailField label={t('providers:detail.owner_email')} value={provider.user.email} mono />
      </DetailCard>

      {/* Dialogs */}
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
    </div>
  )
}
