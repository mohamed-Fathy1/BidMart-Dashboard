import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
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

export const categoryKeys = createResourceKeys<ListCategoriesParams>('categories')
export const subCategoryKeys = createResourceKeys<ListSubCategoriesParams>('sub-categories')

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
  return useResourceMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    invalidate: [categoryKeys.all],
    successKey: 'categories:actions.create_success',
    errorKey: 'categories:errors.create_failed',
  })
}

export function useUpdateCategoryMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateCategory(id, payload),
    invalidate: [categoryKeys.all],
    successKey: 'categories:actions.update_success',
    errorKey: 'categories:errors.update_failed',
  })
}

export function useDeleteCategoryMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => deleteCategory(id),
    invalidate: [categoryKeys.all],
    successKey: 'categories:actions.delete_success',
    errorKey: 'categories:errors.delete_failed',
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
  return useResourceMutation({
    mutationFn: (payload: CreateSubCategoryPayload) => createSubCategory(payload),
    invalidate: [subCategoryKeys.all, categoryKeys.all],
    successKey: 'categories:sub.actions.create_success',
    errorKey: 'categories:sub.errors.create_failed',
  })
}

export function useUpdateSubCategoryMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubCategoryPayload }) =>
      updateSubCategory(id, payload),
    invalidate: [subCategoryKeys.all, categoryKeys.all],
    successKey: 'categories:sub.actions.update_success',
    errorKey: 'categories:sub.errors.update_failed',
  })
}

export function useDeleteSubCategoryMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => deleteSubCategory(id),
    invalidate: [subCategoryKeys.all, categoryKeys.all],
    successKey: 'categories:sub.actions.delete_success',
    errorKey: 'categories:sub.errors.delete_failed',
  })
}
