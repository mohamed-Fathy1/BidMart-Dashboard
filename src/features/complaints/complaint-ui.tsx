import type { TFunction } from 'i18next'
import type { ComplaintStatus } from '@/types/api'
import { cn } from '@/lib/utils'

const SIZE_CLASSES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
  xl: 'size-14 text-base',
} as const

type AvatarSize = keyof typeof SIZE_CLASSES

interface InitialAvatarProps {
  name: string | null | undefined
  size?: AvatarSize
  tone?: 'neutral' | 'primary'
  className?: string
  title?: string
}

export function InitialAvatar({
  name,
  size = 'md',
  tone = 'neutral',
  className,
  title,
}: InitialAvatarProps) {
  const initials = getInitials(name)
  return (
    <span
      title={title ?? name ?? undefined}
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight ring-1 ring-inset',
        SIZE_CLASSES[size],
        tone === 'primary'
          ? 'bg-primary/10 text-primary ring-primary/20'
          : 'bg-stone-100 text-stone-700 ring-stone-200/70',
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '#'
  const cleaned = name.trim()
  if (!cleaned) return '#'
  const parts = cleaned.split(/\s+/).slice(0, 2)
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? '').join('')
  return letters || cleaned[0]?.toUpperCase() || '#'
}

export function shortComplaintId(id: string): string {
  return `#${id.slice(0, 8)}`
}

/**
 * Compact human-readable wait time from an ISO timestamp.
 * "12m" / "3h" / "2d 4h" / "9d". Tone helper below maps to color.
 */
export function formatWaitDuration(iso: string, t: TFunction): string {
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return ''
  const diff = Math.max(0, Date.now() - ts)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return t('complaints:wait.just_now')
  if (minutes < 60) return t('complaints:wait.minutes', { value: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('complaints:wait.hours', { value: hours })
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours > 0
    ? t('complaints:wait.days_hours', { days, hours: remHours })
    : t('complaints:wait.days', { value: days })
}

export type WaitTone = 'cool' | 'warm' | 'hot'

export function waitTone(iso: string): WaitTone {
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return 'cool'
  const hours = (Date.now() - ts) / 3_600_000
  if (hours >= 72) return 'hot'
  if (hours >= 24) return 'warm'
  return 'cool'
}

const STATUS_TINTS: Record<
  ComplaintStatus,
  { rowStripe: string; bandBg: string; bandText: string; bandRing: string }
> = {
  UNDER_REVIEW: {
    rowStripe: 'bg-amber-500',
    bandBg: 'bg-amber-50/60',
    bandText: 'text-amber-900',
    bandRing: 'ring-amber-200/70',
  },
  IN_PROGRESS: {
    rowStripe: 'bg-blue-500',
    bandBg: 'bg-blue-50/60',
    bandText: 'text-blue-900',
    bandRing: 'ring-blue-200/70',
  },
  RESOLVED: {
    rowStripe: 'bg-emerald-500',
    bandBg: 'bg-emerald-50/60',
    bandText: 'text-emerald-900',
    bandRing: 'ring-emerald-200/70',
  },
  REJECTED: {
    rowStripe: 'bg-red-500',
    bandBg: 'bg-red-50/60',
    bandText: 'text-red-900',
    bandRing: 'ring-red-200/70',
  },
}

export function complaintStatusTint(status: ComplaintStatus) {
  return STATUS_TINTS[status]
}

