import { useState } from 'react'
import { Bell, LogOut, Menu, Search, User } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LangSwitcher } from '@/components/layout/lang-switcher'
import { Separator } from '@/components/ui/separator'
import { BreadcrumbTrail } from '@/components/layout/breadcrumb-trail'
import {
  CommandPalette,
  useCommandPaletteHotkey,
} from '@/components/layout/command-palette'
import { NotificationsPopoverContent } from '@/features/notifications/notifications-popover-content'
import { useAdminUnreadCountQuery } from '@/features/notifications/notifications.queries'
import { BrandLogo } from '@/components/shared/brand-logo'
import { accountInitials, cn } from '@/lib/utils'
import { useIsDesktop } from '@/lib/use-media-query'
import { useUIStore } from '@/features/ui/ui.store'
import { useAuthStore } from '@/features/auth/auth.store'
import { useLogoutMutation } from '@/features/auth/auth.queries'

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)

export function Topbar() {
  const { t } = useTranslation()
  const collapsedPref = useUIStore((s) => s.sidebarCollapsed)
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav)
  const isDesktop = useIsDesktop()
  // On mobile the rail is a drawer (always full-width when open), so the
  // collapse preference only drives brand width on desktop.
  const collapsed = isDesktop ? collapsedPref : false
  const user = useAuthStore((s) => s.user)
  const logout = useLogoutMutation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const unreadQuery = useAdminUnreadCountQuery()
  const unreadCount = unreadQuery.data ?? 0

  useCommandPaletteHotkey(() => setPaletteOpen((v) => !v))

  return (
    <header className="z-40 flex h-[var(--topbar-height)] shrink-0 items-center bg-sidebar-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleMobileNav}
        aria-label={t('shell:sidebar.open_menu')}
        className="ms-1 shrink-0 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Brand — width syncs with the sidebar on desktop; intrinsic on mobile */}
      <div
        className="flex h-full shrink-0 items-center gap-2 overflow-hidden ps-2 pe-2 lg:ps-4 lg:pe-4"
        style={{
          width: isDesktop
            ? collapsed
              ? 'var(--sidebar-collapsed-width)'
              : 'var(--sidebar-width)'
            : 'auto',
          transition: 'width var(--duration-layout) var(--ease-sidebar)',
        }}
      >
        <BrandLogo className="h-8 w-8 shrink-0" gradientId="bidmart-topbar-gradient" />
        <span
          className={cn(
            // Hidden on phones to keep the action cluster from overflowing the
            // viewport; the logo mark still identifies the app. Shown from sm up.
            'hidden text-base font-semibold tracking-tight text-foreground whitespace-nowrap sm:inline',
            'transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
            collapsed ? 'opacity-0' : 'opacity-100',
          )}
        >
          BidMart
        </span>
      </div>

      <div className="flex flex-1 items-center gap-2 px-2 sm:gap-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="hidden sm:block">
            <BreadcrumbTrail />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label={t('shell:topbar.search')}
          className={cn(
            'hidden h-9 w-full max-w-sm shrink items-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-muted-foreground shadow-rest md:flex',
            'transition-colors duration-(--duration-hover) ease-(--ease-default) hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-start">
            {t('shell:topbar.search_placeholder')}
          </span>
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {IS_MAC ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setPaletteOpen(true)}
          aria-label={t('shell:topbar.search')}
          className="md:hidden"
        >
          <Search className="h-4 w-4" />
        </Button>

        <div className="flex shrink-0 items-center gap-1">
          <LangSwitcher />
          <Separator orientation="vertical" className="mx-1 h-5" />

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('shell:topbar.notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 end-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] leading-none font-semibold tabular-nums text-destructive-foreground ring-2 ring-sidebar-background"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 max-w-[calc(100vw-1rem)] overflow-hidden p-0">
              <NotificationsPopoverContent
                onNavigate={() => setNotificationsOpen(false)}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t('shell:topbar.profile')}
                className="gap-2 ps-1 pe-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] font-semibold">
                    {user ? (
                      accountInitials(user.name, user.email)
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {user?.name && (
                  <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground md:inline">
                    {user.name}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {(user?.name || user?.email) && (
                <>
                  <DropdownMenuLabel className="space-y-0.5 font-normal">
                    {user?.name && (
                      <div className="truncate text-sm font-medium text-foreground">
                        {user.name}
                      </div>
                    )}
                    {user?.email && (
                      <div className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <User className="size-4" />
                  {t('shell:topbar.my_profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                {t('shell:topbar.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  )
}
