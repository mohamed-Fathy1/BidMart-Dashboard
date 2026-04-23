import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth.store'
import { loginRequest, getMeRequest } from '@/features/auth/auth.api'

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession(data)
      navigate({ to: '/overview' })
    },
  })
}

export function useMeQuery() {
  const token = useAuthStore((s) => s.token)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await getMeRequest()
      setSession({ user: data.user, token: token!, permissions: data.permissions })
      return data
    },
    enabled: !!token,
    retry: false,
    meta: {
      onError: () => clearSession(),
    },
  })
}
