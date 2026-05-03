import {
  LayoutDashboard,
  Users,
  Globe,
  Grid3X3,
  Store,
  Shield,
  UserCog,
  FolderTree,
  LayoutGrid,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PERMISSIONS, type Permission } from '@/lib/permissions'

export interface NavLeaf {
  kind: 'leaf'
  labelKey: string
  icon: LucideIcon
  to: string
  permission?: Permission
}

export interface NavGroup {
  kind: 'group'
  labelKey: string
  icon: LucideIcon
  // Used when sidebar is collapsed: clicking the icon-only parent navigates here.
  defaultTo: string
  // Used to detect "any child is active" for fuzzy matching of the parent area.
  matchPath: string
  children: NavLeaf[]
}

export type NavEntry = NavLeaf | NavGroup

export interface NavSection {
  id: 'pulse' | 'marketplace' | 'control'
  pinBottom?: boolean
  entries: NavEntry[]
}

export const navSections: NavSection[] = [
  {
    id: 'pulse',
    entries: [
      { kind: 'leaf', labelKey: 'shell:nav.overview', icon: LayoutDashboard, to: '/overview' },
    ],
  },
  {
    id: 'marketplace',
    entries: [
      { kind: 'leaf', labelKey: 'shell:nav.users', icon: Users, to: '/users', permission: PERMISSIONS.users.view },
      { kind: 'leaf', labelKey: 'shell:nav.providers', icon: Store, to: '/providers', permission: PERMISSIONS.providers.view },
      {
        kind: 'group',
        labelKey: 'shell:nav.catalog',
        icon: FolderTree,
        defaultTo: '/categories',
        matchPath: '/categories',
        children: [
          {
            kind: 'leaf',
            labelKey: 'shell:nav.categories',
            icon: Grid3X3,
            to: '/categories',
            permission: PERMISSIONS.categories.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.sub_categories',
            icon: LayoutGrid,
            to: '/categories/sub-categories',
            permission: PERMISSIONS.subCategories.view,
          },
        ],
      },
      { kind: 'leaf', labelKey: 'shell:nav.countries', icon: Globe, to: '/countries', permission: PERMISSIONS.countries.view },
    ],
  },
  {
    id: 'control',
    pinBottom: true,
    entries: [
      { kind: 'leaf', labelKey: 'shell:nav.roles', icon: Shield, to: '/roles', permission: PERMISSIONS.roles.view },
      { kind: 'leaf', labelKey: 'shell:nav.admins', icon: UserCog, to: '/admins', permission: PERMISSIONS.admins.view },
    ],
  },
]
