import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type RiskLevel = 'low' | 'medium' | 'high'

interface RiskPillProps {
  level: RiskLevel
  className?: string
}

const TONE: Record<RiskLevel, string> = {
  low: 'bg-primary/10 text-primary',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-destructive/10 text-destructive',
}

const DOT: Record<RiskLevel, string> = {
  low: 'bg-primary',
  medium: 'bg-amber-500',
  high: 'bg-destructive',
}

export function RiskPill({ level, className }: RiskPillProps) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE[level],
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', DOT[level])} />
      {t(`components:risk.${level}`)}
    </span>
  )
}
