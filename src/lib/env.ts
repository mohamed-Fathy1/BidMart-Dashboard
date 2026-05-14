const RAW_API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api'

const RAW_SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string | undefined

/**
 * Strip `/api` (or `/api/`) from the end of the API URL so socket.io can
 * connect to the namespace root. Falls back to the API URL itself when no
 * trailing `/api` is present.
 */
function deriveSocketUrl(apiUrl: string): string {
  return apiUrl.replace(/\/api\/?$/, '') || apiUrl
}

export const env = {
  VITE_API_URL: RAW_API_URL,
  VITE_SOCKET_URL: RAW_SOCKET_URL ?? deriveSocketUrl(RAW_API_URL),
} as const
