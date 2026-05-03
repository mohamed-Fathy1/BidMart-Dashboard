import { useEffect, useMemo, useState } from 'react'
import { Link, useMatchRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { ChevronsLeft, ChevronsRight, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { can, usePermission, type Permission } from '@/lib/permissions'
import { useAuthStore } from '@/features/auth/auth.store'
import { useUIStore } from '@/features/ui/ui.store'
import {
  navSections,
  type NavLeaf,
  type NavGroup,
  type NavEntry,
  type NavSection,
} from '@/components/layout/nav-items'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function NavLink({ item, collapsed }: { item: NavLeaf; collapsed: boolean }) {
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
              'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)] border border-transparent',
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5 hover:border-border',
            )}
          >
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

function NavChildLink({ item }: { item: NavLeaf }) {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = isChildActive(item.to, pathname)

  return (
    <Link
      to={item.to}
      className={cn(
        'group/child relative flex h-9 items-center gap-3 rounded-[var(--radius-md)] ps-9 pe-3 text-sm',
        'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]',
        isActive
          ? 'text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-block-0 inset-inline-start-0 inset-inline-end-0 rounded-[var(--radius-md)]',
          'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]',
          isActive
            ? 'bg-primary/10'
            : 'bg-transparent group-hover/child:bg-muted-foreground/10',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'relative z-[1] inline-block size-1.5 rounded-full shrink-0',
          'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]',
          isActive ? 'bg-primary' : 'bg-muted-foreground/40',
        )}
        style={{ marginInlineStart: '-12px' }}
      />
      <span className="relative z-[1] whitespace-nowrap">{t(item.labelKey)}</span>
    </Link>
  )
}

// Sub-categories live at two paths: the hub `/categories/sub-categories` and the
// nested drill-down `/categories/<id>/sub-categories`. Both should light the same
// child row. Categories child must NOT light when the URL is one of those.
function isChildActive(to: string, pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (to === '/categories/sub-categories') {
    return (
      normalized === '/categories/sub-categories' ||
      /^\/categories\/[^/]+\/sub-categories$/.test(normalized)
    )
  }
  if (to === '/categories') {
    return normalized === '/categories'
  }
  return normalized === to
}

function NavGroupItem({
  group,
  visibleChildren,
  collapsed,
}: {
  group: NavGroup
  visibleChildren: NavLeaf[]
  collapsed: boolean
}) {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()
  const navigate = useNavigate()
  const Icon = group.icon
  const hasActiveChild = !!matchRoute({ to: group.matchPath, fuzzy: true })
  const [open, setOpen] = useState(hasActiveChild)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    if (hasActiveChild) setOpen(true)
  }, [hasActiveChild])

  useEffect(() => {
    setTooltipOpen(false)
  }, [collapsed])

  function handleClick() {
    if (collapsed) {
      navigate({ to: group.defaultTo })
    } else {
      setOpen((v) => !v)
    }
  }

  return (
    <div>
      <Tooltip
        delayDuration={0}
        open={collapsed ? tooltipOpen : false}
        onOpenChange={(next) => {
          if (collapsed) setTooltipOpen(next)
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
            <button
              type="button"
              onClick={handleClick}
              aria-expanded={collapsed ? undefined : open}
              aria-controls={collapsed ? undefined : `navgroup-${group.matchPath}`}
              className={cn(
                'group/group relative flex h-10 w-full items-center gap-3 rounded-[var(--radius-md)] ps-3 pe-3 text-sm font-medium text-start',
                'transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)] border border-transparent',
                hasActiveChild
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5 hover:border-border',
              )}
            >
              {/* animated bg span — inlineSize transitions with sidebar width */}
              <span
                className={cn(
                  'pointer-events-none absolute inset-block-0 inset-inline-start-0 rounded-[var(--radius-md)]',
                  hasActiveChild
                    ? 'bg-primary/10'
                    : 'bg-transparent group-hover/group:bg-muted-foreground/10',
                )}
                style={{
                  inlineSize: collapsed
                    ? 'calc(var(--sidebar-collapsed-width) - 24px)'
                    : '100%',
                  transition:
                    'inline-size var(--duration-layout) var(--ease-sidebar), background-color var(--duration-hover) var(--ease-default)',
                }}
              />
              {/* active edge bar */}
              <span
                className={cn(
                  'absolute -start-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-e-full bg-primary',
                  'transition-all duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                  hasActiveChild ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0',
                )}
              />
              <Icon className="relative z-[1] h-[18px] w-[18px] shrink-0" />
              <span
                className={cn(
                  'relative z-[1] flex-1 whitespace-nowrap',
                  'transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                  collapsed ? 'opacity-0' : 'opacity-100',
                )}
              >
                {t(group.labelKey)}
              </span>
              <ChevronRight
                className={cn(
                  'relative z-[1] h-4 w-4 shrink-0 text-muted-foreground/70',
                  'transition-[transform,opacity] duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
                  'rtl:rotate-180',
                  open && !collapsed && 'rotate-90 rtl:rotate-90',
                  collapsed ? 'opacity-0' : 'opacity-100',
                )}
              />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="data-[state=delayed-open]:animate-tooltip-in data-[state=instant-open]:animate-tooltip-in data-[state=closed]:animate-tooltip-out"
        >
          {t(group.labelKey)}
        </TooltipContent>
      </Tooltip>

      {/* Children — always mounted; animated by grid-template-rows + opacity */}
      <div
        id={`navgroup-${group.matchPath}`}
        className="grid overflow-hidden"
        style={{
          gridTemplateRows: !collapsed && open ? '1fr' : '0fr',
          opacity: !collapsed && open ? 1 : 0,
          transition:
            'grid-template-rows var(--duration-layout) var(--ease-sidebar), opacity var(--duration-layout) var(--ease-sidebar)',
        }}
      >
        <div className="min-h-0">
          <div className="space-y-1 pt-1">
            {visibleChildren.map((child) => (
              <NavChildLink key={child.to} item={child} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilteredEntry({ entry, collapsed }: { entry: NavEntry; collapsed: boolean }) {
  if (entry.kind === 'leaf') {
    return entry.permission ? (
      <PermissionLeaf item={entry} permission={entry.permission} collapsed={collapsed} />
    ) : (
      <NavLink item={entry} collapsed={collapsed} />
    )
  }
  return <FilteredGroup group={entry} collapsed={collapsed} />
}

function PermissionLeaf({
  item,
  permission,
  collapsed,
}: {
  item: NavLeaf
  permission: Permission
  collapsed: boolean
}) {
  const ok = usePermission(permission)
  if (!ok) return null
  return <NavLink item={item} collapsed={collapsed} />
}

function FilteredGroup({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const visibleChildren = useVisibleChildren(group.children)
  if (visibleChildren.length === 0) return null
  if (visibleChildren.length === 1) {
    const only = visibleChildren[0]!
    return <NavLink item={only} collapsed={collapsed} />
  }
  return <NavGroupItem group={group} visibleChildren={visibleChildren} collapsed={collapsed} />
}

function useVisibleChildren(children: NavLeaf[]): NavLeaf[] {
  const permissions = useAuthStore((s) => s.permissions)
  return useMemo(
    () => children.filter((c) => !c.permission || can(permissions, c.permission)),
    [children, permissions],
  )
}

function Section({ section, collapsed, isFirst }: { section: NavSection; collapsed: boolean; isFirst: boolean }) {
  return (
    <div
      className={cn(
        'space-y-1',
        !isFirst && 'pt-3 border-t border-border/50',
        section.pinBottom ? 'mt-auto' : !isFirst && 'mt-3',
      )}
    >
      {section.entries.map((entry, i) => (
        <FilteredEntry key={`${section.id}-${i}`} entry={entry} collapsed={collapsed} />
      ))}
    </div>
  )
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
      <div
        className="flex h-full flex-col"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3">
          {navSections.map((section, i) => (
            <Section
              key={section.id}
              section={section}
              collapsed={collapsed}
              isFirst={i === 0}
            />
          ))}
        </nav>

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
