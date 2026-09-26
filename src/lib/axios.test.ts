import { describe, it, expect, vi } from 'vitest'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import { toast } from 'sonner'
import { api, extractApiErrorMessage, extractErrorMessage, sessionEndReason } from './axios'

const clearSession = vi.fn()

vi.mock('@/features/auth/auth.store', () => ({
  useAuthStore: { getState: () => ({ token: null, clearSession }) },
}))

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

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

describe('fileApi', () => {
  it('decodes a Blob error body so `code` and `message` survive the rejection', async () => {
    const { fileApi } = await import('./axios')
    const body = JSON.stringify({
      success: false,
      error: { code: 'REPORT_EXPORT_TOO_LARGE', message: 'Export too large' },
    })
    const blob = new Blob([body], { type: 'application/json' })
    const err = new AxiosError('Request failed', '400', undefined, undefined, {
      data: blob,
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    const rejected = fileApi.interceptors.response as unknown as {
      handlers: Array<{ rejected: (e: unknown) => Promise<unknown> }>
    }
    const onRejected = rejected.handlers[0]!.rejected
    await expect(onRejected(err)).rejects.toEqual({
      message: 'Export too large',
      code: 'REPORT_EXPORT_TOO_LARGE',
      status: 400,
    })
  })
})

function makeEnvelopeError(status: number, code: string, url = '/admin/admins'): AxiosError {
  const config = { url, headers: new AxiosHeaders() }
  return new AxiosError('Request failed', String(status), config, undefined, {
    data: { success: false, error: { code, message: 'Server message' } },
    status,
    statusText: '',
    headers: {},
    config,
  })
}

describe('sessionEndReason', () => {
  it('ends the session for a 403 ACCOUNT_DISABLED', () => {
    expect(sessionEndReason(makeEnvelopeError(403, 'ACCOUNT_DISABLED'))).toBe('account_disabled')
  })

  it('ends the session for any 401', () => {
    expect(sessionEndReason(makeEnvelopeError(401, 'TOKEN_REVOKED'))).toBe('expired')
    expect(sessionEndReason(makeEnvelopeError(401, 'UNAUTHORIZED'))).toBe('expired')
  })

  it('keeps the session for a 403 FORBIDDEN', () => {
    expect(sessionEndReason(makeEnvelopeError(403, 'FORBIDDEN'))).toBeNull()
  })

  it('leaves a blocked admin on the sign-in form', () => {
    const err = makeEnvelopeError(403, 'ACCOUNT_DISABLED', '/admin/auth/login')
    expect(sessionEndReason(err)).toBeNull()
  })
})

describe('api response interceptor', () => {
  const handlers = api.interceptors.response as unknown as {
    handlers: Array<{ rejected: (e: unknown) => Promise<unknown> }>
  }
  const onRejected = handlers.handlers[0]!.rejected

  it('clears the session and redirects a disabled admin without settling', async () => {
    const replace = vi.fn()
    vi.stubGlobal('location', { replace })
    let settled = false
    void onRejected(makeEnvelopeError(403, 'ACCOUNT_DISABLED')).finally(() => {
      settled = true
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(clearSession).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith('/login?reason=account_disabled')
    expect(toast.error).not.toHaveBeenCalled()
    expect(settled).toBe(false)
    vi.unstubAllGlobals()
  })

  it('toasts and rejects a 403 FORBIDDEN without ending the session', async () => {
    clearSession.mockClear()
    await expect(onRejected(makeEnvelopeError(403, 'FORBIDDEN'))).rejects.toBeInstanceOf(AxiosError)
    expect(toast.error).toHaveBeenCalledWith('common:errors.permission_denied')
    expect(clearSession).not.toHaveBeenCalled()
  })
})
