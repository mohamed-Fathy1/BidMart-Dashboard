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
  MessageCircleWarning,
  Inbox,
  Settings,
  Tags,
  SlidersHorizontal,
  FileText,
  Wallet,
  Banknote,
  Landmark,
  Bell,
  Radio,
  BarChart3,
  Receipt,
  Star,
  ShoppingBag,
  Video,
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
      {
        kind: 'leaf',
        labelKey: 'shell:nav.overview',
        icon: LayoutDashboard,
        to: '/overview',
        permission: PERMISSIONS.reports.view,
      },
      {
        kind: 'group',
        labelKey: 'shell:nav.reports',
        icon: BarChart3,
        defaultTo: '/reports/financial',
        matchPath: '/reports',
        children: [
          {
            kind: 'leaf',
            labelKey: 'shell:nav.financial_report',
            icon: Receipt,
            to: '/reports/financial',
            permission: PERMISSIONS.reports.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.ratings',
            icon: Star,
            to: '/reports/ratings',
            permission: PERMISSIONS.reports.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.orders',
            icon: ShoppingBag,
            to: '/reports/orders',
            permission: PERMISSIONS.reports.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.live_streams',
            icon: Video,
            to: '/reports/livestreams',
            permission: PERMISSIONS.reports.view,
          },
        ],
      },
      { kind: 'leaf', labelKey: 'shell:nav.notifications', icon: Bell, to: '/notifications' },
    ],
  },
  {
    id: 'marketplace',
    entries: [
      { kind: 'leaf', labelKey: 'shell:nav.users', icon: Users, to: '/users', permission: PERMISSIONS.users.view },
      { kind: 'leaf', labelKey: 'shell:nav.providers', icon: Store, to: '/providers', permission: PERMISSIONS.providers.view },
      { kind: 'leaf', labelKey: 'shell:nav.complaints', icon: MessageCircleWarning, to: '/complaints', permission: PERMISSIONS.complaints.view },
      { kind: 'leaf', labelKey: 'shell:nav.support_tickets', icon: Inbox, to: '/support-tickets', permission: PERMISSIONS.contactMessages.view },
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
      {
        kind: 'group',
        labelKey: 'shell:nav.finance',
        icon: Wallet,
        defaultTo: '/withdrawals',
        matchPath: '/withdrawals',
        children: [
          {
            kind: 'leaf',
            labelKey: 'shell:nav.withdrawals',
            icon: Banknote,
            to: '/withdrawals',
            permission: PERMISSIONS.withdrawals.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.banks',
            icon: Landmark,
            to: '/banks',
            permission: PERMISSIONS.withdrawals.view,
          },
        ],
      },
    ],
  },
  {
    id: 'control',
    pinBottom: true,
    entries: [
      { kind: 'leaf', labelKey: 'shell:nav.roles', icon: Shield, to: '/roles', permission: PERMISSIONS.roles.view },
      { kind: 'leaf', labelKey: 'shell:nav.admins', icon: UserCog, to: '/admins', permission: PERMISSIONS.admins.view },
      {
        kind: 'group',
        labelKey: 'shell:nav.settings',
        icon: Settings,
        defaultTo: '/settings',
        matchPath: '/settings',
        children: [
          {
            kind: 'leaf',
            labelKey: 'shell:nav.settings_general',
            icon: SlidersHorizontal,
            to: '/settings',
            permission: PERMISSIONS.settings.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.complaint_types',
            icon: Tags,
            to: '/settings/complaint-types',
            permission: PERMISSIONS.complaints.view,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.settings_content',
            icon: FileText,
            to: '/settings/content',
            permission: PERMISSIONS.settings.update,
          },
          {
            kind: 'leaf',
            labelKey: 'shell:nav.live_show_settings',
            icon: Radio,
            to: '/settings/live-shows',
            permission: PERMISSIONS.shows.view,
          },
        ],
      },
    ],
  },
]

/**
 * The first sidebar page the admin can open, in sidebar order. Used as the
 * landing page after login so an admin without Overview access does not land
 * on a permission error. `/profile` is open to every admin.
 */
export function firstPermittedPath(check: (permission?: Permission) => boolean): string {
  for (const section of navSections) {
    for (const entry of section.entries) {
      const leaves = entry.kind === 'leaf' ? [entry] : entry.children
      const leaf = leaves.find((candidate) => check(candidate.permission))
      if (leaf) return leaf.to
    }
  }
  return '/profile'
}
