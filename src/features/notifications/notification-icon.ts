import {
  Bell,
  Flag,
  Inbox,
  MessageCircleWarning,
  ShieldCheck,
  Store,
  Trash2,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationType } from '@/types/api'

export type NotificationTint = 'pending' | 'info' | 'alert' | 'success' | 'neutral'

export function iconFor(type: NotificationType): LucideIcon {
  switch (type) {
    case 'NEW_SELLER_APPLICATION':
      return Store
    case 'VERIFICATION_REQUESTED':
      return ShieldCheck
    case 'SETTLEMENT_REQUESTED':
      return Wallet
    case 'CONTACT_MESSAGE_RECEIVED':
      return Inbox
    case 'NEW_COMPLAINT':
      return Flag
    case 'COMPLAINT_MESSAGE':
      return MessageCircleWarning
    case 'ACCOUNT_DELETION_REQUESTED':
      return Trash2
    case 'GENERAL':
    default:
      return Bell
  }
}

export function tintFor(type: NotificationType): NotificationTint {
  switch (type) {
    case 'NEW_SELLER_APPLICATION':
    case 'VERIFICATION_REQUESTED':
    case 'SETTLEMENT_REQUESTED':
    case 'CONTACT_MESSAGE_RECEIVED':
      return 'pending'
    case 'NEW_COMPLAINT':
      return 'alert'
    case 'ACCOUNT_DELETION_REQUESTED':
      return 'alert'
    case 'COMPLAINT_MESSAGE':
      return 'info'
    case 'GENERAL':
    default:
      return 'neutral'
  }
}

export const TINT_CLASS: Record<NotificationTint, string> = {
  pending: 'bg-amber-50 text-amber-700',
  info: 'bg-primary/10 text-primary',
  alert: 'bg-destructive/10 text-destructive',
  success: 'bg-emerald-50 text-emerald-700',
  neutral: 'bg-muted text-muted-foreground',
}
