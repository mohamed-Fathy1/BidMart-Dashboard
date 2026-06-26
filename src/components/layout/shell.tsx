import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/lib/use-media-query'
import { useUIStore } from '@/features/ui/ui.store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen)
  const closeMobileNav = useUIStore((s) => s.closeMobileNav)
  const isDesktop = useIsDesktop()

  // Esc closes the mobile drawer (the scrim only handles pointer dismissal).
  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileNav()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen, closeMobileNav])

  // Crossing into desktop dismisses any open drawer so it can't resurface on a
  // later resize back to mobile.
  useEffect(() => {
    if (isDesktop) closeMobileNav()
  }, [isDesktop, closeMobileNav])

  // Below lg the sidebar is an overlay drawer, so content keeps the full width.
  const contentOffset = isDesktop
    ? collapsed
      ? 'var(--sidebar-collapsed-width)'
      : 'var(--sidebar-width)'
    : '0px'

  return (
    <div className="flex h-screen flex-col bg-sidebar-background">
      <Topbar />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Mobile drawer scrim — above content, below the sidebar + topbar. */}
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={closeMobileNav}
          className={cn(
            'fixed inset-0 z-[var(--z-overlay)] bg-foreground/40 lg:hidden',
            'transition-opacity duration-(--duration-hover) ease-(--ease-default)',
            mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          style={{ top: 'var(--topbar-height)' }}
        />

        <div
          className="flex min-w-0 flex-1 flex-col"
          // While the drawer is open, the content behind the scrim is removed
          // from the tab order + a11y tree (the scrim only blocks pointer input).
          inert={!isDesktop && mobileNavOpen}
          style={{
            marginInlineStart: contentOffset,
            transition: 'margin-inline-start var(--duration-layout) var(--ease-sidebar)',
          }}
        >
          <div
            className="m-2 mt-0 flex flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] bg-card sm:m-3 sm:mt-0"
            style={{ boxShadow: 'var(--shadow-content)' }}
          >
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
