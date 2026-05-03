import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Ban, PauseCircle, CheckCircle, Trash2 } from 'lucide-react'
import type { AdminUserDetail } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import { format } from '@/lib/format'
import { providerAccountStatusForSellerBadge } from '@/features/providers/providers.api'
import {
  useUserDetailQuery,
  useBanUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} from '@/features/users/users.queries'

interface UserDetailPageProps {
  userId: string
}

function displayName(user: AdminUserDetail): string {
  return (
    user.full_name ??
    user.email ??
    user.phone_number ??
    ''
  )
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: user, isLoading } = useUserDetailQuery(userId)

  /* ---------- mutations ---------- */
  const banMutation = useBanUserMutation()
  const suspendMutation = useSuspendUserMutation()
  const activateMutation = useActivateUserMutation()
  const deleteMutation = useDeleteUserMutation()

  /* ---------- dialogs ---------- */
  const [banOpen, setBanOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm">{t('common:states.no_data')}</p>
      </div>
    )
  }

  const title = displayName(user) || t('users:detail.page_title')
  const { account_status: accountStatus } = user
  const showActivate = accountStatus === 'banned' || accountStatus === 'suspended'
  const showSuspend = accountStatus === 'active'
  const showBan = accountStatus !== 'banned'

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {showActivate && (
        <Can permission={PERMISSIONS.users.activate}>
          <Button variant="outline" size="sm" onClick={() => setActivateOpen(true)}>
            <CheckCircle className="size-4" />
            {t('users:actions.activate')}
          </Button>
        </Can>
      )}
      {showSuspend && (
        <Can permission={PERMISSIONS.users.suspend}>
          <Button variant="outline" size="sm" onClick={() => setSuspendOpen(true)}>
            <PauseCircle className="size-4" />
            {t('users:actions.suspend')}
          </Button>
        </Can>
      )}
      {showBan && (
        <Can permission={PERMISSIONS.users.ban}>
          <Button variant="destructive" size="sm" onClick={() => setBanOpen(true)}>
            <Ban className="size-4" />
            {t('users:actions.ban')}
          </Button>
        </Can>
      )}
      <Can permission={PERMISSIONS.users.delete}>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
          {t('users:actions.delete')}
        </Button>
      </Can>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={
          <span className="font-mono tabular-nums text-muted-foreground" dir="ltr">
            {user.phone_number}
          </span>
        }
        onBack={() => navigate({ to: '/users' })}
        actions={actions}
      />

      <div className="flex items-start gap-4">
        <ImagePreview
          src={user.profile_picture}
          alt={displayName(user) || user.phone_number}
          size="lg"
        />
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold">
            {displayName(user) || t('components:detail.not_available')}
          </h2>
          {user.email ? (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          ) : null}
        </div>
      </div>

      <DetailCard title={t('users:detail.user_info')} columns={3}>
        <DetailField label={t('users:detail.full_name')} value={user.full_name} />
        <DetailField label={t('users:detail.email')} value={user.email} mono />
        <DetailField label={t('users:detail.phone')} value={user.phone_number} mono />
        <DetailField
          label={t('users:detail.role')}
          value={t(`users:roles.${user.role}`)}
        />
        <DetailField
          label={t('users:detail.account_status')}
          value={<StatusBadge status={user.account_status} />}
        />
        <DetailField
          label={t('users:detail.created_at')}
          value={format.dateTime(user.created_at)}
          mono
        />
        <DetailField
          label={t('users:detail.updated_at')}
          value={format.dateTime(user.updated_at)}
          mono
        />
      </DetailCard>

      {user.stores.map((store, index) => (
        <DetailCard
          key={store.id}
          title={t('users:detail.store_card_title', { index: index + 1 })}
          columns={3}
        >
          <DetailField
            label={t('users:detail.commercial_registration')}
            value={store.commercial_registration_number}
            mono
          />
          <DetailField
            label={t('users:detail.store_status')}
            value={
              <StatusBadge
                type="seller"
                status={providerAccountStatusForSellerBadge(store.status)}
              />
            }
          />
          <DetailField
            label={t('users:detail.platform_verified')}
            value={
              <StatusBadge
                type="sellerVerified"
                status={store.is_verified ? 'true' : 'false'}
              />
            }
          />
          <DetailField
            label={t('users:detail.store_created_at')}
            value={format.dateTime(store.created_at)}
            mono
          />
          <DetailField
            label={t('users:detail.commercial_registration_doc')}
            value={store.commercial_registration_doc}
            mono
            span={2}
          />
          <DetailField
            label={t('users:detail.verification_requests_count')}
            value={format.number(store.verification_requests.length)}
            mono
          />
        </DetailCard>
      ))}

      <ReasonDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        title={t('users:ban_dialog.title')}
        description={t('users:ban_dialog.description')}
        onConfirm={(reason) => {
          banMutation.mutate(
            { userId, reason },
            { onSettled: () => setBanOpen(false) },
          )
        }}
        isLoading={banMutation.isPending}
        variant="destructive"
      />
      <ReasonDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title={t('users:suspend_dialog.title')}
        description={t('users:suspend_dialog.description')}
        onConfirm={(reason) => {
          suspendMutation.mutate(
            { userId, reason },
            { onSettled: () => setSuspendOpen(false) },
          )
        }}
        isLoading={suspendMutation.isPending}
        variant="destructive"
      />
      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title={t('users:activate_dialog.title')}
        description={t('users:activate_dialog.description')}
        onConfirm={() => {
          activateMutation.mutate(userId, {
            onSettled: () => setActivateOpen(false),
          })
        }}
        isLoading={activateMutation.isPending}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('users:delete_dialog.title')}
        description={t('users:delete_dialog.description')}
        onConfirm={() => {
          deleteMutation.mutate(userId, {
            onSuccess: () => navigate({ to: '/users' }),
            onSettled: () => setDeleteOpen(false),
          })
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
