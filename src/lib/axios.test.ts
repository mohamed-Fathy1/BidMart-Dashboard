import { describe, it, expect, vi } from 'vitest'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import { extractApiErrorMessage, extractErrorMessage } from './axios'

vi.mock('@/features/auth/auth.store', () => ({
  useAuthStore: { getState: () => ({ token: null, clearSession: () => {} }) },
}))

function makeAxiosError(data: unknown, status = 400): AxiosError {
  // Cast through `unknown` since AxiosError is a constructor with a quirky signature.
  const err = new AxiosError(
    'Request failed',
    String(status),
    undefined,
    undefined,
    {
      data,
      status,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    },
  )
  return err
}

describe('extractApiErrorMessage', () => {
  it('reads `data.message` (server convention: { success, data: { message }})', () => {
    const err = makeAxiosError({ success: false, data: { message: 'Bad input' } })
    expect(extractApiErrorMessage(err)).toBe('Bad input')
  })

  it('falls back to top-level `message` when no nested form is present', () => {
    const err = makeAxiosError({ message: 'Top-level error' })
    expect(extractApiErrorMessage(err)).toBe('Top-level error')
  })

  it('prefers nested `data.message` over top-level `message` (matches server preference)', () => {
    const err = makeAxiosError({ message: 'top', data: { message: 'nested' } })
    expect(extractApiErrorMessage(err)).toBe('nested')
  })

  it('returns undefined for non-axios errors', () => {
    expect(extractApiErrorMessage(new Error('boom'))).toBeUndefined()
    expect(extractApiErrorMessage(null)).toBeUndefined()
    expect(extractApiErrorMessage('string error')).toBeUndefined()
  })

  it('returns undefined when the body has neither message shape', () => {
    expect(extractApiErrorMessage(makeAxiosError({ foo: 'bar' }))).toBeUndefined()
    expect(extractApiErrorMessage(makeAxiosError(null))).toBeUndefined()
  })
})

describe('extractErrorMessage', () => {
  it('handles axios errors (delegates to extractApiErrorMessage)', () => {
    const err = makeAxiosError({ message: 'Server said no' })
    expect(extractErrorMessage(err)).toBe('Server said no')
  })

  it('handles the response-interceptor reject shape `{ message, status }`', () => {
    // The interceptor in axios.ts rewrites errors into plain objects before
    // they reach mutation onError handlers — that path must keep working.
    expect(extractErrorMessage({ message: 'Network down', status: 0 })).toBe('Network down')
  })

  it('ignores empty / non-string messages', () => {
    expect(extractErrorMessage({ message: '' })).toBeUndefined()
    expect(extractErrorMessage({ message: '   ' })).toBeUndefined()
    expect(extractErrorMessage({ message: 42 })).toBeUndefined()
  })

  it('returns undefined for non-object errors', () => {
    expect(extractErrorMessage(null)).toBeUndefined()
    expect(extractErrorMessage(undefined)).toBeUndefined()
    expect(extractErrorMessage('plain string')).toBeUndefined()
  })
})

describe('axios sanity', () => {
  it('isAxiosError discriminates correctly (smoke test for the test harness itself)', () => {
    expect(axios.isAxiosError(makeAxiosError({}))).toBe(true)
    expect(axios.isAxiosError(new Error('x'))).toBe(false)
  })
})
