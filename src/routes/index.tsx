import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.token) {
      throw redirect({ to: '/overview' })
    }
    throw redirect({ to: '/login' })
  },
})
