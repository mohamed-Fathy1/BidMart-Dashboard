import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  listCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryEnabled,
  type ListCountriesParams,
  type CreateCountryPayload,
  type UpdateCountryPayload,
} from '@/features/countries/countries.api'

function extractMutationError(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return typeof data?.message === 'string' ? data.message : undefined
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const m = (error as { message: unknown }).message
    return typeof m === 'string' ? m : undefined
  }
  return undefined
}

/* ------------------------------------------------------------------ */
/*  Query keys                                                         */
/* ------------------------------------------------------------------ */

export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  list: (params: ListCountriesParams) => [...countryKeys.lists(), params] as const,
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export function useCountriesQuery(params: ListCountriesParams) {
  return useQuery({
    queryKey: countryKeys.list(params),
    queryFn: () => listCountries(params),
  })
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

export function useCreateCountryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCountryPayload) => createCountry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
      toast.success(t('countries:actions.create_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('countries:errors.create_failed'))
    },
  })
}

export function useUpdateCountryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCountryPayload }) =>
      updateCountry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
      toast.success(t('countries:actions.update_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('countries:errors.update_failed'))
    },
  })
}

export function useToggleCountryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => toggleCountryEnabled(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
      toast.success(t('countries:actions.toggle_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('countries:errors.toggle_failed'))
    },
  })
}

export function useDeleteCountryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
      toast.success(t('countries:actions.delete_success'))
    },
    onError: (error) => {
      const msg = extractMutationError(error)
      toast.error(msg ?? t('countries:errors.delete_failed'))
    },
  })
}
