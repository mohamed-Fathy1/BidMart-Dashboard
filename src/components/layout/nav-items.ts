import { LayoutDashboard, Users, Globe, Grid3X3, Store, Shield, UserCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PERMISSIONS, type Permission } from '@/lib/permissions'

export interface NavItem {
  labelKey: string
  icon: LucideIcon
  to: string
  permission?: Permission
}

export const navItems: NavItem[] = [
  { labelKey: 'shell:nav.overview', icon: LayoutDashboard, to: '/overview' },
  { labelKey: 'shell:nav.users', icon: Users, to: '/users', permission: PERMISSIONS.users.view },
  { labelKey: 'shell:nav.countries', icon: Globe, to: '/countries', permission: PERMISSIONS.countries.view },
  { labelKey: 'shell:nav.categories', icon: Grid3X3, to: '/categories', permission: PERMISSIONS.categories.view },
  { labelKey: 'shell:nav.providers', icon: Store, to: '/providers', permission: PERMISSIONS.providers.view },
  { labelKey: 'shell:nav.roles', icon: Shield, to: '/roles', permission: PERMISSIONS.roles.view },
  { labelKey: 'shell:nav.admins', icon: UserCog, to: '/admins', permission: PERMISSIONS.admins.view },
]
