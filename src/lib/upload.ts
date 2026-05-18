import { api } from '@/lib/axios'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FileItem {
  contentType: string
  fileName: string
}

interface UploadResult {
  preSignedURL: string
  mediaUrl: string
}

/** Admin upload endpoint wraps results; accepts `meta` (admin) or `timestamp` (legacy client). */
interface UploadResponse {
  success: true
  data: UploadResult[]
  meta?: { version?: string }
  timestamp?: string
}

export type UploadCase =
  | 'profile_picture'
  | 'store_logo'
  | 'product_image'
  | 'cr_document'
  | 'live_show_thumbnail'
  | 'chat_media'
  | 'complaint_submission'
  | 'category_image'
  | 'country_image'
  | 'sub_category_image'

function fileExtensionForContentType(contentType: string): string {
  if (contentType === 'image/jpeg' || contentType === 'image/jpg') return 'jpg'
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  if (contentType === 'image/gif') return 'gif'
  return 'bin'
}

function buildObjectFileName(uploadCase: UploadCase, contentType: string): string {
  const ext = fileExtensionForContentType(contentType)
  return `${uploadCase}/${crypto.randomUUID()}-${Date.now()}.${ext}`
}

/* ------------------------------------------------------------------ */
/*  Get presigned URL                                                  */
/* ------------------------------------------------------------------ */

async function getPresignedUrls(
  uploadCase: UploadCase,
  files: FileItem[],
): Promise<UploadResult[]> {
  const res = await api.post<UploadResponse>('/admin/files/upload', {
    case: uploadCase,
    files,
  })
  return res.data.data
}

/* ------------------------------------------------------------------ */
/*  Upload a single file                                               */
/* ------------------------------------------------------------------ */

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export async function uploadFile(
  file: File,
  uploadCase: UploadCase,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  // 1. Get presigned URL
  const results = await getPresignedUrls(uploadCase, [
    {
      contentType: file.type,
      fileName: buildObjectFileName(uploadCase, file.type),
    },
  ])
  const result = results[0]
  if (!result) {
    throw new Error('No presigned URL returned')
  }

  // 2. PUT file directly to S3
  await fetch(result.preSignedURL, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  }).then((res) => {
    if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`)
    // Report 100% on completion
    onProgress?.({ loaded: file.size, total: file.size, percent: 100 })
  })

  // 3. Return the permanent media URL
  return result.mediaUrl
}

/* ------------------------------------------------------------------ */
/*  Delete a file from S3                                              */
/* ------------------------------------------------------------------ */

export async function deleteFile(key: string): Promise<void> {
  await api.delete('/admin/files', { data: { key } })
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** PNG, JPEG, WebP — default for dashboard image uploads */
export const DEFAULT_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateImageFile(
  file: File,
  allowedMimeTypes: readonly string[] = DEFAULT_IMAGE_MIME_TYPES,
): string | null {
  if (!allowedMimeTypes.includes(file.type)) {
    return 'invalid_type'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'too_large'
  }
  return null
}

/** Extract the S3 key from a full mediaUrl for deletion */
export function extractS3Key(mediaUrl: string): string | null {
  try {
    const url = new URL(mediaUrl)
    // Remove leading slash
    return url.pathname.slice(1)
  } catch {
    return null
  }
}
