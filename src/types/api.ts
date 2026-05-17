/* ------------------------------------------------------------------ */
/*  Generic response wrappers                                          */
/* ------------------------------------------------------------------ */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Server envelope: every admin response is wrapped in `{ success, data, ... }`. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  timestamp?: string;
}

/** Legacy strict alias — kept for compatibility. Prefer ApiEnvelope. */
export type ApiResponse<T> = ApiEnvelope<T>;

/** Standard list shape returned by `list*` api helpers after unwrapping. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Legacy alias — prefer `Paginated<T>`. */
export type PaginatedResponse<T> = Paginated<T>;

/**
 * Unwraps an `{ success, data, ... }` envelope when present; otherwise returns
 * the body as-is. Use in `*.api.ts` to keep call sites agnostic of whether the
 * server wrapped a particular endpoint.
 */
export function unwrap<T>(body: ApiEnvelope<T> | T): T {
  if (
    body !== null &&
    typeof body === "object" &&
    "success" in (body as object) &&
    "data" in (body as object)
  ) {
    return (body as ApiEnvelope<T>).data;
  }
  return body as T;
}

/**
 * Unwraps a paginated `{ success, data: T[], meta }` envelope into the
 * `Paginated<T>` shape every `list*` API helper returns. Throws if `meta` is
 * missing — list endpoints are required to include it.
 */
export function unwrapPaginated<T>(
  body: ApiEnvelope<T[]> | { data: T[]; meta: PaginationMeta },
): Paginated<T> {
  const data = "success" in body ? body.data : body.data;
  const meta = body.meta;
  if (!meta) {
    throw new Error("unwrapPaginated: response has no `meta` — endpoint not paginated?");
  }
  return { data, meta };
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
  /** From `GET /admin/profile`; omitted until session is hydrated from the API. */
  phone?: string | null;
  /** Role labels from `GET /admin/profile` (read-only). */
  roleNameEn?: string;
  roleNameAr?: string;
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

/** Verification row nested under GET /admin/users/{id} → stores[].verification_requests */
export interface AdminUserStoreVerificationRequest {
  id: string;
  commercial_registration_number: string;
  commercial_registration_doc: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

/** Store row from GET /admin/users/{id} */
export interface AdminUserStore {
  id: string;
  store_logo: string | null;
  commercial_registration_number: string | null;
  commercial_registration_doc: string | null;
  /** Lowercase lifecycle — map with `providerAccountStatusForSellerBadge` for badges */
  status: string;
  is_verified: boolean;
  return_policy_ar: string | null;
  return_policy_en: string | null;
  created_at: string;
  verification_requests: AdminUserStoreVerificationRequest[];
}

/** GET /admin/users/{userId} — buyers only (`user` | `seller`), snake_case matches API */
export interface AdminUserDetail {
  id: string;
  email: string | null;
  phone_number: string;
  full_name: string | null;
  profile_picture: string | null;
  role: Extract<UserRole, "user" | "seller">;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
  stores: AdminUserStore[];
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
  /** Present on create/update/detail; list rows may omit. */
  updated_at?: string;
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

export interface SubCategoryParentRef {
  id: string;
  name_en: string;
  name_ar: string;
}

/** Row from GET /admin/sub-categories (paginated list). */
export interface SubCategoryListItem {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  parentCategory?: SubCategoryParentRef;
  created_at: string;
}

/** Full record from GET/PATCH/POST /admin/sub-categories/{id}. */
export interface SubCategoryRecord {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  description_en: string | null;
  description_ar: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Alias — legacy name for full sub-category rows. */
export type SubCategory = SubCategoryRecord;

export interface CategoryDetail extends CategoryRecord {
  sub_categories: SubCategoryRecord[];
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

/* ------------------------------------------------------------------ */
/*  Complaints (support chat)                                          */
/* ------------------------------------------------------------------ */

export type ComplaintStatus =
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export type ComplaintChatClosedReason =
  | "resolved"
  | "rejected"
  | "manually_closed"
  | null;

export type ComplaintMessageType = "TEXT" | "IMAGE";
export type ComplaintMessageStatus = "SENT" | "DELIVERED" | "READ";
export type ComplaintMessageSender = "USER" | "ADMIN";

export interface ComplaintTypeRef {
  id: string;
  name_en: string;
  name_ar: string;
}

/** Localized complaint type (mobile GET /complaints/types). */
export interface ComplaintTypeOption {
  id: string;
  name: string;
}

export interface ComplaintSubmitterRef {
  id: string;
  full_name: string | null;
}

export interface ComplaintSubmitterDetail extends ComplaintSubmitterRef {
  phone_number: string | null;
}

export interface ComplaintLastMessage {
  content: string;
  messageType: ComplaintMessageType;
  createdAt: string;
  isRead: boolean;
}

export interface ComplaintSummary {
  id: string;
  submitter: ComplaintSubmitterRef;
  complaint_type: ComplaintTypeRef;
  status: ComplaintStatus;
  description_preview: string;
  adminUnreadCount: number;
  lastMessage: ComplaintLastMessage | null;
  created_at: string;
}

export interface ComplaintMessageAdmin {
  id: string;
  sender: ComplaintMessageSender;
  senderId: string;
  messageType: ComplaintMessageType;
  content: string | null;
  imageUrl: string | null;
  status: ComplaintMessageStatus;
  deliveredAt: string | null;
  readAt: string | null;
  isMe: boolean;
  createdAt: string;
}

export interface ComplaintNoteItem {
  id: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export type ComplaintActivityAction =
  | "started_investigation"
  | "resolved"
  | "rejected"
  | "added_note"
  | "sent_notification"
  | "closed_conversation";

export interface ComplaintActivityItem {
  id: string;
  actor_type: "admin" | "system";
  actor_id: string | null;
  action: ComplaintActivityAction | string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ComplaintDetail {
  id: string;
  submitter: ComplaintSubmitterDetail;
  complaint_type: ComplaintTypeRef;
  status: ComplaintStatus;
  description: string;
  attachment_urls: string[];
  notes: ComplaintNoteItem[];
  activities: ComplaintActivityItem[];
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  conversation_closed: boolean;
  messages: ComplaintMessageAdmin[];
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Support tickets (contact messages)                                 */
/* ------------------------------------------------------------------ */

export type SupportTicketStatus = "NEW" | "CONTACTED" | "UNDER_REVIEW";

export type SupportTicketMessageType =
  | "COMPLAINT"
  | "SUGGESTION"
  | "INQUIRY"
  | "ADVERTISEMENT"
  | "OTHER";

export interface SupportTicketStatusHistoryEntry {
  id: string;
  status: SupportTicketStatus;
  admin_name: string;
  changed_at: string;
}

/** Row from GET /admin/support-tickets (paginated list). */
export interface SupportTicketListItem {
  id: string;
  serial_number: number;
  user_name: string;
  email: string;
  phone_number: string;
  message_type: SupportTicketMessageType;
  status: SupportTicketStatus;
  created_at: string;
}

/** Full record from GET /admin/support-tickets/{id}. */
export interface SupportTicketDetail extends SupportTicketListItem {
  content: string;
  status_history?: SupportTicketStatusHistoryEntry[];
}

/* ------------------------------------------------------------------ */
/*  System settings                                                    */
/* ------------------------------------------------------------------ */

export interface PhoneEntry {
  country_code: string;
  number: string;
}

export interface SocialMediaLinks {
  twitter?: string;
  tiktok?: string;
  snapchat?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
}

export interface SystemSettings {
  phone_numbers: PhoneEntry[];
  whatsapp_numbers: PhoneEntry[];
  email: string;
  dollar_to_riyal_rate: number;
  order_commission_percentage: number;
  referral_amount_sar: number;
  min_liquidation_amount_sar: number;
  social_media: SocialMediaLinks;
}
