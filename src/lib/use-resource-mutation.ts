import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { extractApiErrorCode, extractErrorMessage } from '@/lib/axios'

type QueryKey = readonly unknown[]

export interface ResourceMutationOptions<TArgs, TData> {
  mutationFn: (args: TArgs) => Promise<TData>
  /** Query keys to invalidate on success. */
  invalidate?: readonly QueryKey[]
  /** i18n key for the success toast. Omit to skip toasting on success. */
  successKey?: string
  /** i18n key for the fallback error toast. Server message is preferred when present. */
  errorKey?: string
  /**
   * Optional map of server `error.code` → i18n key. When a known code comes
   * back, this beats the server message (which `/admin/*` forces English).
   * Codes not in the map fall through to the standard `extractErrorMessage` →
   * `errorKey` chain.
   */
  errorKeyByCode?: Record<string, string>
  /**
   * Codes whose server message carries dynamic detail (e.g. the available
   * balance for `SETTLEMENT_AMOUNT_EXCEEDS_AVAILABLE`). For these, the server
   * message wins over `errorKeyByCode`. Used when a localised template would
   * lose information.
   */
  preferServerMessageForCodes?: readonly string[]
  /** Extra onSuccess side effects (close dialog, navigate, …). */
  onSuccess?: (data: TData, args: TArgs) => void
  /** Extra onError side effects. The shared toast still fires. */
  onError?: (error: unknown, args: TArgs) => void
  /** Escape hatch for TanStack options that aren't covered. */
  mutationOptions?: Omit<
    UseMutationOptions<TData, unknown, TArgs>,
    'mutationFn' | 'onSuccess' | 'onError'
  >
}

/**
 * Standard CRUD mutation: invalidates the resource's query keys on success,
 * toasts a success message, and falls back to a server error message (or the
 * given i18n key) on failure. Use for the ~90% of mutations that follow this
 * shape; reach for raw `useMutation` only when the flow is unusual.
 */
export function useResourceMutation<TArgs, TData = unknown>(
  opts: ResourceMutationOptions<TArgs, TData>,
) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation<TData, unknown, TArgs>({
    ...opts.mutationOptions,
    mutationFn: opts.mutationFn,
    onSuccess: (data, args) => {
      opts.invalidate?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      )
      if (opts.successKey) {
        // Stable id per success key — rapid repeats replace the previous toast
        // instead of stacking (e.g. enabling/disabling several rows in a row).
        toast.success(t(opts.successKey), { id: opts.successKey, duration: 2500 })
      }
      opts.onSuccess?.(data, args)
    },
    onError: (error, args) => {
      const fallback = opts.errorKey ? t(opts.errorKey) : t('common:errors.unexpected')
      const code = extractApiErrorCode(error)
      const serverMessage = extractErrorMessage(error)
      let message: string | undefined

      if (code) {
        const preferServer = opts.preferServerMessageForCodes?.includes(code)
        if (preferServer && serverMessage) {
          message = serverMessage
        } else {
          const mappedKey = opts.errorKeyByCode?.[code]
          if (mappedKey) message = t(mappedKey)
        }
      }

      // Errors hold a bit longer and use the error key as a dedupe id.
      toast.error(message ?? serverMessage ?? fallback, {
        id: opts.errorKey ?? 'common-error',
        duration: 5000,
      })
      opts.onError?.(error, args)
    },
  })
}
