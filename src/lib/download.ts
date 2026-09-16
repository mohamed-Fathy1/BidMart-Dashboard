/**
 * Browser-side file saving for endpoints that answer with a file body.
 */

/**
 * Read the filename out of a `Content-Disposition` header. Supports the
 * RFC 6266 `filename*=UTF-8''...` form first, then the quoted and bare
 * `filename=` forms. Returns `fallback` when the header carries none.
 */
export function parseContentDispositionFilename(
  header: string | undefined | null,
  fallback: string,
): string {
  if (!header) return fallback
  const extended = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header)
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].trim())
    } catch {
      // fall through to the plain form
    }
  }
  const quoted = /filename\s*=\s*"([^"]+)"/.exec(header)
  if (quoted?.[1]) return quoted[1]
  const bare = /filename\s*=\s*([^;]+)/.exec(header)
  if (bare?.[1]) return bare[1].trim()
  return fallback
}

/** Trigger a download of `blob` under `filename` and release the object URL. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Defer the revoke so the click has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
