import { api } from '@/lib/axios'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FileItem {
  contentType: string
  fileName?: string
}

interface UploadResult {
  preSignedURL: string
  mediaUrl: string
}

interface UploadResponse {
  success: true
  data: UploadResult[]
  timestamp: string
}

export type UploadCase =
  | 'category_image'
  | 'country_image'
  | 'sub_category_image'
  | 'product_image'

/* ------------------------------------------------------------------ */
/*  Get presigned URL                                                  */
/* ------------------------------------------------------------------ */

async function getPresignedUrls(
  uploadCase: UploadCase,
  files: FileItem[],
): Promise<UploadResult[]> {
  const res = await api.post<UploadResponse>('/files/upload', {
    folder: uploadCase,
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
  const [result] = await getPresignedUrls(uploadCase, [
    { contentType: file.type },
  ])

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
  await api.delete('/files', { data: { key } })
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
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
