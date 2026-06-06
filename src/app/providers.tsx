import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Direction } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { router } from '@/app/router'
import { useAuthStore } from '@/features/auth/auth.store'

export function Providers() {
  const token = useAuthStore((s) => s.token)
  const permissions = useAuthStore((s) => s.permissions)
  const { i18n } = useTranslation()
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'

  return (
    <QueryClientProvider client={queryClient}>
      <Direction.Provider dir={dir}>
        <TooltipProvider>
          <RouterProvider router={router} context={{ auth: { token, permissions } }} />
          <Toaster
            position="top-center"
            closeButton
            duration={3500}
            visibleToasts={4}
            toastOptions={{
              classNames: { error: 'border-destructive/40 bg-destructive/5' },
            }}
          />
        </TooltipProvider>
      </Direction.Provider>
    </QueryClientProvider>
  )
}
