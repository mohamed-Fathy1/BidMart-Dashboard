import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useResourceMutation } from './use-resource-mutation'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

describe('useResourceMutation', () => {
  it('invalidates the given query keys on success', async () => {
    const { qc, Wrapper } = wrapper()
    const invalidate = vi.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(
      () =>
        useResourceMutation<number, number>({
          mutationFn: async (n) => n + 1,
          invalidate: [['admins'], ['users', 'list']],
          successKey: 'admins:actions.create_success',
          errorKey: 'admins:errors.generic',
        }),
      { wrapper: Wrapper },
    )
    await act(async () => {
      await result.current.mutateAsync(1)
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['admins'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users', 'list'] })
  })

  it('toasts the i18n success key on success', async () => {
    const { Wrapper } = wrapper()
    const { result } = renderHook(
      () =>
        useResourceMutation<void, void>({
          mutationFn: async () => undefined,
          successKey: 'admins:actions.create_success',
          errorKey: 'admins:errors.generic',
        }),
      { wrapper: Wrapper },
    )
    await act(async () => {
      await result.current.mutateAsync()
    })
    expect(toast.success).toHaveBeenCalledWith('admins:actions.create_success')
  })

  it('toasts the server message when present, falling back to the i18n key', async () => {
    const { Wrapper } = wrapper()
    const { result } = renderHook(
      () =>
        useResourceMutation<void, void>({
          mutationFn: async () => {
            throw { message: 'Email already taken', status: 409 }
          },
          errorKey: 'admins:errors.generic',
        }),
      { wrapper: Wrapper },
    )
    await act(async () => {
      try {
        await result.current.mutateAsync()
      } catch {
        // expected
      }
    })
    expect(toast.error).toHaveBeenCalledWith('Email already taken')
  })

  it('falls back to the i18n errorKey when there is no server message', async () => {
    const { Wrapper } = wrapper()
    const { result } = renderHook(
      () =>
        useResourceMutation<void, void>({
          mutationFn: async () => {
            throw {}
          },
          errorKey: 'admins:errors.generic',
        }),
      { wrapper: Wrapper },
    )
    await act(async () => {
      try {
        await result.current.mutateAsync()
      } catch {
        // expected
      }
    })
    expect(toast.error).toHaveBeenCalledWith('admins:errors.generic')
  })

  it('runs the consumer onSuccess callback after the toast + invalidate', async () => {
    const { Wrapper } = wrapper()
    const order: string[] = []
    vi.mocked(toast.success).mockImplementation(() => {
      order.push('toast')
      return 0 as unknown as string | number
    })
    const { result } = renderHook(
      () =>
        useResourceMutation<number, number>({
          mutationFn: async (n) => n,
          successKey: 'x',
          onSuccess: () => order.push('callback'),
        }),
      { wrapper: Wrapper },
    )
    await act(async () => {
      await result.current.mutateAsync(1)
    })
    await waitFor(() => expect(order).toEqual(['toast', 'callback']))
  })
})
