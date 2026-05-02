import { api } from '@/lib/axios'
import type {
  Category,
  CategoryDetail,
  CategoryRecord,
  PaginationMeta,
  SubCategory,
} from '@/types/api'

/* ------------------------------------------------------------------ */
/*  Response helpers                                                   */
/* ------------------------------------------------------------------ */

function unwrapEntity<T>(body: unknown): T {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    (body as { data: unknown }).data != null
  ) {
    return (body as { data: T }).data
  }
  return body as T
}

function unwrapList<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return (body as { data: T[] }).data
  }
  return []
}

/* ------------------------------------------------------------------ */
/*  Category list params                                               */
/* ------------------------------------------------------------------ */

export interface ListCategoriesParams {
  search?: string
  page?: number
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  Category mutation payloads                                         */
/* ------------------------------------------------------------------ */

export interface CreateCategoryPayload {
  name_en: string
  name_ar: string
  image_url: string
  icon_url: string
  sub_category_image_url: string
  description_en?: string | null
  description_ar?: string | null
  display_order?: number
}

export interface UpdateCategoryPayload {
  name_en?: string
  name_ar?: string
  image_url?: string
  icon_url?: string
  sub_category_image_url?: string
  description_en?: string | null
  description_ar?: string | null
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

export async function listCategories(
  params: ListCategoriesParams,
): Promise<{ data: Category[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: Category[]
    meta: PaginationMeta
  }>('/admin/categories', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export async function getCategoryDetail(id: string): Promise<CategoryDetail> {
  const res = await api.get<unknown>(`/admin/categories/${id}`)
  return unwrapEntity<CategoryDetail>(res.data)
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<CategoryRecord> {
  const res = await api.post<unknown>('/admin/categories', payload)
  return unwrapEntity<CategoryRecord>(res.data)
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<CategoryRecord> {
  const res = await api.patch<unknown>(`/admin/categories/${id}`, payload)
  return unwrapEntity<CategoryRecord>(res.data)
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`)
}

/* ------------------------------------------------------------------ */
/*  Sub-category API functions                                         */
/* ------------------------------------------------------------------ */

export async function listSubCategories(categoryId: string): Promise<SubCategory[]> {
  const res = await api.get<unknown>('/admin/sub-categories', {
    params: { category_id: categoryId },
  })
  return unwrapList<SubCategory>(res.data)
}

export async function createSubCategory(
  payload: CreateSubCategoryPayload,
): Promise<SubCategory> {
  const res = await api.post<unknown>('/admin/sub-categories', payload)
  return unwrapEntity<SubCategory>(res.data)
}

export async function updateSubCategory(
  id: string,
  payload: UpdateSubCategoryPayload,
): Promise<SubCategory> {
  const res = await api.patch<unknown>(`/admin/sub-categories/${id}`, payload)
  return unwrapEntity<SubCategory>(res.data)
}

export async function deleteSubCategory(id: string): Promise<void> {
  await api.delete(`/admin/sub-categories/${id}`)
}
