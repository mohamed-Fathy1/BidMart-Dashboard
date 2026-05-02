import { api } from '@/lib/axios'
import type {
  Category,
  CategoryDetail,
  CategoryRecord,
  PaginationMeta,
  SubCategoryListItem,
  SubCategoryRecord,
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
/*  Sub-category list / mutation payloads                              */
/* ------------------------------------------------------------------ */

export interface ListSubCategoriesParams {
  category_id: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateSubCategoryPayload {
  category_id: string
  name_en: string
  name_ar: string
  image_url?: string | null
  description_en?: string | null
  description_ar?: string | null
  display_order?: number
}

export interface UpdateSubCategoryPayload {
  category_id?: string
  name_en?: string
  name_ar?: string
  image_url?: string | null
  description_en?: string | null
  description_ar?: string | null
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

export async function listSubCategories(
  params: ListSubCategoriesParams,
): Promise<{ data: SubCategoryListItem[]; meta: PaginationMeta }> {
  const res = await api.get<{
    success?: boolean
    data: SubCategoryListItem[]
    meta: PaginationMeta
  }>('/admin/sub-categories', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export async function getSubCategoryDetail(id: string): Promise<SubCategoryRecord> {
  const res = await api.get<unknown>(`/admin/sub-categories/${id}`)
  return unwrapEntity<SubCategoryRecord>(res.data)
}

export async function createSubCategory(
  payload: CreateSubCategoryPayload,
): Promise<SubCategoryRecord> {
  const res = await api.post<unknown>('/admin/sub-categories', payload)
  return unwrapEntity<SubCategoryRecord>(res.data)
}

export async function updateSubCategory(
  id: string,
  payload: UpdateSubCategoryPayload,
): Promise<SubCategoryRecord> {
  const res = await api.patch<unknown>(`/admin/sub-categories/${id}`, payload)
  return unwrapEntity<SubCategoryRecord>(res.data)
}

export async function deleteSubCategory(id: string): Promise<void> {
  await api.delete(`/admin/sub-categories/${id}`)
}
