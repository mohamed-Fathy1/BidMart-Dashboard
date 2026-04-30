import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  listProviders,
  getProviderDetail,
  approveProvider,
  rejectProvider,
  toggleProviderVerification,
  type ListProvidersParams,
} from '@/features/providers/providers.api'

/* ------------------------------------------------------------------ */
/*  Query keys                                                         */
/* ------------------------------------------------------------------ */

export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (params: ListProvidersParams) => [...providerKeys.lists(), params] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export function useProvidersQuery(params: ListProvidersParams) {
  return useQuery({
    queryKey: providerKeys.list(params),
    queryFn: () => listProviders(params),
  })
}

export function useProviderDetailQuery(storeId: string) {
  return useQuery({
    queryKey: providerKeys.detail(storeId),
    queryFn: () => getProviderDetail(storeId),
    enabled: !!storeId,
  })
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

export function useApproveProviderMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (storeId: string) => approveProvider(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
      toast.success(t('providers:actions.approve_success'))
    },
  })
}

export function useRejectProviderMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ storeId, reason }: { storeId: string; reason: string }) =>
      rejectProvider(storeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
      toast.success(t('providers:actions.reject_success'))
    },
  })
}

export function useToggleVerificationMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (storeId: string) => toggleProviderVerification(storeId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
      toast.success(
        data.isVerified
          ? t('providers:actions.verified_success')
          : t('providers:actions.unverified_success'),
      )
    },
  })
}
