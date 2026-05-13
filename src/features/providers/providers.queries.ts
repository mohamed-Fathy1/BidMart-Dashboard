import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  listProviders,
  getProviderDetail,
  approveProvider,
  rejectProvider,
  toggleProviderVerification,
  blockProvider,
  unblockProvider,
  type ListProvidersParams,
} from '@/features/providers/providers.api'

export const providerKeys = createResourceKeys<ListProvidersParams>('providers')

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

export function useApproveProviderMutation() {
  return useResourceMutation({
    mutationFn: (storeId: string) => approveProvider(storeId),
    invalidate: [providerKeys.all],
    successKey: 'providers:actions.approve_success',
    errorKey: 'providers:errors.approve_failed',
  })
}

export function useRejectProviderMutation() {
  return useResourceMutation({
    mutationFn: ({ storeId, reason }: { storeId: string; reason: string }) =>
      rejectProvider(storeId, reason),
    invalidate: [providerKeys.all],
    successKey: 'providers:actions.reject_success',
    errorKey: 'providers:errors.reject_failed',
  })
}

export function useToggleVerificationMutation() {
  const { t } = useTranslation()
  return useResourceMutation({
    mutationFn: (storeId: string) => toggleProviderVerification(storeId),
    invalidate: [providerKeys.all],
    errorKey: 'providers:errors.verify_failed',
    onSuccess: (data) => {
      toast.success(
        data.isVerified
          ? t('providers:actions.verified_success')
          : t('providers:actions.unverified_success'),
      )
    },
  })
}

export function useBlockProviderMutation() {
  return useResourceMutation({
    mutationFn: (storeId: string) => blockProvider(storeId),
    invalidate: [providerKeys.all],
    successKey: 'providers:actions.block_success',
    errorKey: 'providers:errors.block_failed',
  })
}

export function useUnblockProviderMutation() {
  return useResourceMutation({
    mutationFn: (storeId: string) => unblockProvider(storeId),
    invalidate: [providerKeys.all],
    successKey: 'providers:actions.unblock_success',
    errorKey: 'providers:errors.unblock_failed',
  })
}
