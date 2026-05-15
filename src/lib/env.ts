const RAW_API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api'

const RAW_SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string | undefined

/**
 * Strip a trailing `/api` (optionally followed by `/v<digits>`) from the API
 * URL so socket.io connects to the host root. The server hosts the namespace
 * at `/complaint-chat`; if we carried `/api/v1` into the URL, the client
 * would request namespace `/api/v1/complaint-chat` and the server would reject
 * with "Invalid namespace".
 */
function deriveSocketUrl(apiUrl: string): string {
  return apiUrl.replace(/\/api(\/v\d+)?\/?$/, '') || apiUrl
}

export const env = {
  VITE_API_URL: RAW_API_URL,
  VITE_SOCKET_URL: RAW_SOCKET_URL ?? deriveSocketUrl(RAW_API_URL),
} as const
