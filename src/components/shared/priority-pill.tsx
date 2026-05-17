import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type PriorityLevel = 'low' | 'medium' | 'high'

interface PriorityPillProps {
  level: PriorityLevel
  className?: string
}

const TONE: Record<PriorityLevel, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-destructive/10 text-destructive',
}

export function PriorityPill({ level, className }: PriorityPillProps) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap capitalize',
        TONE[level],
        className,
      )}
    >
      {t(`components:priority.${level}`)}
    </span>
  )
}
