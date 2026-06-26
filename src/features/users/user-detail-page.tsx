import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Ban,
  PauseCircle,
  CheckCircle,
  Monitor,
  ShoppingCart,
  Trash2,
  UserX,
  Wallet,
} from 'lucide-react'
import type { AdminUserDetail } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'
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

  const banMutation = useBanUserMutation()
  const suspendMutation = useSuspendUserMutation()
  const activateMutation = useActivateUserMutation()
  const deleteMutation = useDeleteUserMutation()

  const [banOpen, setBanOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return <DetailPageSkeleton cards={1} />
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('users:detail.page_title')}
          onBack={() => navigate({ to: '/users' })}
        />
        <EmptyState
          icon={UserX}
          title={t('users:detail.not_found_title')}
          message={t('users:detail.not_found_hint')}
          actionLabel={t('users:detail.back_to_list')}
          onAction={() => navigate({ to: '/users' })}
        />
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
          <Button size="sm" onClick={() => setActivateOpen(true)}>
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
          <Button variant="outline" size="sm" onClick={() => setBanOpen(true)}>
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

      <UserHeroCard user={user} />

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList>
          <TabsTrigger value="overview">{t('users:detail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="orders">{t('users:detail.tabs.orders')}</TabsTrigger>
          <TabsTrigger value="wallet">{t('users:detail.tabs.wallet')}</TabsTrigger>
          <TabsTrigger value="sessions">{t('users:detail.tabs.sessions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="orders">
          <ComingSoonCard
            icon={ShoppingCart}
            title={t('users:detail.tabs.orders_empty_title')}
            message={t('users:detail.tabs.orders_empty_hint')}
          />
        </TabsContent>

        <TabsContent value="wallet">
          <ComingSoonCard
            icon={Wallet}
            title={t('users:detail.tabs.wallet_empty_title')}
            message={t('users:detail.tabs.wallet_empty_hint')}
          />
        </TabsContent>

        <TabsContent value="sessions">
          <ComingSoonCard
            icon={Monitor}
            title={t('users:detail.tabs.sessions_empty_title')}
            message={t('users:detail.tabs.sessions_empty_hint')}
          />
        </TabsContent>
      </Tabs>

      <ReasonDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        title={t('users:ban_dialog.title', { name: title })}
        description={t('users:ban_dialog.description', { name: title })}
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
        title={t('users:suspend_dialog.title', { name: title })}
        description={t('users:suspend_dialog.description', { name: title })}
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
        title={t('users:activate_dialog.title', { name: title })}
        description={t('users:activate_dialog.description', { name: title })}
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
        title={t('users:delete_dialog.title', { name: title })}
        description={t('users:delete_dialog.description', { name: title })}
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

function UserHeroCard({ user }: { user: AdminUserDetail }) {
  const { t } = useTranslation()
  const stats: Array<{
    key: 'orders_placed' | 'wallet_balance' | 'stores'
    value: string | null
  }> = [
    { key: 'orders_placed', value: null },
    { key: 'wallet_balance', value: null },
    { key: 'stores', value: format.number(user.stores.length) },
  ]
  return (
    <Card className="gap-4 py-5">
      <CardContent className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <ImagePreview
            src={user.profile_picture}
            alt={displayName(user) || user.phone_number}
            size="lg"
          />
          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-lg font-semibold leading-tight">
              {displayName(user) || t('components:detail.not_available')}
            </h2>
            {user.email ? (
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-1 overflow-hidden rounded-md border border-border bg-muted/30 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                'min-w-0 px-4 py-3 sm:px-5',
                i > 0 && 'border-t border-border sm:border-t-0 sm:border-s',
              )}
            >
              <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t(`users:detail.hero.${s.key}`)}
              </div>
              <div
                className={cn(
                  'mt-1 font-mono text-lg leading-tight font-semibold tabular-nums',
                  s.value == null ? 'text-muted-foreground/60' : 'text-foreground',
                )}
              >
                {s.value ?? '—'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ComingSoonCardProps {
  icon: typeof ShoppingCart
  title: string
  message: string
}

function ComingSoonCard({ icon: Icon, title, message }: ComingSoonCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-[18px]" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}
