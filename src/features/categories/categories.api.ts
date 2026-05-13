import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type ApiEnvelope,
  type Category,
  type CategoryDetail,
  type CategoryRecord,
  type Paginated,
  type SubCategoryListItem,
  type SubCategoryRecord,
} from '@/types/api'

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
): Promise<Paginated<Category>> {
  const res = await api.get<ApiEnvelope<Category[]>>('/admin/categories', { params })
  return unwrapPaginated(res.data)
}

export async function getCategoryDetail(id: string): Promise<CategoryDetail> {
  const res = await api.get<ApiEnvelope<CategoryDetail> | CategoryDetail>(
    `/admin/categories/${id}`,
  )
  return unwrap(res.data)
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<CategoryRecord> {
  const res = await api.post<ApiEnvelope<CategoryRecord> | CategoryRecord>(
    '/admin/categories',
    payload,
  )
  return unwrap(res.data)
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<CategoryRecord> {
  const res = await api.patch<ApiEnvelope<CategoryRecord> | CategoryRecord>(
    `/admin/categories/${id}`,
    payload,
  )
  return unwrap(res.data)
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`)
}

/* ------------------------------------------------------------------ */
/*  Sub-category API functions                                         */
/* ------------------------------------------------------------------ */

export async function listSubCategories(
  params: ListSubCategoriesParams,
): Promise<Paginated<SubCategoryListItem>> {
  const res = await api.get<ApiEnvelope<SubCategoryListItem[]>>('/admin/sub-categories', { params })
  return unwrapPaginated(res.data)
}

export async function getSubCategoryDetail(id: string): Promise<SubCategoryRecord> {
  const res = await api.get<ApiEnvelope<SubCategoryRecord> | SubCategoryRecord>(
    `/admin/sub-categories/${id}`,
  )
  return unwrap(res.data)
}

export async function createSubCategory(
  payload: CreateSubCategoryPayload,
): Promise<SubCategoryRecord> {
  const res = await api.post<ApiEnvelope<SubCategoryRecord> | SubCategoryRecord>(
    '/admin/sub-categories',
    payload,
  )
  return unwrap(res.data)
}

export async function updateSubCategory(
  id: string,
  payload: UpdateSubCategoryPayload,
): Promise<SubCategoryRecord> {
  const res = await api.patch<ApiEnvelope<SubCategoryRecord> | SubCategoryRecord>(
    `/admin/sub-categories/${id}`,
    payload,
  )
  return unwrap(res.data)
}

export async function deleteSubCategory(id: string): Promise<void> {
  await api.delete(`/admin/sub-categories/${id}`)
}
