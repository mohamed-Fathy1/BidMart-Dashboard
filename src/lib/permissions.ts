import { useAuthStore } from '@/features/auth/auth.store'

export const PERMISSIONS = {
  providers: ['read', 'approve', 'reject', 'verify'],
  withdrawals: ['read', 'approve', 'reject'],
  users: ['read', 'block', 'activate'],
  moderators: ['read', 'create', 'edit', 'block'],
  roles: ['read', 'create', 'edit', 'delete'],
  reports: ['read', 'export'],
  complaints: ['read', 'resolve'],
  ratings: ['read'],
  streams: ['read'],
  content: ['edit'],
  categories: ['edit'],
  settings: ['edit'],
} as const

export type Permission = `${keyof typeof PERMISSIONS}.${string}`

export function can(permissions: string[], required: Permission): boolean {
  return permissions.includes(required)
}

export function usePermission(permission: Permission): boolean {
  const permissions = useAuthStore((s) => s.permissions)
  return can(permissions, permission)
}
