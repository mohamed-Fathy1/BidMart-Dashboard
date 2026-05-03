import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Two-letter initials for avatar fallback (full name preferred, then email). */
export function accountInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const n = name?.trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const a = parts[0][0]
      const b = parts[parts.length - 1][0]
      if (a && b) return (a + b).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }
  const e = email?.trim()
  if (e) return e.slice(0, 2).toUpperCase()
  return '?'
}
