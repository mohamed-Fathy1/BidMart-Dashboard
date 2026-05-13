import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface RouterContext {
  queryClient: QueryClient
  auth: {
    token: string | null
    permissions: string[]
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RootErrorBoundary,
})

function RootLayout() {
  return <Outlet />
}

function RootErrorBoundary() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">
          {t('common:errors.boundary_title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('common:errors.boundary_hint')}
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>
        {t('common:errors.reload')}
      </Button>
    </div>
  )
}
