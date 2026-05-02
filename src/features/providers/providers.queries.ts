import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
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

export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (params: ListProvidersParams) => [...providerKeys.lists(), params] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
}

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
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (storeId: string) => approveProvider(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
      toast.success(t('providers:actions.approve_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('providers:errors.approve_failed'))
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
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('providers:errors.reject_failed'))
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
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('providers:errors.verify_failed'))
    },
  })
}

export function useBlockProviderMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (storeId: string) => blockProvider(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
      toast.success(t('providers:actions.block_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('providers:errors.block_failed'))
    },
  })
}

export function useUnblockProviderMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (storeId: string) => unblockProvider(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
      toast.success(t('providers:actions.unblock_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('providers:errors.unblock_failed'))
    },
  })
}
