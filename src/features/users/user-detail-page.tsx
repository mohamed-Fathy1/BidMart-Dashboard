import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Ban, PauseCircle, CheckCircle, Trash2 } from 'lucide-react'
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

  const actions = (
    <div className="flex items-center gap-2">
      {!user.isActive && (
        <Can permission={PERMISSIONS.users.activate}>
          <Button variant="outline" size="sm" onClick={() => setActivateOpen(true)}>
            <CheckCircle className="size-4" />
            {t('users:actions.activate')}
          </Button>
        </Can>
      )}
      {user.isActive && (
        <>
          <Can permission={PERMISSIONS.users.suspend}>
            <Button variant="outline" size="sm" onClick={() => setSuspendOpen(true)}>
              <PauseCircle className="size-4" />
              {t('users:actions.suspend')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.users.ban}>
            <Button variant="destructive" size="sm" onClick={() => setBanOpen(true)}>
              <Ban className="size-4" />
              {t('users:actions.ban')}
            </Button>
          </Can>
        </>
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
        title={t('users:detail.page_title')}
        onBack={() => navigate({ to: '/users' })}
        actions={actions}
      />

      {/* Avatar + User Info */}
      <div className="flex items-start gap-4">
        <ImagePreview src={user.avatarUrl} alt={user.fullName} size="lg" />
        <div>
          <h2 className="text-lg font-semibold">{user.fullName}</h2>
          <p className="text-sm text-muted-foreground font-mono" dir="ltr">{user.phone}</p>
        </div>
      </div>

      <DetailCard title={t('users:detail.user_info')} columns={3}>
        <DetailField label={t('users:detail.full_name')} value={user.fullName} />
        <DetailField label={t('users:detail.email')} value={user.email} mono />
        <DetailField label={t('users:detail.phone')} value={user.phone} mono />
        <DetailField label={t('users:detail.role')} value={user.role} />
        <DetailField
          label={t('users:detail.active')}
          value={
            <StatusBadge
              type="boolean"
              status={user.isActive ? 'true' : 'false'}
            />
          }
        />
        <DetailField
          label={t('users:detail.verified')}
          value={
            <StatusBadge
              type="boolean"
              status={user.isVerified ? 'true' : 'false'}
            />
          }
        />
        <DetailField label={t('users:detail.language')} value={user.language} />
        <DetailField
          label={t('users:detail.created_at')}
          value={format.dateTime(user.createdAt)}
          mono
        />
        <DetailField
          label={t('users:detail.updated_at')}
          value={format.dateTime(user.updatedAt)}
          mono
        />
      </DetailCard>

      {user.store && (
        <DetailCard title={t('users:detail.store_info')} columns={3}>
          <DetailField label={t('users:detail.store_name')} value={user.store.nameEn} />
          <DetailField
            label={t('users:detail.store_status')}
            value={<StatusBadge type="seller" status={user.store.status} />}
          />
        </DetailCard>
      )}

      {/* Dialogs */}
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
