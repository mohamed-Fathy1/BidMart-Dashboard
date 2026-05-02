import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Shell } from '@/components/layout/shell'
import { useMeQuery } from '@/features/auth/auth.queries'
import { useAuthStore } from '@/features/auth/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldAlert } from 'lucide-react'

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
  const { isLoading } = useMeQuery()

  if (isLoading || status === 'idle' || status === 'loading') {
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
