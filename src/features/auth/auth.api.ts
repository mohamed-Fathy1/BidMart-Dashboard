import type { User } from '@/types/api'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
  permissions: string[]
}

interface MeResponse {
  user: User
  permissions: string[]
}

const MOCK_USER: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@bidmart.sa',
  role: 'super_admin',
  avatar: undefined,
}

const MOCK_PERMISSIONS = [
  'providers.read', 'providers.approve', 'providers.reject', 'providers.verify',
  'withdrawals.read', 'withdrawals.approve', 'withdrawals.reject',
  'users.read', 'users.block', 'users.activate',
  'moderators.read', 'moderators.create', 'moderators.edit', 'moderators.block',
  'roles.read', 'roles.create', 'roles.edit', 'roles.delete',
  'reports.read', 'reports.export',
  'complaints.read', 'complaints.resolve',
  'ratings.read',
  'streams.read',
  'content.edit',
  'categories.edit',
  'settings.edit',
]

const MOCK_TOKEN = 'mock-jwt-token-bidmart-dev'

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500))

  if (data.email === 'admin@bidmart.sa' && data.password === 'password') {
    return { token: MOCK_TOKEN, user: MOCK_USER, permissions: MOCK_PERMISSIONS }
  }

  // Accept any credentials in dev mode
  return { token: MOCK_TOKEN, user: { ...MOCK_USER, email: data.email }, permissions: MOCK_PERMISSIONS }
}

export async function getMeRequest(): Promise<MeResponse> {
  await new Promise((r) => setTimeout(r, 300))
  return { user: MOCK_USER, permissions: MOCK_PERMISSIONS }
}
