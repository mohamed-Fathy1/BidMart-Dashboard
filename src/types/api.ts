/* ------------------------------------------------------------------ */
/*  Generic response wrappers                                          */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T> {
  success: true
  data: T
  timestamp: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export type AccountStatus = 'active' | 'suspended' | 'banned' | 'pending_verification' | 'deleted'
export type UserRole = 'USER' | 'SELLER' | 'ADMIN'
export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type AccountType = 'user_only' | 'upgraded_to_seller'
export type AuthProvider = 'phone' | 'google' | 'apple'
export type AdminRole = 'super_admin' | 'admin' | 'finance' | 'support' | 'content'

/* ------------------------------------------------------------------ */
/*  Admin (logged-in user)                                             */
/* ------------------------------------------------------------------ */

export interface Admin {
  id: string
  email: string
  full_name: string | null
  role: AdminRole
  permissions: string[]
  is_super_admin: boolean
  is_active: boolean
}

/** Alias kept for auth store compatibility */
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

/* ------------------------------------------------------------------ */
/*  Users (buyer management)                                           */
/* ------------------------------------------------------------------ */

export interface AdminUserListItem {
  id: string
  accountName: string
  phoneNumber: string
  email: string | null
  status: AccountStatus
  accountType: AccountType
  registrationDate: string
}

export interface AdminUserDetail {
  id: string
  fullName: string
  email: string | null
  phone: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
  avatarUrl: string | null
  language: string | null
  store: {
    id: string
    nameEn: string
    status: SellerStatus
  } | null
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/*  Countries                                                          */
/* ------------------------------------------------------------------ */

export interface Country {
  id: string
  name_en: string
  name_ar: string
  iso_code: string
  image_url: string
  is_enabled: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string
  name_en: string
  name_ar: string
  image_url: string
  icon_url: string
  sub_category_image_url: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface CategoryDetail extends Category {
  sub_categories: SubCategory[]
}

/* ------------------------------------------------------------------ */
/*  Sub-categories                                                     */
/* ------------------------------------------------------------------ */

export interface SubCategory {
  id: string
  category_id: string
  name_en: string
  name_ar: string
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

/* ------------------------------------------------------------------ */
/*  Providers                                                          */
/* ------------------------------------------------------------------ */

export interface ProviderUser {
  id: string
  fullName: string
  email: string
}

export interface ProviderSummary {
  id: string
  nameEn: string
  nameAr: string
  status: SellerStatus
  isVerified: boolean
  user: ProviderUser
  createdAt: string
}

export interface ProviderDetail extends ProviderSummary {
  averageRating: number
  totalSold: number
}
