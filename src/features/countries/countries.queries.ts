import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
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

export const countryKeys = createResourceKeys<ListCountriesParams>('countries')

export function useCountriesQuery(params: ListCountriesParams) {
  return useQuery({
    queryKey: countryKeys.list(params),
    queryFn: () => listCountries(params),
  })
}

export function useCreateCountryMutation() {
  return useResourceMutation({
    mutationFn: (payload: CreateCountryPayload) => createCountry(payload),
    invalidate: [countryKeys.all],
    successKey: 'countries:actions.create_success',
    errorKey: 'countries:errors.create_failed',
  })
}

export function useUpdateCountryMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCountryPayload }) =>
      updateCountry(id, payload),
    invalidate: [countryKeys.all],
    successKey: 'countries:actions.update_success',
    errorKey: 'countries:errors.update_failed',
  })
}

export function useToggleCountryMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => toggleCountryEnabled(id),
    invalidate: [countryKeys.all],
    successKey: 'countries:actions.toggle_success',
    errorKey: 'countries:errors.toggle_failed',
  })
}

export function useDeleteCountryMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => deleteCountry(id),
    invalidate: [countryKeys.all],
    successKey: 'countries:actions.delete_success',
    errorKey: 'countries:errors.delete_failed',
  })
}
