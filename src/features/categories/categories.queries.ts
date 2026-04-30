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
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type CreateSubCategoryPayload,
  type UpdateSubCategoryPayload,
} from '@/features/categories/categories.api'

/* ------------------------------------------------------------------ */
/*  Query keys                                                         */
/* ------------------------------------------------------------------ */

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

export const subCategoryKeys = {
  all: ['sub-categories'] as const,
  lists: () => [...subCategoryKeys.all, 'list'] as const,
  list: (categoryId: string) => [...subCategoryKeys.lists(), categoryId] as const,
}

/* ------------------------------------------------------------------ */
/*  Category queries                                                   */
/* ------------------------------------------------------------------ */

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: listCategories,
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
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success(t('categories:actions.update_success'))
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
  })
}

/* ------------------------------------------------------------------ */
/*  Sub-category queries                                               */
/* ------------------------------------------------------------------ */

export function useSubCategoriesQuery(categoryId: string) {
  return useQuery({
    queryKey: subCategoryKeys.list(categoryId),
    queryFn: () => listSubCategories(categoryId),
    enabled: !!categoryId,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.all })
      toast.success(t('categories:sub.actions.create_success'))
    },
  })
}

export function useUpdateSubCategoryMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubCategoryPayload }) =>
      updateSubCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.all })
      toast.success(t('categories:sub.actions.update_success'))
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
      toast.success(t('categories:sub.actions.delete_success'))
    },
  })
}
