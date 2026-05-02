import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  listCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  listSubCategories,
  getSubCategoryDetail,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  type ListCategoriesParams,
  type ListSubCategoriesParams,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type CreateSubCategoryPayload,
  type UpdateSubCategoryPayload,
} from '@/features/categories/categories.api'

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

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: ListCategoriesParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

export const subCategoryKeys = {
  all: ['sub-categories'] as const,
  lists: () => [...subCategoryKeys.all, 'list'] as const,
  list: (params: ListSubCategoriesParams) => [...subCategoryKeys.lists(), params] as const,
  details: () => [...subCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...subCategoryKeys.details(), id] as const,
}

/* ------------------------------------------------------------------ */
/*  Category queries                                                   */
/* ------------------------------------------------------------------ */

export function useCategoriesQuery(params: ListCategoriesParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => listCategories(params),
  })
}

export function useCategoryDetailQuery(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryDetail(id),
    enabled: !!id,
  })
}

/* ------------------------------------------------------------------ */
/*  Category mutations                                                 */
/* ------------------------------------------------------------------ */

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success(t('categories:actions.create_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('categories:errors.create_failed'))
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) })
      toast.success(t('categories:actions.update_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('categories:errors.update_failed'))
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success(t('categories:actions.delete_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('categories:errors.delete_failed'))
    },
  })
}

/* ------------------------------------------------------------------ */
/*  Sub-category queries                                               */
/* ------------------------------------------------------------------ */

export function useSubCategoriesQuery(params: ListSubCategoriesParams) {
  return useQuery({
    queryKey: subCategoryKeys.list(params),
    queryFn: () => listSubCategories(params),
    enabled: !!params.category_id,
  })
}

export function useSubCategoryDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: subCategoryKeys.detail(id),
    queryFn: () => getSubCategoryDetail(id),
    enabled: !!id && enabled,
  })
}

/* ------------------------------------------------------------------ */
/*  Sub-category mutations                                             */
/* ------------------------------------------------------------------ */

export function useCreateSubCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateSubCategoryPayload) => createSubCategory(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.category_id) })
      toast.success(t('categories:sub.actions.create_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('categories:sub.errors.create_failed'))
    },
  })
}

export function useUpdateSubCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubCategoryPayload }) =>
      updateSubCategory(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() })
      toast.success(t('categories:sub.actions.update_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('categories:sub.errors.update_failed'))
    },
  })
}

export function useDeleteSubCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() })
      toast.success(t('categories:sub.actions.delete_success'))
    },
    onError: (error: unknown) => {
      toast.error(extractMutationError(error) ?? t('categories:sub.errors.delete_failed'))
    },
  })
}
