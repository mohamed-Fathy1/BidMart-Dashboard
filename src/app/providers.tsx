import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { router } from '@/app/router'
import { useAuthStore } from '@/features/auth/auth.store'

export function Providers() {
  const token = useAuthStore((s) => s.token)
  const permissions = useAuthStore((s) => s.permissions)

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} context={{ auth: { token, permissions } }} />
        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
