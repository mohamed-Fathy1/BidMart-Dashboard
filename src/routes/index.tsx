import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth.store'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (useAuthStore.getState().token) {
      throw redirect({ to: '/overview' })
    }
    throw redirect({ to: '/login' })
  },
})
