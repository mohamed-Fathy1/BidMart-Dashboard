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

export type ComplaintMessageType = "TEXT" | "MEDIA";
export type ComplaintMessageStatus = "SENT" | "DELIVERED" | "READ";
export type ComplaintMessageSender = "USER" | "ADMIN";

export interface ComplaintTypeRef {
  id: string;
  name_en: string;
  name_ar: string;
}

/** Admin complaint type row — GET /admin/complaint-types (list + create/update). */
export interface ComplaintType {
  id: string;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
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
  fileUrl: string | null;
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
  updated_at?: string;
}

/* ------------------------------------------------------------------ */
/*  Banks (admin)                                                       */
/* ------------------------------------------------------------------ */

export interface Bank {
  id: string;
  nameEn: string;
  nameAr: string;
  countryId: string;
  /** Present only on list responses; create/update/toggle omit (relation not re-fetched). */
  countryNameEn?: string;
  countryNameAr?: string;
  isActive: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Wallet (admin)                                                      */
/* ------------------------------------------------------------------ */

export type WalletTxType =
  | "TOP_UP"
  | "ORDER_PAYMENT"
  | "ORDER_REFUND"
  | "SELLER_PAYOUT"
  | "REFERRAL_CREDIT"
  | "ADMIN_ADJUSTMENT";

export type WalletTxStatus = "COMPLETED" | "PROCESSING";

export interface AdminWalletDashboard {
  /** Money strings — always 2 decimals (e.g. "450.00"). */
  balance: string;
  holdingBalance: string;
  availableForSettlement: string;
  currencyCode: string;
  sellerName: string;
  sellerPhone: string | null;
  sellerEmail: string | null;
}

/**
 * Wallet transaction ledger row.
 * `amount` is a pre-formatted display string with a sign prefix:
 * credits start with `+` (e.g. "+300.00"), debits start with U+2212 `−`
 * (e.g. "−150.00"), NOT the ASCII hyphen `-`. Do not parseFloat directly.
 */
export interface AdminWalletTxItem {
  id: string;
  amount: string;
  type: WalletTxType;
  status: WalletTxStatus;
  notes: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Admin Notifications                                                */
/* ------------------------------------------------------------------ */

/** Every notification type emitted by the backend that targets admins. */
export type NotificationType =
  | "NEW_SELLER_APPLICATION"
  | "VERIFICATION_REQUESTED"
  | "SETTLEMENT_REQUESTED"
  | "CONTACT_MESSAGE_RECEIVED"
  | "NEW_COMPLAINT"
  | "COMPLAINT_MESSAGE"
  | "ACCOUNT_DELETION_REQUESTED"
  | "GENERAL";

/** Deep-link target the dashboard can open from a notification row. */
export type NotificationActionType =
  | "SELLER"
  | "USER"
  | "SUPPORT"
  | "SETTLEMENT"
  | "COMPLAINT";

/** Row from GET /admin/notifications — dual-language; no Accept-Language. */
export interface AdminNotification {
  id: string;
  type: NotificationType;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  is_read: boolean;
  action_type: NotificationActionType | null;
  action_id: string | null;
  image_url: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Withdrawals / Settlements (admin)                                   */
/* ------------------------------------------------------------------ */

export type SettlementRequestStatus =
  | "NEW"
  | "APPROVED"
  | "REJECTED"
  | "ADJUSTED";

export interface SettlementListItem {
  id: string;
  sellerName: string;
  sellerPhone: string;
  /** Money string — e.g. "150.00". */
  requestedAmount: string;
  status: SettlementRequestStatus;
  submittedAt: string;
  actionedAt: string | null;
}

export interface SettlementDetail {
  id: string;
  submittedAt: string;
  status: SettlementRequestStatus;
  actionedAt: string | null;
  actionedByName: string | null;

  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerId: string;

  /** Money strings — always 2 decimals. */
  requestedAmount: string;
  /** Set only when status === 'ADJUSTED'. */
  adjustedAmount: string | null;
  /** Available balance snapshot (`full - holding`) at submission time. */
  balanceSnapshot: string;
  holdingSnapshot: string;
  fullBalanceSnapshot: string;

  bankNameEn: string;
  bankNameAr: string;
  /** First 4 + `*`×(len−8) + last 4. Server-masked. */
  ibanMasked: string;

  adminNotes: string | null;
}

/* ------------------------------------------------------------------ */
/*  Admin reports (Sprint 8)                                           */
/* ------------------------------------------------------------------ */

/** Contract A (statistics): the calendar unit containing the anchor date. */
export type StatisticsPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

/** The window the server actually used, echoed on every reporting response. */
export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export type RecentActivityType = "ORDER" | "LIVE_SHOW" | "NEW_USER";

export interface RecentActivityItem {
  type: RecentActivityType;
  /** Order id, show id or user id depending on `type`. */
  id: string;
  title: string;
  subtitle: string | null;
  /** Order total on `ORDER` rows, null otherwise. */
  amount: number | null;
  occurredAt: string;
}

export interface StatisticsOverview {
  period: StatisticsPeriod;
  dateRange: ReportDateRange;
  newUsers: number;
  /** Snapshot of sellers approved and active right now; ignores the window. */
  activeSellers: number;
  listedProducts: number;
  sales: {
    totalRevenue: number;
    totalOrders: number;
    platformCommission: number;
  };
  engagement: {
    views: number;
    savedItems: number;
    comments: number;
    shares: number;
    /** Already a percentage (28.9 means 28.9%). */
    engagementRate: number;
  };
  recentActivity: RecentActivityItem[];
}

export interface TopCategory {
  categoryId: string;
  nameEn: string;
  nameAr: string;
  revenue: number;
  orderCount: number;
}

export interface TopSeller {
  /** A users.id, not a store id. */
  sellerId: string;
  username: string;
  fullName: string | null;
  profilePicture: string | null;
  revenue: number;
  orderCount: number;
}

export interface StatisticsBusinessActivity {
  period: StatisticsPeriod;
  dateRange: ReportDateRange;
  liveShows: number;
  completedDeals: number;
  totalSales: number;
  topCategories: TopCategory[];
  topSellers: TopSeller[];
}

export interface CountValue {
  count: number;
  value: number;
}

export interface MonthlyFinancialRow {
  /** `YYYY-MM`. */
  month: string;
  grossSales: number;
  commission: number;
  tax: number;
  shipping: number;
  refunds: number;
  platformRevenue: number;
  /** `platformRevenue - refunds`; can be negative. */
  net: number;
}

export interface StatisticsFinancialOverview {
  period: StatisticsPeriod;
  dateRange: ReportDateRange;
  totalCommissionRevenue: number;
  totalSales: number;
  totalTaxCollected: number;
  totalShippingCollected: number;
  pendingPayment: CountValue;
  delivered: CountValue;
  refunds: CountValue;
  /** Always exactly 12 rows, oldest first, ending with the month of `dateRange.endDate`. */
  monthlyReports: MonthlyFinancialRow[];
}

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PENDING_CONFIRMATION"
  | "PREPARING_PACKAGE"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED_FULL"
  | "REFUNDED_PARTIAL"
  | "REFUND_REJECTED"
  | "PAYOUT_COMPLETE";

/** Financial Report buckets: a fulfilment view of paid orders only. */
export type FinancialReportStatus = "COMPLETED" | "IN_DELIVERY" | "IN_PROGRESS";

/** Orders & Sales groups: an exhaustive partition of every order created in the window. */
export type OrderReportGroup = "COMPLETED" | "CANCELLED" | "IN_PROGRESS" | "REFUNDED";

export type LivestreamSortBy = "DATE" | "SALES" | "VIEWS";

export type ShowStatus = "SCHEDULED" | "LIVE" | "ENDED";

export type OrderHistoryStep =
  | "CREATED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED";

export type OrderSaleType = "AUCTION" | "BUY_NOW" | "OFFER" | "GIVEAWAY";

export type OrderRefundStatus =
  | "PENDING"
  | "ACCEPTED_FULL"
  | "ACCEPTED_PARTIAL"
  | "REJECTED";

/** Paging plus the window the server resolved. Every report list carries this. */
export interface ReportMeta extends PaginationMeta {
  dateRange: ReportDateRange;
}

export interface FinancialReportTotals {
  totalStoreProfit: number;
  totalTaxCollected: number;
  totalPlatformProfit: number;
  totalOrderValue: number;
  /** Row count of the whole filtered set; equals `meta.total`. */
  totalCompletedOrders: number;
}

export interface FinancialReportMeta extends ReportMeta {
  /** Covers the whole filtered set, never the page. */
  totals: FinancialReportTotals;
}

export interface FinancialReportRow {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  storeName: string;
  storeProfit: number;
  taxValue: number;
  platformProfit: number;
  shippingFee: number;
  orderTotal: number;
  currencyCode: string;
  status: OrderStatus;
}

export interface RatingsStarBreakdown {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
}

export interface RatingsReportSummary {
  /** Null when no review matches the filters. Never 0. */
  platformAverageRating: number | null;
  totalReviews: number;
  starBreakdown: RatingsStarBreakdown;
}

export interface RatingsReportMeta extends ReportMeta {
  summary: RatingsReportSummary;
}

export interface RatingsReviewRow {
  ratingId: string;
  reviewerUsername: string;
  reviewerFullName: string | null;
  sellerId: string;
  sellerName: string;
  productTitle: string | null;
  categoryNameEn: string | null;
  categoryNameAr: string | null;
  rating: number;
  review: string | null;
  createdAt: string;
}

export interface RatingsSellerRow {
  sellerId: string;
  sellerName: string;
  username: string;
  profilePicture: string | null;
  /** Null when the seller has no reviews in the window. */
  averageRating: number | null;
  reviewCount: number;
}

export interface OrdersReportSummary {
  completed: number;
  cancelled: number;
  inProgress: number;
  refunded: number;
  /** Every order created in the window; the four groups sum to this. */
  totalOrders: number;
  /** Average over counted sales only; 0 when there are none. */
  averageOrderValue: number;
}

export interface OrdersReportMeta extends ReportMeta {
  summary: OrdersReportSummary;
}

export interface OrderReportRow {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  status: OrderStatus;
  /** Server English label; the UI translates `status` instead. */
  statusLabel: string;
  group: OrderReportGroup;
  /** When the order entered its current status. */
  statusDate: string;
  total: number;
  currencyCode: string;
  createdAt: string;
}

export interface LivestreamTopShow {
  showId: string;
  title: string;
  hostName: string;
  sales: number;
  views: number;
}

export interface LivestreamsReportSummary {
  totalShows: number;
  totalViews: number;
  /** An estimate over finalised analytics only. */
  totalWatchMinutes: number;
  /** Null when no show aired in the window. */
  topShow: LivestreamTopShow | null;
}

export interface LivestreamsReportMeta extends ReportMeta {
  summary: LivestreamsReportSummary;
}

export interface LivestreamReportRow {
  showId: string;
  title: string;
  hostId: string;
  hostName: string;
  status: ShowStatus;
  broadcastDate: string;
  /** Start to end in whole minutes; start to now while LIVE. */
  durationMinutes: number;
  views: number;
  peakViewers: number;
  comments: number;
  ordersCount: number;
  sales: number;
}

export interface OrderDrilldownCustomer {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
}

export interface OrderDrilldownStore {
  sellerId: string;
  username: string;
  /** The seller's full name falling back to username; there is no separate store name. */
  storeName: string;
  profilePicture: string | null;
  productId: string;
  productTitle: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  /** Goods value before discount (equals `money.subtotal`). */
  amount: number;
}

export interface OrderDrilldownMoney {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  commissionAmount: number;
  total: number;
  sellerNet: number;
  currencyCode: string;
}

export interface OrderRefund {
  status: OrderRefundStatus;
  /** Null while no amount has been agreed. */
  refundAmount: number | null;
  requestedAt: string;
  /** Null while pending. */
  resolvedAt: string | null;
}

export interface OrderHistoryEntry {
  step: OrderHistoryStep;
  /** Server English label; the UI translates `step` instead. */
  label: string;
  at: string;
}

export interface OrderDrilldown {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  /** Server English label; the UI translates `status` instead. */
  statusLabel: string;
  saleType: OrderSaleType;
  createdAt: string;
  paidAt: string | null;
  customer: OrderDrilldownCustomer;
  store: OrderDrilldownStore;
  money: OrderDrilldownMoney;
  /** Null when no refund was ever requested. */
  refund: OrderRefund | null;
  /** The order's real history in order; steps without a timestamp are absent. */
  statusHistory: OrderHistoryEntry[];
}

/** A paginated list whose `meta` carries report extras (`dateRange`, `totals`, `summary`). */
export interface PaginatedWithMeta<TRow, TMeta extends PaginationMeta> {
  data: TRow[];
  meta: TMeta;
}

/**
 * Like `unwrapPaginated`, but keeps the report's extra `meta` keys typed.
 * Throws if `meta` is missing.
 */
export function unwrapPaginatedWithMeta<TRow, TMeta extends PaginationMeta>(
  body: { success?: boolean; data: TRow[]; meta?: TMeta },
): PaginatedWithMeta<TRow, TMeta> {
  const { data, meta } = body;
  if (!meta) {
    throw new Error("unwrapPaginatedWithMeta: response has no `meta` — endpoint not paginated?");
  }
  return { data, meta };
}
