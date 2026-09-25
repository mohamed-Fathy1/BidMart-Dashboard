import { createFileRoute, redirect } from '@tanstack/react-router'
import { firstPermittedPath } from '@/components/layout/nav-items'
import { buildSessionFromToken } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { permissionCheck } from '@/lib/permissions'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = useAuthStore.getState().token
    if (!token) throw redirect({ to: '/login' })
    // Only the token survives a reload, and it already carries the grants.
    let landing = '/overview'
    try {
      const { user, permissions } = buildSessionFromToken(token)
      landing = firstPermittedPath(permissionCheck(permissions, user.isSuperAdmin))
    } catch {
      // A malformed token falls through to the layout, which clears the session.
    }
    throw redirect({ to: landing })
  },
})
