import type { ReactNode } from 'react'
import { useUIStore } from '@/features/ui/ui.store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (

    <div className="flex h-screen flex-col bg-sidebar-background">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{
            marginInlineStart: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
            transition: 'margin-inline-start var(--duration-layout) var(--ease-sidebar)',
          }}
        >
          <div
            className="m-3 mt-0 flex flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] bg-card"
            style={{ boxShadow: 'var(--shadow-content)' }}
          >
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
