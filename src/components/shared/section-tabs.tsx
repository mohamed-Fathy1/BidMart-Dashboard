import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export interface SectionTabItem {
  to: string
  label: string
  active: boolean
  search?: true
}

interface SectionTabsProps {
  tabs: SectionTabItem[]
  ariaLabel: string
  className?: string
}

function segmentClasses(active: boolean) {
  return cn(
    'group/tab relative z-10 inline-flex min-h-9 shrink-0 items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-medium transition-[color,opacity] duration-(--duration-hover) ease-(--ease-default)',
    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
  )
}

function highlightClasses(active: boolean) {
  return cn(
    'pointer-events-none absolute inset-0 rounded-md ring-1 transition-[background-color,box-shadow,opacity] duration-(--duration-hover) ease-(--ease-default)',
    active
      ? 'bg-card opacity-100 shadow-rest ring-border'
      : 'bg-transparent opacity-100 ring-transparent group-hover/tab:bg-muted-foreground/10 group-hover/tab:ring-border',
  )
}

export function SectionTabs({ tabs, ariaLabel, className }: SectionTabsProps) {
  if (tabs.length < 2) return null

  return (
    <div
      className={cn('inline-flex rounded-lg border border-border bg-background p-1', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="relative flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            to={tab.to}
            search={tab.search}
            className={segmentClasses(tab.active)}
            role="tab"
            aria-selected={tab.active}
          >
            <span className={highlightClasses(tab.active)} aria-hidden />
            <span className="relative">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
