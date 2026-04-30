import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type AccountStatus = 'active' | 'suspended' | 'banned' | 'pending_verification' | 'deleted'
type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type VerificationStatus = 'pending' | 'approved' | 'rejected'
type AccountType = 'user_only' | 'upgraded_to_seller'

interface AccountBadgeProps {
  type?: 'account'
  status: AccountStatus
  className?: string
}

interface SellerBadgeProps {
  type: 'seller'
  status: SellerStatus
  className?: string
}

interface ApplicationBadgeProps {
  type: 'application'
  status: ApplicationStatus
  className?: string
}

interface VerificationBadgeProps {
  type: 'verification'
  status: VerificationStatus
  className?: string
}

interface BooleanBadgeProps {
  type: 'boolean'
  status: 'true' | 'false'
  className?: string
}

interface AccountTypeBadgeProps {
  type: 'accountType'
  status: AccountType
  className?: string
}

type StatusBadgeProps =
  | AccountBadgeProps
  | SellerBadgeProps
  | ApplicationBadgeProps
  | VerificationBadgeProps
  | BooleanBadgeProps
  | AccountTypeBadgeProps

interface StatusStyle {
  badge: string
  dot: string
}

/* ------------------------------------------------------------------ */
/*  Unified color palette — one color per semantic state               */
/*  positive = emerald, warning = amber, danger = red, neutral = stone */
/* ------------------------------------------------------------------ */

const positive: StatusStyle = { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
const warning: StatusStyle  = { badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' }
const danger: StatusStyle   = { badge: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500' }
const neutral: StatusStyle  = { badge: 'bg-stone-100 text-stone-500 border-stone-200',       dot: 'bg-stone-400' }

const accountStyles: Record<AccountStatus, StatusStyle> = {
  active:               positive,
  suspended:            warning,
  banned:               danger,
  pending_verification: warning,
  deleted:              neutral,
}

const sellerStyles: Record<SellerStatus, StatusStyle> = {
  PENDING:   warning,
  APPROVED:  positive,
  REJECTED:  danger,
  SUSPENDED: warning,
}

const applicationStyles: Record<ApplicationStatus, StatusStyle> = {
  PENDING:  warning,
  APPROVED: positive,
  REJECTED: danger,
}

const verificationStyles: Record<VerificationStatus, StatusStyle> = {
  pending:  warning,
  approved: positive,
  rejected: danger,
}

const booleanStyles: Record<'true' | 'false', StatusStyle> = {
  true:  positive,
  false: neutral,
}

const accountTypeStyles: Record<AccountType, StatusStyle> = {
  user_only:          neutral,
  upgraded_to_seller: positive,
}

const fallbackStyle: StatusStyle = neutral

function getStyle(status: string, type: StatusBadgeProps['type']): StatusStyle {
  switch (type) {
    case 'seller':
      return sellerStyles[status as SellerStatus] ?? fallbackStyle
    case 'application':
      return applicationStyles[status as ApplicationStatus] ?? fallbackStyle
    case 'verification':
      return verificationStyles[status as VerificationStatus] ?? fallbackStyle
    case 'boolean':
      return booleanStyles[status as 'true' | 'false'] ?? fallbackStyle
    case 'accountType':
      return accountTypeStyles[status as AccountType] ?? fallbackStyle
    case 'account':
    default:
      return accountStyles[status as AccountStatus] ?? fallbackStyle
  }
}

function getI18nKey(status: string, type: StatusBadgeProps['type']): string {
  if (type === 'boolean') {
    return status === 'true' ? 'components:status.enabled' : 'components:status.disabled'
  }
  return `components:status.${status}`
}

export function StatusBadge({ status, type = 'account', className }: StatusBadgeProps) {
  const { t } = useTranslation()
  const style = getStyle(status, type)

  return (
    <span
      data-slot="status-badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {t(getI18nKey(status, type))}
    </span>
  )
}
