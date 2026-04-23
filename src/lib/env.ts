export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL as string ?? 'http://localhost:3000/api',
} as const
