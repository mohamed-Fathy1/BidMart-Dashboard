import { cn } from '@/lib/utils'

type ProportionBarTone = 'primary' | 'muted' | 'destructive'

interface ProportionBarProps {
  value: number
  max: number
  tone?: ProportionBarTone
  className?: string
}

const TONE_CLASSES: Record<ProportionBarTone, string> = {
  primary: 'bg-primary',
  muted: 'bg-muted-foreground/40',
  destructive: 'bg-destructive',
}

export function ProportionBar({ value, max, tone = 'primary', className }: ProportionBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      aria-hidden
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn(
          'h-full transition-[width] duration-(--duration-layout) ease-(--ease-sidebar)',
          TONE_CLASSES[tone],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
