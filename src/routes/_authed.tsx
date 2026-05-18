import { useEffect } from 'react'
import { createFileRoute, redirect, useNavigate, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Shell } from '@/components/layout/shell'
import { useMeQuery } from '@/features/auth/auth.queries'
import { useAuthStore } from '@/features/auth/auth.store'
import { useComplaintsRealtime } from '@/features/complaints/use-complaints-realtime'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldAlert } from 'lucide-react'

function ComplaintsRealtimeBridge() {
  useComplaintsRealtime()
  return null
}

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    if (!useAuthStore.getState().token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const status = useAuthStore((s) => s.status)
  const navigate = useNavigate()
  useMeQuery()

  // If the profile query failed and cleared the session, get the user back to login
  // before any child route fires a request with no token.
  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({ to: '/login', replace: true })
    }
  }, [status, navigate])

  if (status !== 'authenticated') {
    return (
      <Shell>
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <ComplaintsRealtimeBridge />
      <Outlet />
    </Shell>
  )
}

export function PermissionDenied() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <ShieldAlert className="h-12 w-12" />
      <p className="text-sm">{t('common:errors.permission_denied')}</p>
    </div>
  )
}
