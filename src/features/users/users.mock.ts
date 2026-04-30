import type { AdminUserListItem, AdminUserDetail, PaginationMeta } from '@/types/api'

export const mockUsers: AdminUserListItem[] = [
  {
    id: '1a2b3c4d-0001-4000-8000-000000000001',
    accountName: 'Ahmed Ali',
    phoneNumber: '+966500000001',
    email: 'ahmed@example.com',
    status: 'active',
    accountType: 'upgraded_to_seller',
    registrationDate: '2025-11-03T14:23:00.000Z',
  },
  {
    id: '1a2b3c4d-0002-4000-8000-000000000002',
    accountName: 'Fatima Hassan',
    phoneNumber: '+966500000002',
    email: 'fatima@example.com',
    status: 'active',
    accountType: 'user_only',
    registrationDate: '2025-12-15T09:10:00.000Z',
  },
  {
    id: '1a2b3c4d-0003-4000-8000-000000000003',
    accountName: 'Omar Khalid',
    phoneNumber: '+966500000003',
    email: null,
    status: 'banned',
    accountType: 'user_only',
    registrationDate: '2026-01-05T17:45:00.000Z',
  },
  {
    id: '1a2b3c4d-0004-4000-8000-000000000004',
    accountName: 'Sara Mohammed',
    phoneNumber: '+966500000004',
    email: 'sara.m@example.com',
    status: 'suspended',
    accountType: 'upgraded_to_seller',
    registrationDate: '2026-01-20T08:30:00.000Z',
  },
  {
    id: '1a2b3c4d-0005-4000-8000-000000000005',
    accountName: 'Khalid Ibrahim',
    phoneNumber: '+966500000005',
    email: 'khalid.i@example.com',
    status: 'active',
    accountType: 'user_only',
    registrationDate: '2026-02-10T12:00:00.000Z',
  },
  {
    id: '1a2b3c4d-0006-4000-8000-000000000006',
    accountName: 'Noura Abdulaziz',
    phoneNumber: '+966500000006',
    email: 'noura@example.com',
    status: 'active',
    accountType: 'upgraded_to_seller',
    registrationDate: '2026-02-22T15:20:00.000Z',
  },
  {
    id: '1a2b3c4d-0007-4000-8000-000000000007',
    accountName: 'Mohammed Saeed',
    phoneNumber: '+966500000007',
    email: null,
    status: 'active',
    accountType: 'user_only',
    registrationDate: '2026-03-01T10:45:00.000Z',
  },
  {
    id: '1a2b3c4d-0008-4000-8000-000000000008',
    accountName: 'Aisha Youssef',
    phoneNumber: '+966500000008',
    email: 'aisha.y@example.com',
    status: 'banned',
    accountType: 'user_only',
    registrationDate: '2026-03-10T06:15:00.000Z',
  },
  {
    id: '1a2b3c4d-0009-4000-8000-000000000009',
    accountName: 'Abdulrahman Nasser',
    phoneNumber: '+966500000009',
    email: 'abdulrahman@example.com',
    status: 'active',
    accountType: 'upgraded_to_seller',
    registrationDate: '2026-03-18T14:00:00.000Z',
  },
  {
    id: '1a2b3c4d-0010-4000-8000-000000000010',
    accountName: 'Huda Saleh',
    phoneNumber: '+966500000010',
    email: 'huda.s@example.com',
    status: 'suspended',
    accountType: 'user_only',
    registrationDate: '2026-04-01T11:30:00.000Z',
  },
  {
    id: '1a2b3c4d-0011-4000-8000-000000000011',
    accountName: 'Youssef Tariq',
    phoneNumber: '+966500000011',
    email: 'youssef.t@example.com',
    status: 'active',
    accountType: 'user_only',
    registrationDate: '2026-04-05T09:00:00.000Z',
  },
  {
    id: '1a2b3c4d-0012-4000-8000-000000000012',
    accountName: 'Layla Ahmad',
    phoneNumber: '+966500000012',
    email: 'layla@example.com',
    status: 'active',
    accountType: 'upgraded_to_seller',
    registrationDate: '2026-04-12T16:45:00.000Z',
  },
]

export const mockUserDetails: Record<string, AdminUserDetail> = {
  '1a2b3c4d-0001-4000-8000-000000000001': {
    id: '1a2b3c4d-0001-4000-8000-000000000001',
    fullName: 'Ahmed Ali',
    email: 'ahmed@example.com',
    phone: '+966500000001',
    role: 'SELLER',
    isActive: true,
    isVerified: true,
    avatarUrl: null,
    language: 'ar',
    store: { id: 'store-001', nameEn: 'Ahmed Electronics', status: 'APPROVED' },
    createdAt: '2025-11-03T14:23:00.000Z',
    updatedAt: '2026-04-10T08:00:00.000Z',
  },
  '1a2b3c4d-0002-4000-8000-000000000002': {
    id: '1a2b3c4d-0002-4000-8000-000000000002',
    fullName: 'Fatima Hassan',
    email: 'fatima@example.com',
    phone: '+966500000002',
    role: 'USER',
    isActive: true,
    isVerified: true,
    avatarUrl: null,
    language: 'en',
    store: null,
    createdAt: '2025-12-15T09:10:00.000Z',
    updatedAt: '2026-03-20T12:00:00.000Z',
  },
  '1a2b3c4d-0003-4000-8000-000000000003': {
    id: '1a2b3c4d-0003-4000-8000-000000000003',
    fullName: 'Omar Khalid',
    email: null,
    phone: '+966500000003',
    role: 'USER',
    isActive: false,
    isVerified: false,
    avatarUrl: null,
    language: 'ar',
    store: null,
    createdAt: '2026-01-05T17:45:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  },
  '1a2b3c4d-0004-4000-8000-000000000004': {
    id: '1a2b3c4d-0004-4000-8000-000000000004',
    fullName: 'Sara Mohammed',
    email: 'sara.m@example.com',
    phone: '+966500000004',
    role: 'SELLER',
    isActive: false,
    isVerified: true,
    avatarUrl: null,
    language: 'ar',
    store: { id: 'store-004', nameEn: 'Sara Fashion', status: 'SUSPENDED' },
    createdAt: '2026-01-20T08:30:00.000Z',
    updatedAt: '2026-03-15T14:00:00.000Z',
  },
}

/** Simulates server-side filtering + pagination on mockUsers */
export function getMockUserList(params: {
  search?: string
  status?: string
  accountType?: string
  page?: number
  limit?: number
}): { data: AdminUserListItem[]; meta: PaginationMeta } {
  const { search, status, accountType, page = 1, limit = 10 } = params

  let filtered = [...mockUsers]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.accountName.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.phoneNumber.includes(q),
    )
  }

  if (status) {
    filtered = filtered.filter((u) => u.status === status)
  }

  if (accountType) {
    filtered = filtered.filter((u) => u.accountType === accountType)
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit)

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}
