/* ------------------------------------------------------------------ */
/*  Generic response wrappers                                          */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export type AccountStatus =
  | "active"
  | "suspended"
  | "banned"
  | "pending_verification"
  | "deleted";
export type UserRole = "guest" | "user" | "seller" | "admin";
export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type AccountType = "user_only" | "upgraded_to_seller";
export type AuthProvider = "phone" | "google" | "apple";
export type AdminRole =
  | "super_admin"
  | "admin"
  | "finance"
  | "support"
  | "content";

/* ------------------------------------------------------------------ */
/*  Admin (logged-in user)                                             */
/* ------------------------------------------------------------------ */

export interface Admin {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  permissions: string[];
  is_super_admin: boolean;
  is_active: boolean;
}

/** Alias kept for auth store compatibility */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  /** Admin role UUID from JWT; used for client-side guards (e.g. role delete rules). */
  roleId?: string;
  /** From JWT `is_super_admin`; used for UI guards only. */
  isSuperAdmin?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Users (buyer management)                                           */
/* ------------------------------------------------------------------ */

export interface AdminUserListItem {
  id: string;
  accountName: string | null;
  phoneNumber: string | null;
  email: string | null;
  status: AccountStatus;
  accountType: AccountType;
  registrationDate: string;
}

export interface AdminUserDetail {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  avatarUrl: string | null;
  language: string | null;
  store: {
    id: string;
    nameEn: string;
    status: SellerStatus;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Countries                                                          */
/* ------------------------------------------------------------------ */

export interface Country {
  id: string;
  name_en: string;
  name_ar: string;
  iso_code: string;
  image_url: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

/** Row from GET /admin/categories (paginated list; includes sub-category count). */
export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
  subCategoriesCount: number;
  created_at: string;
}

/** Full category fields from GET/PATCH/POST (no nested sub-categories). */
export interface CategoryRecord {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string;
  icon_url: string;
  sub_category_image_url: string;
  description_en: string | null;
  description_ar: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Sub-categories                                                     */
/* ------------------------------------------------------------------ */

export interface SubCategory {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryDetail extends CategoryRecord {
  sub_categories: SubCategory[];
}

/* ------------------------------------------------------------------ */
/*  Providers (admin seller / store management)                          */
/* ------------------------------------------------------------------ */

export interface ProviderCountryRef {
  id: string;
  name_en: string;
  name_ar: string;
}

/** KYC / docs verification column on list rows and detail.documents */
export type ProviderVerificationStatus =
  | "pending_verification"
  | "unverified"
  | "verified";

/** Store account lifecycle from GET /admin/providers and detail.status */
export type ProviderAccountStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "blocked";

export interface ProviderSummary {
  id: string;
  accountName: string;
  phoneNumber: string;
  verificationStatus: ProviderVerificationStatus;
  commercialRegistrationNumber: string;
  country: ProviderCountryRef | null;
  accountStatus: ProviderAccountStatus;
  createdAt: string;
}

export interface ProviderOwner {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: string;
  registeredAt: string;
}

export interface ProviderDocuments {
  commercialRegistrationNumber: string;
  commercialRegistrationDoc: string | null;
  verificationStatus: ProviderVerificationStatus;
}

export interface ProviderReturnPolicy {
  ar: string | null;
  en: string | null;
}

export interface ProviderDetail {
  id: string;
  storeLogo: string | null;
  isVerified: boolean;
  status: ProviderAccountStatus;
  country: ProviderCountryRef | null;
  detailedAddress: string | null;
  returnPolicy: ProviderReturnPolicy;
  owner: ProviderOwner;
  documents: ProviderDocuments;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Roles (admin RBAC)                                                 */
/* ------------------------------------------------------------------ */

export interface RoleListItem {
  id: string;
  name_en: string;
  name_ar: string;
  adminCount: number;
  isProtected: boolean;
  createdAt: string;
}

export interface RoleDetail extends RoleListItem {
  permissions: string[];
  updatedAt: string;
}

export interface RolePermissionDefinition {
  key: string;
  label_en: string;
  label_ar: string;
}

export interface RolePermissionModule {
  module_en: string;
  module_ar: string;
  permissions: RolePermissionDefinition[];
}

/* ------------------------------------------------------------------ */
/*  Admins (operator accounts)                                         */
/* ------------------------------------------------------------------ */

export interface AdminAccountRole {
  id: string;
  name_en: string;
  name_ar: string;
}

export interface AdminAccountListItem {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
  role: AdminAccountRole;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Detail payload matches list rows from this API */
export type AdminAccountDetail = AdminAccountListItem;
