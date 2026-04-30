import { api } from '@/lib/axios'
import type { Category, CategoryDetail, SubCategory } from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Category mutation payloads                                         */
/* ------------------------------------------------------------------ */

export interface CreateCategoryPayload {
  name_en: string
  name_ar: string
  image_url: string
  icon_url: string
  sub_category_image_url: string
  display_order?: number
}

export interface UpdateCategoryPayload {
  name_en?: string
  name_ar?: string
  image_url?: string
  icon_url?: string
  sub_category_image_url?: string
  display_order?: number
  is_active?: boolean
}

/* ------------------------------------------------------------------ */
/*  Sub-category mutation payloads                                     */
/* ------------------------------------------------------------------ */

export interface CreateSubCategoryPayload {
  category_id: string
  name_en: string
  name_ar: string
  image_url?: string | null
  display_order?: number
}

export interface UpdateSubCategoryPayload {
  name_en?: string
  name_ar?: string
  image_url?: string | null
  display_order?: number
  is_active?: boolean
}

/* ------------------------------------------------------------------ */
/*  Category API functions                                             */
/* ------------------------------------------------------------------ */

export async function listCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/admin/categories')
  return res.data
}

export async function getCategoryDetail(id: string): Promise<CategoryDetail> {
  const res = await api.get<CategoryDetail>(`/admin/categories/${id}`)
  return res.data
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const res = await api.post<Category>('/admin/categories', payload)
  return res.data
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const res = await api.patch<Category>(`/admin/categories/${id}`, payload)
  return res.data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`)
}

/* ------------------------------------------------------------------ */
/*  Sub-category API functions                                         */
/* ------------------------------------------------------------------ */

export async function listSubCategories(categoryId: string): Promise<SubCategory[]> {
  const res = await api.get<SubCategory[]>('/admin/sub-categories', {
    params: { category_id: categoryId },
  })
  return res.data
}

export async function createSubCategory(payload: CreateSubCategoryPayload): Promise<SubCategory> {
  const res = await api.post<SubCategory>('/admin/sub-categories', payload)
  return res.data
}

export async function updateSubCategory(
  id: string,
  payload: UpdateSubCategoryPayload,
): Promise<SubCategory> {
  const res = await api.patch<SubCategory>(`/admin/sub-categories/${id}`, payload)
  return res.data
}

export async function deleteSubCategory(id: string): Promise<void> {
  await api.delete(`/admin/sub-categories/${id}`)
}
