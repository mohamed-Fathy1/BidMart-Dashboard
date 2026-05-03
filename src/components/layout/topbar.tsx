import { useState } from 'react'
import { Bell, LogOut, Search, User } from 'lucide-react'
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
import { accountInitials, cn } from '@/lib/utils'
import { useUIStore } from '@/features/ui/ui.store'
import { useAuthStore } from '@/features/auth/auth.store'
import { useLogoutMutation } from '@/features/auth/auth.queries'

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)

export function Topbar() {
  const { t } = useTranslation()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const user = useAuthStore((s) => s.user)
  const logout = useLogoutMutation()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useCommandPaletteHotkey(() => setPaletteOpen((v) => !v))

  return (
    <header className="z-40 flex h-[var(--topbar-height)] shrink-0 items-center bg-sidebar-background">
      {/* Brand — width syncs with sidebar */}
      <div
        className="flex h-full shrink-0 items-center gap-2 overflow-hidden px-4"
        style={{
          width: collapsed
            ? 'var(--sidebar-collapsed-width)'
            : 'var(--sidebar-width)',
          transition: 'width var(--duration-layout) var(--ease-sidebar)',
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary text-xs font-bold text-primary-foreground">
          B
        </span>
        <span
          className={cn(
            'text-base font-semibold tracking-tight text-foreground whitespace-nowrap',
            'transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]',
            collapsed ? 'opacity-0' : 'opacity-100',
          )}
        >
          BidMart
        </span>
      </div>

      <div className="flex flex-1 items-center gap-4 px-6">
        <div className="min-w-0 flex-1">
          <BreadcrumbTrail />
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label={t('shell:topbar.search')}
          className={cn(
            'hidden h-9 w-full max-w-sm shrink items-center gap-2 rounded-[var(--radius-md)] bg-muted/60 px-3 text-sm text-muted-foreground md:flex',
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

        <div className="flex shrink-0 items-center gap-1">
          <LangSwitcher />
          <Separator orientation="vertical" className="mx-1 h-5" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('shell:topbar.notifications')}
              >
                <Bell className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  {t('shell:topbar.notifications')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">
                  {t('shell:topbar.notifications_empty')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('shell:topbar.notifications_empty_hint')}
                </p>
              </div>
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
