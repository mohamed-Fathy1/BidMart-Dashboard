import { useEffect, useState } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { usePermission } from '@/lib/permissions'
import { useUIStore } from '@/features/ui/ui.store'
import { navItems, type NavItem } from '@/components/layout/nav-items'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()
  const isActive = !!matchRoute({ to: item.to, fuzzy: true })
  const Icon = item.icon
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    setTooltipOpen(false)
  }, [collapsed])

  return (
    <Tooltip
      delayDuration={0}
      open={collapsed ? tooltipOpen : false}
      onOpenChange={(open) => {
        if (collapsed) setTooltipOpen(open)
      }}
    >
      <TooltipTrigger asChild>
        <div
          className="overflow-visible"
          style={{
            width: collapsed
              ? 'calc(var(--sidebar-collapsed-width) - 24px)'
              : '100%',
            transition: 'width var(--duration-layout) var(--ease-sidebar)',
          }}
        >
          <Link
            to={item.to}
            className={cn(
              'group/link relative flex h-10 items-center gap-3 rounded-[var(--radius-md)] ps-3 pe-3 text-sm font-medium',
              'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]',
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            {/* Animated background — separate span so it shrinks independently of content */}
            <span
              className={cn(
                'pointer-events-none absolute inset-block-0 inset-inline-start-0 rounded-[var(--radius-md)]',
                isActive
                  ? 'bg-primary/10'
                  : 'bg-transparent group-hover/link:bg-muted-foreground/10',
              )}
              style={{
                inlineSize: collapsed
                  ? 'calc(var(--sidebar-collapsed-width) - 24px)'
                  : '100%',
                transition:
                  'inline-size var(--duration-layout) var(--ease-sidebar), background-color var(--duration-hover) var(--ease-default)',
              }}
            />
            {/* Active indicator at sidebar edge */}
            <span
              className={cn(
                'absolute -start-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-e-full bg-primary',
                'transition-all duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0',
              )}
            />
            <Icon className="relative z-[1] h-[18px] w-[18px] shrink-0" />
            <span
              className={cn(
                'relative z-[1] whitespace-nowrap',
                'transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                collapsed ? 'opacity-0' : 'opacity-100',
              )}
            >
              {t(item.labelKey)}
            </span>
          </Link>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="data-[state=delayed-open]:animate-tooltip-in data-[state=instant-open]:animate-tooltip-in data-[state=closed]:animate-tooltip-out"
      >
        {t(item.labelKey)}
      </TooltipContent>
    </Tooltip>
  )
}

function FilteredNavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const hasPermission = usePermission(item.permission ?? ('settings.edit' as const))
  if (item.permission && !hasPermission) return null
  return <NavLink item={item} collapsed={collapsed} />
}

export function Sidebar() {
  const { t } = useTranslation()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className="fixed inset-inline-start-0 z-30 overflow-hidden bg-sidebar-background"
      style={{
        top: 'var(--topbar-height)',
        bottom: 0,
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        transition: 'width var(--duration-layout) var(--ease-sidebar)',
      }}
    >
      {/* Inner wrapper at full width — prevents text reflow during transition */}
      <div
        className="flex h-full flex-col"
        style={{ width: 'var(--sidebar-width)' }}
      >


        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          {navItems.map((item) => (
            <FilteredNavLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border/50 p-3">
          <button
            onClick={toggleSidebar}
            className={cn(
              'group/toggle relative flex h-9 w-full items-center gap-2 rounded-[var(--radius-md)] ps-3 pe-3 text-xs font-medium text-muted-foreground',
              'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]',
              'hover:text-foreground hover:bg-muted-foreground/6',
            )}
            aria-label={t(collapsed ? 'shell:sidebar.expand' : 'shell:sidebar.collapse')}
          >
            <span
              className="pointer-events-none absolute inset-block-0 inset-inline-start-0 rounded-[var(--radius-md)] bg-transparent group-hover/toggle:bg-muted"
              style={{
                inlineSize: collapsed
                  ? 'calc(var(--sidebar-collapsed-width) - 24px)'
                  : '100%',
                transition:
                  'inline-size var(--duration-layout) var(--ease-sidebar), background-color var(--duration-hover) var(--ease-default)',
              }}
            />
            <div className="relative z-[1] h-4 w-4 shrink-0">
              <ChevronsLeft
                className={cn(
                  'absolute inset-0 h-4 w-4 transition-all duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                  collapsed ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100',
                  'rtl:rotate-180 rtl:data-[collapsed=true]:rotate-0',
                )}
              />
              <ChevronsRight
                className={cn(
                  'absolute inset-0 h-4 w-4 transition-all duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                  collapsed ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0',
                  'rtl:rotate-180 rtl:data-[collapsed=true]:rotate-0',
                )}
              />
            </div>
            <span
              className={cn(
                'relative z-[1] whitespace-nowrap',
                'transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                collapsed ? 'opacity-0' : 'opacity-100',
              )}
            >
              {t('shell:sidebar.collapse')}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
