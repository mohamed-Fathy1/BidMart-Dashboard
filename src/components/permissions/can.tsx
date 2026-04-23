import type { ReactNode } from 'react'
import { usePermission, type Permission } from '@/lib/permissions'

interface CanProps {
  permission: Permission
  fallback?: ReactNode
  children: ReactNode
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const allowed = usePermission(permission)
  return allowed ? <>{children}</> : <>{fallback}</>
}
