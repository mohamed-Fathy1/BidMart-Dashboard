import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  /** Desktop (lg+) rail collapse — persisted across sessions. */
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  /** Mobile (below lg) off-canvas drawer — transient, never persisted. */
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileNavOpen: false,
      openMobileNav: () => set({ mobileNavOpen: true }),
      closeMobileNav: () => set({ mobileNavOpen: false }),
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
    }),
    {
      name: 'bidmart-ui',
      // Only the desktop collapse preference survives reloads; the mobile drawer
      // must always boot closed.
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
)
