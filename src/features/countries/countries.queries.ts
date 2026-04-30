import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  listCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  type ListCountriesParams,
  type CreateCountryPayload,
  type UpdateCountryPayload,
} from '@/features/countries/countries.api'

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
  })
}
