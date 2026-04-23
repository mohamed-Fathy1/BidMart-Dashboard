import { LayoutDashboard, Users, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Permission } from '@/lib/permissions'

export interface NavItem {
  labelKey: string
  icon: LucideIcon
  to: string
  permission?: Permission
}

export const navItems: NavItem[] = [
  { labelKey: 'shell:nav.overview', icon: LayoutDashboard, to: '/overview' },
  { labelKey: 'shell:nav.users', icon: Users, to: '/users', permission: 'users.read' },
  { labelKey: 'shell:nav.settings', icon: Settings, to: '/settings', permission: 'settings.edit' },
]
