import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  token: string | null
  permissions: string[]
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  setSession: (data: { user: User; token: string; permissions: string[] }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      permissions: [],
      status: 'idle',
      setSession: ({ user, token, permissions }) =>
        set({ user, token, permissions, status: 'authenticated' }),
      clearSession: () =>
        set({ user: null, token: null, permissions: [], status: 'unauthenticated' }),
    }),
    {
      name: 'bidmart-auth',
      partialize: (state) => ({ token: state.token }),
    },
  ),
)
