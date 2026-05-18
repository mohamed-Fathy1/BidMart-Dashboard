import { api } from '@/lib/axios'
import { unwrap, type ApiEnvelope } from '@/types/api'

export type ContentType = 'TERMS_AND_CONDITIONS' | 'ABOUT_US' | 'PRIVACY_POLICY'

export interface GeneralInfoContent {
  id: string
  type: ContentType
  content_en: string
  content_ar: string
  version: number
  updated_at: string
}

/** PUT /admin/general-info/{type} wraps the record one level deeper: data.content */
interface UpdateResponseData {
  message: string
  content: GeneralInfoContent
}

export async function getGeneralInfo(type: ContentType): Promise<GeneralInfoContent> {
  const res = await api.get<ApiEnvelope<GeneralInfoContent>>(`/admin/general-info/${type}`)
  return unwrap(res.data)
}

export async function updateGeneralInfo(
  type: ContentType,
  payload: { content_en: string; content_ar: string },
): Promise<GeneralInfoContent> {
  const res = await api.put<ApiEnvelope<UpdateResponseData>>(`/admin/general-info/${type}`, payload)
  const data = unwrap(res.data) as UpdateResponseData
  return data.content
}
