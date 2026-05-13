import {
  AlertTriangle,
  Bell,
  Flag,
  Mail,
  Package,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type NotificationKind = 'pending' | 'info' | 'alert'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  icon: LucideIcon
  titleKey: string
  subtitleKey: string
  when: string
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    kind: 'pending',
    icon: Wallet,
    titleKey: 'shell:notifications.items.withdrawal_review.title',
    subtitleKey: 'shell:notifications.items.withdrawal_review.subtitle',
    when: '2m',
  },
  {
    id: '2',
    kind: 'info',
    icon: Package,
    titleKey: 'shell:notifications.items.provider_verification.title',
    subtitleKey: 'shell:notifications.items.provider_verification.subtitle',
    when: '14m',
  },
  {
    id: '3',
    kind: 'alert',
    icon: AlertTriangle,
    titleKey: 'shell:notifications.items.stream_flagged.title',
    subtitleKey: 'shell:notifications.items.stream_flagged.subtitle',
    when: '22m',
  },
  {
    id: '4',
    kind: 'alert',
    icon: Flag,
    titleKey: 'shell:notifications.items.complaint_escalated.title',
    subtitleKey: 'shell:notifications.items.complaint_escalated.subtitle',
    when: '1h',
  },
  {
    id: '5',
    kind: 'info',
    icon: Mail,
    titleKey: 'shell:notifications.items.daily_digest.title',
    subtitleKey: 'shell:notifications.items.daily_digest.subtitle',
    when: '4h',
  },
]

export const NOTIFICATIONS_FALLBACK_ICON: LucideIcon = Bell
