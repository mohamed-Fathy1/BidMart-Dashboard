import { useEffect, useRef, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  CircleDot,
  CreditCard,
  Package,
  RotateCcw,
  Truck,
  Undo2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/permissions/can'
import { DetailField } from '@/components/shared/detail-field'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Timeline, type TimelineItem, type TimelineTone } from '@/components/shared/timeline'
import type { ApiRejection } from '@/lib/axios'
import { format } from '@/lib/format'
import { i18n } from '@/lib/i18n'
import { PERMISSIONS } from '@/lib/permissions'
import { useOrderDrilldownQuery } from '@/features/reports/reports.queries'
import type { OrderDrilldown, OrderHistoryStep } from '@/types/api'

interface OrderDetailSheetProps {
  orderId: string | undefined
  onClose: () => void
}

const HISTORY_STEP_META: Record<OrderHistoryStep, { icon: LucideIcon; tone: TimelineTone }> = {
  CREATED:         { icon: CircleDot, tone: 'neutral' },
  PAID:            { icon: CreditCard, tone: 'positive' },
  PROCESSING:      { icon: Package, tone: 'info' },
  SHIPPED:         { icon: Truck, tone: 'info' },
  DELIVERED:       { icon: CheckCircle2, tone: 'positive' },
  CANCELLED:       { icon: XCircle, tone: 'danger' },
  REFUND_REQUESTED: { icon: RotateCcw, tone: 'warning' },
  REFUNDED:        { icon: Undo2, tone: 'accent' },
}

export function OrderDetailSheet({ orderId, onClose }: OrderDetailSheetProps) {
  const { t } = useTranslation()
  const { data, isPending, error, refetch } = useOrderDrilldownQuery(orderId)

  // `orderId` is already cleared when the close animation ends, so keep the
  // last one to find the row that opened the sheet.
  const lastOrderId = useRef(orderId)
  useEffect(() => {
    if (orderId) lastOrderId.current = orderId
  }, [orderId])

  const requestError = error as ApiRejection | null
  const notFound =
    requestError?.code === 'ORDER_NOT_FOUND' || requestError?.status === 404

  return (
    <Sheet
      open={!!orderId}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side={i18n.dir() === 'rtl' ? 'left' : 'right'}
        className="w-full gap-0 overflow-y-auto bg-card sm:max-w-xl"
        onCloseAutoFocus={(event) => {
          const id = lastOrderId.current
          const row = id
            ? document.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(id)}"]`)
            : null
          if (!row) return
          event.preventDefault()
          row.focus()
        }}
      >
        {isPending ? (
          <>
            <SheetHeader>
              <SheetTitle>
                <span className="sr-only">{t('reports:order_detail.loading')}</span>
                <Skeleton className="h-6 w-40" />
              </SheetTitle>
              <SheetDescription className="sr-only">
                {t('reports:order_detail.description')}
              </SheetDescription>
              <Skeleton className="h-4 w-56" />
            </SheetHeader>
            <div className="space-y-4 px-6 pb-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </>
        ) : requestError ? (
          <>
            <SheetTitle className="sr-only">
              {notFound ? t('reports:order_detail.not_found') : t('reports:common.load_failed')}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t('reports:order_detail.description')}
            </SheetDescription>
            {notFound ? (
              <EmptyState
                title={t('reports:order_detail.not_found')}
                message={t('reports:order_detail.not_found_hint')}
                actionLabel={t('reports:order_detail.close')}
                onAction={onClose}
              />
            ) : (
              <EmptyState
                message={t('reports:common.load_failed')}
                actionLabel={t('reports:common.retry')}
                onAction={() => {
                  void refetch()
                }}
              />
            )}
          </>
        ) : data ? (
          <>
            <SheetHeader className="px-6 pt-6 pb-5">
              <SheetTitle className="flex flex-wrap items-center gap-2 pe-8 text-lg">
                <Trans
                  i18nKey="reports:order_detail.title"
                  values={{ number: data.orderNumber }}
                  components={{ number: <span className="font-mono tabular-nums" /> }}
                />
                <StatusBadge type="orderStatus" status={data.status} />
              </SheetTitle>
              <SheetDescription>{t('reports:order_detail.description')}</SheetDescription>
              <dl className="mt-3 grid grid-cols-3 gap-4">
                <DetailField
                  label={t('reports:order_detail.fields.sale_type')}
                  value={t(`reports:sale_type.${data.saleType}`, { defaultValue: data.saleType })}
                />
                <DetailField
                  label={t('reports:order_detail.fields.created_at')}
                  value={format.dateTime(data.createdAt)}
                />
                <DetailField
                  label={t('reports:order_detail.fields.paid_at')}
                  value={
                    data.paidAt ? (
                      format.dateTime(data.paidAt)
                    ) : (
                      <span className="text-muted-foreground">
                        {t('reports:order_detail.fields.never_paid')}
                      </span>
                    )
                  }
                />
              </dl>
            </SheetHeader>
            <OrderDetailSheetBody data={data} />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

interface OrderDetailSheetBodyProps {
  data: OrderDrilldown
}

function OrderDetailSheetBody({ data }: OrderDetailSheetBodyProps) {
  const { t } = useTranslation()
  const money = (value: number) => format.currency(value, { currency: data.money.currencyCode })

  const historyItems: TimelineItem[] = data.statusHistory.map((entry, index) => {
    // A step the client does not know yet still renders, as a neutral event.
    const meta = HISTORY_STEP_META[entry.step] ?? { icon: CircleDot, tone: 'neutral' as const }
    return {
      id: `${entry.step}-${index}`,
      icon: meta.icon,
      tone: meta.tone,
      title: t(`reports:history_step.${entry.step}`, { defaultValue: entry.step }),
      at: entry.at,
    }
  })

  return (
    <div className="divide-y divide-border border-t border-border">
      <SheetSection title={t('reports:order_detail.sections.money')}>
        <dl className="space-y-2 text-sm">
          <LedgerRow label={t('reports:order_detail.fields.subtotal')} value={money(data.money.subtotal)} />
          <LedgerRow
            label={t('reports:order_detail.fields.discount')}
            value={money(data.money.discountAmount > 0 ? -data.money.discountAmount : 0)}
            quiet={data.money.discountAmount === 0}
          />
          <LedgerRow
            label={t('reports:order_detail.fields.shipping')}
            value={money(data.money.shippingFee)}
            quiet={data.money.shippingFee === 0}
          />
          <LedgerRow
            label={t('reports:order_detail.fields.tax')}
            value={money(data.money.taxAmount)}
            quiet={data.money.taxAmount === 0}
          />
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <dt className="font-medium text-foreground">{t('reports:order_detail.fields.total')}</dt>
            <dd className="text-base font-semibold tabular-nums text-foreground">
              {money(data.money.total)}
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-xs font-medium text-muted-foreground">
          {t('reports:order_detail.split')}
        </p>
        <dl className="mt-2 space-y-2 text-sm">
          <LedgerRow
            label={t('reports:order_detail.fields.commission')}
            value={money(data.money.commissionAmount)}
          />
          <LedgerRow
            label={t('reports:order_detail.fields.seller_net')}
            value={money(data.money.sellerNet)}
          />
        </dl>
      </SheetSection>

      {data.refund !== null && (
        <SheetSection title={t('reports:order_detail.sections.refund')}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField
              label={t('reports:order_detail.fields.refund_status')}
              value={t(`reports:refund_status.${data.refund.status}`, {
                defaultValue: data.refund.status,
              })}
            />
            <DetailField
              label={t('reports:order_detail.fields.refund_amount')}
              value={
                data.refund.refundAmount === null ? (
                  <span className="text-muted-foreground">
                    {t('reports:order_detail.fields.refund_not_agreed')}
                  </span>
                ) : (
                  <span className="tabular-nums">{money(data.refund.refundAmount)}</span>
                )
              }
            />
            <DetailField
              label={t('reports:order_detail.fields.requested_at')}
              value={format.dateTime(data.refund.requestedAt)}
            />
            <DetailField
              label={t('reports:order_detail.fields.resolved_at')}
              value={
                data.refund.resolvedAt === null ? (
                  <span className="text-muted-foreground">
                    {t('reports:order_detail.fields.unresolved')}
                  </span>
                ) : (
                  format.dateTime(data.refund.resolvedAt)
                )
              }
            />
          </dl>
        </SheetSection>
      )}

      <SheetSection title={t('reports:order_detail.sections.history')}>
        <Timeline items={historyItems} emptyLabel={t('reports:order_detail.history_empty')} />
      </SheetSection>

      <SheetSection
        title={t('reports:order_detail.sections.customer')}
        action={
          <Can permission={PERMISSIONS.users.view}>
            <Button variant="link" size="sm" className="h-auto px-0" asChild>
              <Link to="/users/$userId" params={{ userId: data.customer.id }}>
                {t('reports:common.view_customer')}
              </Link>
            </Button>
          </Can>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          {data.customer.fullName && (
            <DetailField label={t('reports:order_detail.fields.full_name')} value={data.customer.fullName} />
          )}
          <DetailField
            label={t('reports:order_detail.fields.username')}
            value={<bdi dir="ltr">@{data.customer.username}</bdi>}
          />
          <DetailField label={t('reports:order_detail.fields.email')} value={data.customer.email} />
          <DetailField
            label={t('reports:order_detail.fields.phone')}
            value={data.customer.phoneNumber && <bdi className="tabular-nums">{data.customer.phoneNumber}</bdi>}
          />
        </dl>
      </SheetSection>

      <SheetSection
        title={t('reports:order_detail.sections.store')}
        action={
          <Can permission={PERMISSIONS.users.view}>
            <Button variant="link" size="sm" className="h-auto px-0" asChild>
              <Link to="/users/$userId" params={{ userId: data.store.sellerId }}>
                {t('reports:common.view_seller')}
              </Link>
            </Button>
          </Can>
        }
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={data.store.profilePicture ?? undefined} />
            <AvatarFallback>{data.store.storeName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{data.store.storeName}</p>
            <p className="truncate text-xs text-muted-foreground">
              <bdi dir="ltr">@{data.store.username}</bdi>
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
          {data.store.productImage ? (
            <img
              src={data.store.productImage}
              alt=""
              className="size-12 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span aria-hidden className="size-12 shrink-0 rounded-md bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground" title={data.store.productTitle}>
              {data.store.productTitle}
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              {t('reports:order_detail.quantity_times_price', {
                quantity: data.store.quantity,
                price: money(data.store.unitPrice),
              })}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
            {money(data.store.amount)}
          </p>
        </div>
      </SheetSection>
    </div>
  )
}

interface SheetSectionProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

function SheetSection({ title, action, children }: SheetSectionProps) {
  return (
    <section className="px-6 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

interface LedgerRowProps {
  label: string
  value: string
  /** Zero lines recede so the amounts that moved the total stand out. */
  quiet?: boolean
}

function LedgerRow({ label, value, quiet = false }: LedgerRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={quiet ? 'tabular-nums text-muted-foreground' : 'tabular-nums text-foreground'}>
        {value}
      </dd>
    </div>
  )
}
