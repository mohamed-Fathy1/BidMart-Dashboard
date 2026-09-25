import { cn } from '@/lib/utils'

interface ProportionBarProps {
  value: number
  max: number
  className?: string
}

export function ProportionBar({ value, max, className }: ProportionBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      aria-hidden
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className="h-full bg-primary transition-[width] duration-(--duration-layout) ease-(--ease-sidebar)"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
