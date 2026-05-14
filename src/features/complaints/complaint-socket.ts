import { io, type Socket } from 'socket.io-client'
import { env } from '@/lib/env'
import { useAuthStore } from '@/features/auth/auth.store'

export type ComplaintSocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

type StatusListener = (status: ComplaintSocketStatus) => void

let socket: Socket | null = null
let currentStatus: ComplaintSocketStatus = 'idle'
const listeners = new Set<StatusListener>()

function setStatus(next: ComplaintSocketStatus): void {
  if (currentStatus === next) return
  currentStatus = next
  for (const listener of listeners) {
    try {
      listener(next)
    } catch {
      /* listener errors must not break the socket lifecycle */
    }
  }
}

function bindLifecycle(s: Socket): void {
  setStatus('connecting')
  s.on('connect', () => setStatus('connected'))
  s.on('disconnect', () => setStatus('disconnected'))
  s.on('connect_error', () => setStatus('disconnected'))
  s.io.on('reconnect_attempt', () => setStatus('reconnecting'))
  s.io.on('reconnect', () => setStatus('connected'))
}

/**
 * Lazy singleton. Creates the socket on first call with the active admin
 * token; reuses it across mounts. Status changes flow through `subscribeStatus`.
 */
export function getComplaintSocket(): Socket | null {
  const token = useAuthStore.getState().token
  if (!token) return null
  if (socket && socket.connected) return socket
  if (socket) {
    if (!socket.connected) socket.connect()
    return socket
  }
  socket = io(`${env.VITE_SOCKET_URL}/complaint-chat`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 750,
    reconnectionDelayMax: 8000,
    autoConnect: true,
  })
  bindLifecycle(socket)
  return socket
}

export function disconnectComplaintSocket(): void {
  if (!socket) return
  try {
    socket.removeAllListeners()
    socket.disconnect()
  } finally {
    socket = null
    setStatus('idle')
  }
}

export function getComplaintSocketStatus(): ComplaintSocketStatus {
  return currentStatus
}

export function subscribeComplaintSocketStatus(listener: StatusListener): () => void {
  listeners.add(listener)
  // Fire once with the current value so subscribers can hydrate.
  listener(currentStatus)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Auto-disconnect when the admin logs out. Keeps `auth.store.ts` ignorant of
 * socket internals (no upward import). Subscribed once at module load.
 */
useAuthStore.subscribe((state, prev) => {
  if (prev.token && !state.token) {
    disconnectComplaintSocket()
  }
})
