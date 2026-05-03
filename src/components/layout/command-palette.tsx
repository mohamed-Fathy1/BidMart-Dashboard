import { useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LogOut, User } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useAuthStore } from '@/features/auth/auth.store'
import { useLogoutMutation } from '@/features/auth/auth.queries'
import { can } from '@/lib/permissions'
import {
  navSections,
  type NavLeaf,
} from '@/components/layout/nav-items'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ALL_NAV_LEAVES: NavLeaf[] = (() => {
  const out: NavLeaf[] = []
  navSections.forEach((section) => {
    section.entries.forEach((entry) => {
      if (entry.kind === 'leaf') out.push(entry)
      else entry.children.forEach((c) => out.push(c))
    })
  })
  return out
})()

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const permissions = useAuthStore((s) => s.permissions)
  const logout = useLogoutMutation()

  const visible = useMemo(
    () =>
      ALL_NAV_LEAVES.filter(
        (l) => !l.permission || can(permissions, l.permission),
      ),
    [permissions],
  )

  function go(to: string) {
    onOpenChange(false)
    queueMicrotask(() => navigate({ to }))
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('shell:topbar.search')}
      description={t('shell:topbar.search_placeholder')}
    >
      <CommandInput placeholder={t('shell:topbar.search_placeholder')} />
      <CommandList>
        <CommandEmpty>{t('shell:topbar.search_empty')}</CommandEmpty>
        <CommandGroup heading={t('shell:topbar.navigate')}>
          {visible.map((leaf) => {
            const Icon = leaf.icon
            const label = t(leaf.labelKey)
            return (
              <CommandItem
                key={leaf.to}
                value={`${label} ${leaf.to}`}
                onSelect={() => go(leaf.to)}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t('shell:topbar.account')}>
          <CommandItem value="profile" onSelect={() => go('/profile')}>
            <User className="size-4" />
            <span>{t('shell:topbar.my_profile')}</span>
          </CommandItem>
          <CommandItem
            value="logout"
            onSelect={() => {
              onOpenChange(false)
              logout.mutate()
            }}
          >
            <LogOut className="size-4" />
            <span>{t('shell:topbar.logout')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export function useCommandPaletteHotkey(toggle: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])
}
