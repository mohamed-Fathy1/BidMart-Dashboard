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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailCard } from '@/components/shared/detail-card'
import { DetailField } from '@/components/shared/detail-field'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Timeline, type TimelineItem, type TimelineTone } from '@/components/shared/timeline'
import type { ApiRejection } from '@/lib/axios'
import { format } from '@/lib/format'
import { i18n } from '@/lib/i18n'
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
        className="w-full overflow-y-auto sm:max-w-xl"
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
            <div className="space-y-4 px-4 pb-6">
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
            <SheetHeader>
              <SheetTitle className="flex flex-wrap items-center gap-2">
                <Trans
                  i18nKey="reports:order_detail.title"
                  values={{ number: data.orderNumber }}
                  components={{ number: <span className="font-mono tabular-nums" /> }}
                />
                <StatusBadge type="orderStatus" status={data.status} />
              </SheetTitle>
              <SheetDescription>{t('reports:order_detail.description')}</SheetDescription>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {t('reports:order_detail.fields.sale_type')}
                  <span className="text-foreground">
                    {' '}
                    {t(`reports:sale_type.${data.saleType}`, { defaultValue: data.saleType })}
                  </span>
                </span>
                <span>
                  {t('reports:order_detail.fields.created_at')}
                  <span className="font-mono tabular-nums text-foreground">
                    {' '}
                    {format.dateTime(data.createdAt)}
                  </span>
                </span>
                <span>
                  {t('reports:order_detail.fields.paid_at')}
                  {data.paidAt ? (
                    <span className="font-mono tabular-nums text-foreground">
                      {' '}
                      {format.dateTime(data.paidAt)}
                    </span>
                  ) : (
                    <span> {t('reports:order_detail.fields.never_paid')}</span>
                  )}
                </span>
              </p>
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
  const muted = (text: string) => <span className="text-muted-foreground">{text}</span>

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
    <div className="space-y-4 px-4 pb-6">
      <DetailCard
        title={t('reports:order_detail.sections.customer')}
        columns={2}
        actions={
          <Button variant="link" size="sm" asChild>
            <Link to="/users/$userId" params={{ userId: data.customer.id }}>
              {t('reports:common.view_customer')}
            </Link>
          </Button>
        }
      >
        {data.customer.fullName && (
          <DetailField label={t('reports:order_detail.fields.full_name')} value={data.customer.fullName} />
        )}
        <DetailField label={t('reports:order_detail.fields.username')} value={`@${data.customer.username}`} mono />
        <DetailField label={t('reports:order_detail.fields.email')} value={data.customer.email} />
        <DetailField label={t('reports:order_detail.fields.phone')} value={data.customer.phoneNumber} mono />
      </DetailCard>

      <DetailCard
        title={t('reports:order_detail.sections.store')}
        columns={2}
        actions={
          <Button variant="link" size="sm" asChild>
            <Link to="/users/$userId" params={{ userId: data.store.sellerId }}>
              {t('reports:common.view_seller')}
            </Link>
          </Button>
        }
      >
        <div className="flex items-center gap-3 sm:col-span-2">
          <Avatar>
            <AvatarImage src={data.store.profilePicture ?? undefined} />
            <AvatarFallback>{data.store.storeName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{data.store.storeName}</p>
            <p className="font-mono text-xs text-muted-foreground">@{data.store.username}</p>
          </div>
        </div>
        <DetailField
          label={t('reports:order_detail.fields.product')}
          span={2}
          value={
            <span className="flex items-center gap-3">
              {data.store.productImage && (
                <img
                  src={data.store.productImage}
                  alt={data.store.productTitle}
                  className="size-12 rounded-md object-cover"
                />
              )}
              <span className="min-w-0">{data.store.productTitle}</span>
            </span>
          }
        />
        <DetailField label={t('reports:order_detail.fields.quantity')} value={format.number(data.store.quantity)} mono />
        <DetailField label={t('reports:order_detail.fields.unit_price')} value={money(data.store.unitPrice)} mono />
        <DetailField label={t('reports:order_detail.fields.goods')} value={money(data.store.amount)} mono />
      </DetailCard>

      <DetailCard title={t('reports:order_detail.sections.money')} columns={2}>
        <DetailField label={t('reports:order_detail.fields.subtotal')} value={money(data.money.subtotal)} mono />
        <DetailField label={t('reports:order_detail.fields.discount')} value={money(data.money.discountAmount)} mono />
        <DetailField label={t('reports:order_detail.fields.shipping')} value={money(data.money.shippingFee)} mono />
        <DetailField label={t('reports:order_detail.fields.tax')} value={money(data.money.taxAmount)} mono />
        <DetailField label={t('reports:order_detail.fields.commission')} value={money(data.money.commissionAmount)} mono />
        <DetailField
          label={t('reports:order_detail.fields.total')}
          mono
          value={<span className="font-semibold">{money(data.money.total)}</span>}
        />
        <DetailField label={t('reports:order_detail.fields.seller_net')} value={money(data.money.sellerNet)} mono />
      </DetailCard>

      <DetailCard title={t('reports:order_detail.sections.refund')} columns={2}>
        {data.refund === null ? (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            {t('reports:order_detail.no_refund')}
          </p>
        ) : (
          <>
            <DetailField
              label={t('reports:order_detail.fields.refund_status')}
              value={t(`reports:refund_status.${data.refund.status}`, {
                defaultValue: data.refund.status,
              })}
            />
            <DetailField
              label={t('reports:order_detail.fields.refund_amount')}
              mono
              value={
                data.refund.refundAmount === null
                  ? muted(t('reports:order_detail.fields.refund_not_agreed'))
                  : money(data.refund.refundAmount)
              }
            />
            <DetailField
              label={t('reports:order_detail.fields.requested_at')}
              value={format.dateTime(data.refund.requestedAt)}
              mono
            />
            <DetailField
              label={t('reports:order_detail.fields.resolved_at')}
              mono
              value={
                data.refund.resolvedAt === null
                  ? muted(t('reports:order_detail.fields.unresolved'))
                  : format.dateTime(data.refund.resolvedAt)
              }
            />
          </>
        )}
      </DetailCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-[length:var(--type-h3-size)] font-[number:var(--type-h3-weight)]">
            {t('reports:order_detail.sections.history')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline items={historyItems} emptyLabel={t('reports:order_detail.history_empty')} />
        </CardContent>
      </Card>
    </div>
  )
}
