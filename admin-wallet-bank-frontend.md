# Admin — Wallet & Bank Account — Frontend Integration Guide

A complete, **frontend-facing** reference for the **admin dashboard** wallet, settlement (withdrawal), and bank-account features. Everything the web/front team needs to wire the APIs: full URLs, auth, request shapes, **every response JSON**, and **every test case** (happy path + all error paths).

> Source of truth: `src/modules/admin-wallet/*`, `src/modules/bank/*`, `src/modules/wallet/entities/*`.
> Backend spec: [`docs/wallet.md`](./wallet.md) · [`docs/admin.md`](./admin.md) · [`docs/structure.md`](./structure.md).

---

## 1. Scope

This guide covers the **admin side only**. Three feature areas:

| Area | What the admin does | Controller |
|---|---|---|
| **Seller Wallets** | View a seller's balance/holding/available + transaction ledger | `admin-wallet.controller.ts` |
| **Settlements (Withdrawals)** | Review, approve, adjust, reject seller withdrawal requests; reveal IBAN | `admin-wallet.controller.ts` |
| **Banks** | CRUD the bank list sellers pick from when withdrawing | `bank.controller.ts` |

The seller-facing wallet endpoints (`/wallet`, `/wallet/settlement`, …) are **not** in scope here — see [`docs/wallet.md`](./wallet.md).

---

## 2. Base URL & Versioning

All routes use the global prefix `api` and **URI version `v1`**.

| Environment | Base URL |
|---|---|
| **Production** | `https://api.bidmartapp.com` |
| **Dev** | `http://bidmart-dev.eba-4yufrrmi.eu-north-1.elasticbeanstalk.com` |
| **Local** | `http://localhost:8080` |

> **Full path = `{baseUrl}` + `/api/v1` + route.**
> Example: `GET https://api.bidmartapp.com/api/v1/admin/settlements`

In this document routes are written **without** the `/api/v1` prefix for brevity (e.g. `GET /admin/settlements`). Always prepend `/api/v1`.

---

## 3. Authentication

All admin endpoints are protected by `AdminGuard` + `PermissionGuard`. The admin JWT is **different** from the user JWT (signed with `ADMIN_JWT_SECRET`).

> Note: the controllers are annotated `@Public()` only to skip the **global user** JWT guard — they are still fully protected by the admin guard. **You must send an admin token.**

### 3.1 Get a token — `POST /admin/auth/login`

**Request**
```http
POST /api/v1/admin/auth/login
Content-Type: application/json
```
```json
{
  "email": "admin@bidmart.com",
  "password": "Admin@1234",
  "rememberMe": false,
  "deviceId": "admin-panel",
  "fcmToken": null
}
```

| Field | Required | Notes |
|---|---|---|
| `email` | ✅ | Valid email, lowercased server-side |
| `password` | ✅ | 8–20 chars |
| `rememberMe` | ❌ | `true` → 30-day token, else 8-hour token |
| `deviceId` | ❌ | Defaults to `"admin-panel"` |
| `fcmToken` | ❌ | For admin push (max 500 chars) |

**Success `200`**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
  "meta": { "version": "1.0.0" }
}
```

### 3.2 Send the token on every admin request

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| Scenario | HTTP | `error.code` |
|---|---|---|
| Missing / malformed / expired / invalid token | `401` | `UNAUTHORIZED` |
| Token revoked (admin logged out) | `401` | `TOKEN_REVOKED` |
| Admin account deactivated (blocklisted mid-session) | `403` | `ACCOUNT_DISABLED` |
| Token valid but admin lacks the required permission | `403` | `FORBIDDEN` |

> **Super admin** (`is_super_admin = true`) bypasses **all** permission checks — every endpoint below works for them.

### 3.3 Reading the admin's permissions (for UI gating)

To show/hide buttons (approve, reject, create-bank, …) the frontend needs the admin's permission list. ⚠️ **Neither the login response nor `GET /admin/profile` returns the `permissions[]` array** — login returns only `accessToken`, and profile returns `role` + `isSuperAdmin` (no granular permissions).

The permissions live **inside the JWT payload**. Decode the `accessToken` (no server call needed) to read:

```jsonc
// JWT payload (base64-decode the middle segment of accessToken)
{
  "sub": "admin-uuid",
  "role": "Finance Manager",
  "role_id": "role-uuid",
  "is_super_admin": false,
  "permissions": ["admin:withdrawals:view", "admin:withdrawals:approve", "admin:wallets:view"],
  "deviceId": "admin-panel",
  "jti": "…", "iat": 1717660800, "exp": 1717689600
}
```

UI rule: show an action if `is_super_admin === true` **or** `permissions.includes('<required key>')` (see §5). Don't rely on `role` name for gating — gate on `permissions`.

### 3.4 Where IDs come from (cross-module)

These wallet/bank endpoints consume IDs produced by other admin modules (see [`docs/admin.md`](./admin.md)):

| You need | Get it from |
|---|---|
| `sellerId` (for B1/B2 wallet dashboard) | `GET /admin/providers` / `GET /admin/users` lists, or a settlement's `sellerId` field (C3) |
| `countryId` (for bank create A2 / filter A1) | `GET /admin/countries` |
| `settlementId` (`:id`) | The settlement list (C1) `id` field |
| `bankId` | The bank list (A1) `id` field |

---

## 4. Response Envelope

Every response (success and error) is wrapped by a global interceptor.

### 4.1 Single object
```json
{
  "success": true,
  "data": { "...": "..." },
  "meta": { "version": "1.0.0" }
}
```

### 4.2 Paginated list
```json
{
  "success": true,
  "data": [ { "...": "..." } ],
  "meta": {
    "version": "1.0.0",
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 4.3 Error
```json
{
  "success": false,
  "error": {
    "code": "SETTLEMENT_NOT_FOUND",
    "message": "Settlement request not found.",
    "timestamp": "2026-06-06T10:00:00.000Z",
    "path": "/api/v1/admin/settlements/..."
  },
  "meta": { "version": "1.0.0" }
}
```

> The frontend should **always branch on `success`**, and on errors read `error.code` (stable, language-independent) — not `error.message`.

### 4.4 HTTP status convention

| Scenario | Status |
|---|---|
| POST that **creates** a row (create bank) | **201** |
| GET / PATCH / action POST (approve, reject, toggle, reveal) | **200** |
| Validation / bad input / malformed UUID | 400 |
| Unauthenticated | 401 |
| No permission | 403 |
| Not found | 404 |
| State conflict (already actioned, duplicate name, bank has pending) | 409 |
| Processable rule violation (amount exceeds available, below minimum) | 422 |

---

## 5. Permissions Matrix

`AdminPermission` keys required per endpoint (super admin bypasses all):

| Permission key | Grants |
|---|---|
| `admin:wallets:view` (`VIEW_WALLETS`) | View seller wallet dashboard + transactions |
| `admin:withdrawals:view` (`VIEW_WITHDRAWALS`) | List/detail settlements, new-count, reveal IBAN, **view banks** |
| `admin:withdrawals:approve` (`APPROVE_WITHDRAWAL`) | Approve + adjust settlements, **create/update/toggle banks** |
| `admin:withdrawals:reject` (`REJECT_WITHDRAWAL`) | Reject settlements |

> ⚠️ Bank **write** operations (create/update/toggle) require `APPROVE_WITHDRAWAL`, and bank **read** requires `VIEW_WITHDRAWALS` — banks live under the Withdrawals permission group, not a dedicated "banks" permission.

---

## 6. Enums Reference

These appear in responses — the frontend should treat them as fixed string sets.

**`WalletTxType`** (transaction type)
```
TOP_UP · ORDER_PAYMENT · ORDER_REFUND · SELLER_PAYOUT · REFERRAL_CREDIT · ADMIN_ADJUSTMENT
```

**`WalletTxStatus`**
```
COMPLETED · PROCESSING
```

**`SettlementRequestStatus`**
```
NEW · APPROVED · REJECTED · ADJUSTED
```

State machine: `NEW → APPROVED` | `NEW → ADJUSTED` | `NEW → REJECTED`. Only `NEW` requests are actionable. A rejected request can be re-submitted by the seller (creates a new `NEW` row).

---

# PART A — BANK ACCOUNT (Admin)

Banks the admin manages. Sellers pick an **active** bank when submitting a withdrawal. All routes are under `/admin/banks`.

**Bank object shape (`BankSummaryDto`)**
```json
{
  "id": "b1a2c3d4-0000-0000-0000-000000000001",
  "nameEn": "Al Rajhi Bank",
  "nameAr": "مصرف الراجحي",
  "countryId": "c0000000-0000-0000-0000-000000000001",
  "countryNameEn": "Saudi Arabia",
  "countryNameAr": "السعودية",
  "isActive": true,
  "createdAt": "2026-01-15T08:30:00.000Z"
}
```

> Admin bank responses expose **both** `nameEn` and `nameAr` (admin manages both translations). `countryNameEn` / `countryNameAr` are present only when the country relation exists.

---

## A1. List banks — `GET /admin/banks`

**Permission:** `VIEW_WITHDRAWALS` · **Status:** `200`

Paginated, sorted alphabetically by English name (`name_en ASC`).

**Query params**

| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Matches `name_en` **or** `name_ar` (ILIKE, case-insensitive) |
| `countryId` | uuid | — | Filter by country |
| `isActive` | boolean | — | `true` / `false`. Omit for all |
| `page` | int ≥ 1 | 1 | |
| `limit` | int 1–100 | 20 | |

**Request**
```http
GET /api/v1/admin/banks?search=rajhi&isActive=true&page=1&limit=20
Authorization: Bearer <adminToken>
```

**Success `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "b1a2c3d4-0000-0000-0000-000000000001",
      "nameEn": "Al Rajhi Bank",
      "nameAr": "مصرف الراجحي",
      "countryId": "c0000000-0000-0000-0000-000000000001",
      "countryNameEn": "Saudi Arabia",
      "countryNameAr": "السعودية",
      "isActive": true,
      "createdAt": "2026-01-15T08:30:00.000Z"
    }
  ],
  "meta": {
    "version": "1.0.0",
    "page": 1, "limit": 20, "total": 1,
    "totalPages": 1, "hasNextPage": false, "hasPrevPage": false
  }
}
```

**Test cases**

| # | Scenario | Request | Expect |
|---|---|---|---|
| 1 | List all (defaults) | `GET /admin/banks` | `200`, `data` array, pagination meta |
| 2 | Search by EN/AR name | `?search=الراجحي` | `200`, filtered |
| 3 | Filter active only | `?isActive=true` | `200`, only `isActive:true` rows |
| 4 | Filter inactive | `?isActive=false` | `200`, only `isActive:false` rows |
| 5 | Filter by country | `?countryId=<uuid>` | `200`, only that country's banks |
| 6 | Page 2 | `?page=2&limit=10` | `200`, `meta.page=2` |
| 7 | Empty result | `?search=zzz-no-match` | `200`, `data: []`, `total: 0` |
| 8 | `limit` over max | `?limit=500` | `400` `VALIDATION_FAILED` (max 100) |
| 9 | Invalid `countryId` (not uuid) | `?countryId=abc` | `400` `VALIDATION_FAILED` |
| 10 | No token | — | `401` |
| 11 | Token without `VIEW_WITHDRAWALS` | — | `403` `FORBIDDEN` |

---

## A2. Create bank — `POST /admin/banks`

**Permission:** `APPROVE_WITHDRAWAL` · **Status:** `201`

New banks are created **active** (`isActive: true`) by default.

**Body (`CreateBankDto`)**

| Field | Type | Rules |
|---|---|---|
| `nameEn` | string | required, 2–100 chars, **unique** |
| `nameAr` | string | required, 2–100 chars, **unique** |
| `countryId` | uuid | required, must exist in `countries` |

**Request**
```http
POST /api/v1/admin/banks
Authorization: Bearer <adminToken>
Content-Type: application/json
```
```json
{
  "nameEn": "Saudi National Bank",
  "nameAr": "البنك الأهلي السعودي",
  "countryId": "c0000000-0000-0000-0000-000000000001"
}
```

**Success `201`**
```json
{
  "success": true,
  "data": {
    "id": "b1a2c3d4-0000-0000-0000-000000000002",
    "nameEn": "Saudi National Bank",
    "nameAr": "البنك الأهلي السعودي",
    "countryId": "c0000000-0000-0000-0000-000000000001",
    "isActive": true,
    "createdAt": "2026-06-06T10:00:00.000Z"
  },
  "meta": { "version": "1.0.0" }
}
```
> ⚠️ On create, `countryNameEn` / `countryNameAr` are **absent from the JSON entirely** (the value is `undefined` because the country relation isn't re-fetched — JSON omits `undefined` keys, so don't expect `null`). Only the **list** endpoint (A1) returns resolved country names — re-list if you need them.

**Test cases**

| # | Scenario | Body | Expect |
|---|---|---|---|
| 1 | Valid create | full valid body | `201`, returns bank, `isActive:true` |
| 2 | Missing `nameEn` | omit `nameEn` | `400` `VALIDATION_FAILED` |
| 3 | `nameEn` too short | `"A"` | `400` `VALIDATION_FAILED` |
| 4 | `nameEn` too long | 101 chars | `400` `VALIDATION_FAILED` |
| 5 | Missing `countryId` | omit | `400` `VALIDATION_FAILED` |
| 6 | `countryId` not a uuid | `"abc"` | `400` `VALIDATION_FAILED` |
| 7 | Country doesn't exist | random uuid | `404` `RESOURCE_NOT_FOUND` |
| 8 | Duplicate `nameEn` | existing EN name | `409` `BANK_NAME_DUPLICATE` |
| 9 | Duplicate `nameAr` | existing AR name | `409` `BANK_NAME_DUPLICATE` |
| 10 | Extra/unknown field | `{ "foo": 1, ... }` | `400` `VALIDATION_FAILED` (whitelist) |
| 11 | No token | — | `401` |
| 12 | Token without `APPROVE_WITHDRAWAL` | — | `403` `FORBIDDEN` |

---

## A3. Update bank — `PATCH /admin/banks/:bankId`

**Permission:** `APPROVE_WITHDRAWAL` · **Status:** `200`

All fields optional — send only what changes. `isActive` is **not** editable here (use A4).

**Body (`UpdateBankDto`)**

| Field | Type | Rules |
|---|---|---|
| `nameEn` | string? | 2–100 chars, unique |
| `nameAr` | string? | 2–100 chars, unique |
| `countryId` | uuid? | must exist |

**Request**
```http
PATCH /api/v1/admin/banks/b1a2c3d4-0000-0000-0000-000000000002
Authorization: Bearer <adminToken>
Content-Type: application/json
```
```json
{ "nameEn": "SNB" }
```

**Success `200`** → `BankSummaryDto` envelope. ⚠️ Like create, `countryNameEn` / `countryNameAr` are **absent** from the update/toggle responses (relation not re-fetched). Re-list (A1) to get resolved country names.

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Update EN name | `200`, updated |
| 2 | Update AR name | `200`, updated |
| 3 | Reassign country | `200`, updated |
| 4 | Partial (one field only) | `200`, others unchanged |
| 5 | Empty body `{}` | `200`, no change |
| 6 | `bankId` not a uuid | `400` `VALIDATION_FAILED` |
| 7 | Bank not found | `404` `BANK_NOT_FOUND` |
| 8 | New `countryId` doesn't exist | `404` `RESOURCE_NOT_FOUND` |
| 9 | Rename to an existing EN/AR name | `409` `BANK_NAME_DUPLICATE` |
| 10 | Rename to its **own** current name | `200` (no duplicate check triggered) |
| 11 | Name too short/long | `400` `VALIDATION_FAILED` |
| 12 | No token / no permission | `401` / `403` |

---

## A4. Toggle active status — `PATCH /admin/banks/:bankId/toggle-status`

**Permission:** `APPROVE_WITHDRAWAL` · **Status:** `200`

Flips `isActive`. **No body.** Guard rule: a bank **cannot be deactivated** while it has settlement requests in status `NEW`.

**Request**
```http
PATCH /api/v1/admin/banks/b1a2c3d4-0000-0000-0000-000000000001/toggle-status
Authorization: Bearer <adminToken>
```

**Success `200`**
```json
{
  "success": true,
  "data": { "id": "b1a2c3d4-...0001", "nameEn": "Al Rajhi Bank", "nameAr": "مصرف الراجحي",
            "countryId": "c0000000-...0001", "isActive": false, "createdAt": "2026-01-15T08:30:00.000Z" },
  "meta": { "version": "1.0.0" }
}
```

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Activate an inactive bank | `200`, `isActive:true` |
| 2 | Deactivate an active bank (no pending) | `200`, `isActive:false` |
| 3 | Deactivate a bank that has `NEW` settlements | `409` `BANK_HAS_PENDING_SETTLEMENTS` |
| 4 | Activating is always allowed (even with pending) | `200` |
| 5 | `bankId` not a uuid | `400` `VALIDATION_FAILED` |
| 6 | Bank not found | `404` `BANK_NOT_FOUND` |
| 7 | No token / no permission | `401` / `403` |

---

# PART B — WALLET (Admin)

Read a seller's wallet + ledger. All routes under `/admin/wallets` and `/admin/settlements`.

> **Money is always a `string`** with 2 decimals (e.g. `"450.00"`), never a number — preserves precision and currency formatting. `availableForSettlement = balance − holdingBalance`.

---

## B1. Seller wallet dashboard — `GET /admin/wallets/:sellerId`

**Permission:** `VIEW_WALLETS` · **Status:** `200`

`:sellerId` is the **User** UUID (sellers are users with a wallet).

**Request**
```http
GET /api/v1/admin/wallets/a1111111-1111-1111-1111-111111111111
Authorization: Bearer <adminToken>
```

**Success `200` (`AdminWalletDashboardDto`)**
```json
{
  "success": true,
  "data": {
    "balance": "450.00",
    "holdingBalance": "300.00",
    "availableForSettlement": "150.00",
    "currencyCode": "SAR",
    "sellerName": "seller.ahmed",
    "sellerPhone": "+966500000002",
    "sellerEmail": "ahmed@example.com"
  },
  "meta": { "version": "1.0.0" }
}
```

**Edge behavior**
- User **exists but has no wallet row** → returns zeros with default currency:
  `{ "balance": "0.00", "holdingBalance": "0.00", "availableForSettlement": "0.00", "currencyCode": "SAR", ... }`.
- `sellerPhone` / `sellerEmail` may be `null`.

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Valid seller with wallet | `200`, balances populated |
| 2 | Valid user, no wallet yet | `200`, all balances `"0.00"`, `currencyCode:"SAR"` |
| 3 | User not found | `404` `WALLET_NOT_FOUND` |
| 4 | `sellerId` not a uuid | `400` `VALIDATION_FAILED` |
| 5 | No token / no permission | `401` / `403` |

---

## B2. Seller transaction history — `GET /admin/wallets/:sellerId/transactions`

**Permission:** `VIEW_WALLETS` · **Status:** `200`

Paginated ledger, newest first.

**Query params**

| Param | Type | Default | Notes |
|---|---|---|---|
| `type` | `WalletTxType` | — | Filter by transaction type |
| `dateFrom` | date `YYYY-MM-DD` | — | `created_at >= dateFrom` |
| `dateTo` | date `YYYY-MM-DD` | — | `created_at <= dateTo 23:59:59` (inclusive) |
| `referenceNumber` | string | — | Partial match on transaction ID |
| `page` | int ≥ 1 | 1 | |
| `limit` | int 1–50 | 10 | |

**Request**
```http
GET /api/v1/admin/wallets/a1111111-1111-1111-1111-111111111111/transactions?type=SELLER_PAYOUT&page=1&limit=10
Authorization: Bearer <adminToken>
```

**Success `200` (`AdminWalletTxItemDto[]`)**
```json
{
  "success": true,
  "data": [
    {
      "id": "f0000000-0000-0000-0000-000000000010",
      "amount": "−150.00",
      "type": "SELLER_PAYOUT",
      "status": "COMPLETED",
      "notes": "Settlement payout — Request #...",
      "createdAt": "2026-06-05T12:00:00.000Z"
    },
    {
      "id": "f0000000-0000-0000-0000-000000000009",
      "amount": "+300.00",
      "type": "ORDER_PAYMENT",
      "status": "COMPLETED",
      "notes": null,
      "createdAt": "2026-06-04T09:30:00.000Z"
    }
  ],
  "meta": {
    "version": "1.0.0",
    "page": 1, "limit": 10, "total": 2,
    "totalPages": 1, "hasNextPage": false, "hasPrevPage": false
  }
}
```

> ⚠️ **`amount` is a pre-formatted display string with a sign prefix**: credits start with `+` (e.g. `"+300.00"`), debits start with a **typographic minus `−` (U+2212)**, e.g. `"−150.00"` — **not** the ASCII hyphen `-`. Render it as-is; do **not** `parseFloat()` it (the `−` will produce `NaN`). If you need the numeric value, strip the first character and apply the sign yourself.

**Edge behavior**
- Seller has **no wallet** → returns `200` with `data: []` and `total: 0` (not a 404).

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Has transactions | `200`, signed `amount` strings |
| 2 | Filter by `type=SELLER_PAYOUT` | `200`, only that type |
| 3 | Date range filter | `200`, within range (inclusive of `dateTo` day) |
| 4 | `referenceNumber` partial | `200`, matching tx |
| 5 | No wallet | `200`, `data: []`, `total: 0` |
| 6 | No transactions | `200`, `data: []` |
| 7 | Pagination page 2 | `200`, `meta.page=2` |
| 8 | Invalid `type` value | `400` `VALIDATION_FAILED` |
| 9 | `limit` over 50 | `400` `VALIDATION_FAILED` |
| 10 | `dateFrom` malformed (not ISO date) | `400` `VALIDATION_FAILED` |
| 11 | `sellerId` not a uuid | `400` `VALIDATION_FAILED` |
| 12 | No token / no permission | `401` / `403` |

---

# PART C — SETTLEMENTS / WITHDRAWALS (Admin)

The withdrawal review workflow. All routes under `/admin/settlements`.

---

## C1. List settlements — `GET /admin/settlements`

**Permission:** `VIEW_WITHDRAWALS` · **Status:** `200`

Global list across all sellers, newest first.

**Query params**

| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Seller name **or** phone (ILIKE) |
| `status` | string | — | One or **comma-separated** statuses, e.g. `NEW,ADJUSTED` |
| `dateFrom` | date `YYYY-MM-DD` | — | Submitted from |
| `dateTo` | date `YYYY-MM-DD` | — | Submitted to (inclusive) |
| `page` | int ≥ 1 | 1 | |
| `limit` | int 1–100 | **20** | Effective server default is 20 when omitted (the `10` shown in Swagger is doc-only and not enforced). Always send an explicit `limit`. |

**Request**
```http
GET /api/v1/admin/settlements?status=NEW&search=ahmed&page=1&limit=20
Authorization: Bearer <adminToken>
```

**Success `200` (`SettlementListItemDto[]`)**
```json
{
  "success": true,
  "data": [
    {
      "id": "5e770000-0000-0000-0000-000000000001",
      "sellerName": "seller.ahmed",
      "sellerPhone": "+966500000002",
      "requestedAmount": "150.00",
      "status": "NEW",
      "submittedAt": "2026-06-06T08:00:00.000Z",
      "actionedAt": null
    }
  ],
  "meta": {
    "version": "1.0.0",
    "page": 1, "limit": 20, "total": 1,
    "totalPages": 1, "hasNextPage": false, "hasPrevPage": false
  }
}
```

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | List all | `200`, newest first |
| 2 | Filter single status `?status=NEW` | `200`, only `NEW` |
| 3 | Multi status `?status=APPROVED,ADJUSTED` | `200`, both |
| 4 | Search by seller name | `200`, filtered |
| 5 | Search by phone | `200`, filtered |
| 6 | Date range | `200`, within range |
| 7 | Empty result | `200`, `data: []`, `total: 0` |
| 8 | `limit` over 100 | `400` `VALIDATION_FAILED` |
| 9 | `dateFrom` malformed | `400` `VALIDATION_FAILED` |
| 10 | No token / no permission | `401` / `403` |

> Note: an **invalid status token** in the comma list isn't rejected by validation; it simply matches nothing. The frontend should send only valid `SettlementRequestStatus` values.

---

## C2. New (unreviewed) count — `GET /admin/settlements/new-count`

**Permission:** `VIEW_WITHDRAWALS` · **Status:** `200`

For the sidebar/menu badge. Counts requests in status `NEW`.

**Request**
```http
GET /api/v1/admin/settlements/new-count
Authorization: Bearer <adminToken>
```

**Success `200`**
```json
{ "success": true, "data": { "count": 3 }, "meta": { "version": "1.0.0" } }
```

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Some NEW exist | `200`, `count > 0` |
| 2 | None NEW | `200`, `count: 0` |
| 3 | No token / no permission | `401` / `403` |

---

## C3. Settlement detail — `GET /admin/settlements/:id`

**Permission:** `VIEW_WITHDRAWALS` · **Status:** `200`

Full detail for the review screen. **IBAN comes back masked** — use C4 to reveal.

**Request**
```http
GET /api/v1/admin/settlements/5e770000-0000-0000-0000-000000000001
Authorization: Bearer <adminToken>
```

**Success `200` (`SettlementDetailDto`)**
```json
{
  "success": true,
  "data": {
    "id": "5e770000-0000-0000-0000-000000000001",
    "submittedAt": "2026-06-06T08:00:00.000Z",
    "status": "NEW",
    "actionedAt": null,
    "actionedByName": null,

    "sellerName": "seller.ahmed",
    "sellerPhone": "+966500000002",
    "sellerEmail": "ahmed@example.com",
    "sellerId": "a1111111-1111-1111-1111-111111111111",

    "requestedAmount": "150.00",
    "adjustedAmount": null,
    "balanceSnapshot": "150.00",
    "holdingSnapshot": "300.00",
    "fullBalanceSnapshot": "450.00",

    "bankNameEn": "Al Rajhi Bank",
    "bankNameAr": "مصرف الراجحي",
    "ibanMasked": "SA03****************7543",

    "adminNotes": null
  },
  "meta": { "version": "1.0.0" }
}
```

**Field notes**

| Field | Meaning |
|---|---|
| `actionedByName` | Admin full name who actioned it (`null` while `NEW`) |
| `requestedAmount` | What the seller asked for |
| `adjustedAmount` | Set only when `status = ADJUSTED`, else `null` |
| `balanceSnapshot` | **Available** balance (`full − holding`) at submission time |
| `holdingSnapshot` | Holding balance at submission |
| `fullBalanceSnapshot` | Full balance at submission |
| `bankNameEn/Ar` | From bank relation, falls back to `bank_name_snapshot`, then `"Unknown"`/`"غير معروف"` |
| `ibanMasked` | First 4 + `*`×(len−8) + last 4 (e.g. `SA03****************7543` for a 24-char IBAN); IBANs of length ≤ 8 are returned **unmasked** |
| `adminNotes` | Rejection reason or adjustment note |

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Valid NEW request | `200`, `status:"NEW"`, `ibanMasked` masked |
| 2 | Approved request | `200`, `status:"APPROVED"`, `actionedByName` set |
| 3 | Adjusted request | `200`, `adjustedAmount` non-null |
| 4 | Rejected request | `200`, `adminNotes` = reason |
| 5 | Bank deleted but snapshot exists | `200`, names from `bank_name_snapshot` |
| 6 | `id` not a uuid | `400` `VALIDATION_FAILED` |
| 7 | Not found | `404` `SETTLEMENT_NOT_FOUND` |
| 8 | No token / no permission | `401` / `403` |

---

## C4. Reveal full IBAN — `POST /admin/settlements/:id/reveal-iban`

**Permission:** `VIEW_WITHDRAWALS` · **Status:** `200` · **No body**

Returns the **unmasked** IBAN. The action is **audit-logged** (admin id + timestamp) server-side. Call only on explicit admin click.

**Request**
```http
POST /api/v1/admin/settlements/5e770000-0000-0000-0000-000000000001/reveal-iban
Authorization: Bearer <adminToken>
```

**Success `200`**
```json
{ "success": true, "data": { "iban": "SA0380000000608010167543" }, "meta": { "version": "1.0.0" } }
```

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Valid request | `200`, full `iban` |
| 2 | `id` not a uuid | `400` `VALIDATION_FAILED` |
| 3 | Not found | `404` `SETTLEMENT_NOT_FOUND` |
| 4 | No token / no permission | `401` / `403` |

---

## C5. Approve settlement — `POST /admin/settlements/:id/approve`

**Permission:** `APPROVE_WITHDRAWAL` · **Status:** `200` · **No body**

Approves the **full requested amount**. Inside a locked DB transaction: validates available balance, debits the wallet, inserts a `SELLER_PAYOUT` transaction, sets status `APPROVED`, and notifies the seller (push). **Returns the updated settlement detail (C3 shape).**

**Request**
```http
POST /api/v1/admin/settlements/5e770000-0000-0000-0000-000000000001/approve
Authorization: Bearer <adminToken>
```

**Success `200`** → `SettlementDetailDto` with `status: "APPROVED"`, `actionedAt` + `actionedByName` set.

**Test cases**

| # | Scenario | Expect |
|---|---|---|
| 1 | Approve a NEW request (funds available) | `200`, `status:"APPROVED"`, wallet debited, seller notified |
| 2 | Already approved/adjusted/rejected | `409` `SETTLEMENT_ALREADY_ACTIONED` |
| 3 | Requested amount > available balance | `422` `SETTLEMENT_AMOUNT_EXCEEDS_AVAILABLE` (available shown in `message`) |
| 4 | `id` not a uuid | `400` `VALIDATION_FAILED` |
| 5 | Not found | `404` `SETTLEMENT_NOT_FOUND` |
| 6 | No token | `401` |
| 7 | Token without `APPROVE_WITHDRAWAL` | `403` `FORBIDDEN` |

---

## C6. Adjust & approve — `POST /admin/settlements/:id/adjust`

**Permission:** `APPROVE_WITHDRAWAL` · **Status:** `200`

Approves with a **different (lower) amount**. Debits the `adjustedAmount` (not the requested), sets status `ADJUSTED`, stores the note, notifies the seller.

**Body (`AdjustSettlementDto`)**

| Field | Type | Rules |
|---|---|---|
| `adjustedAmount` | number | required, > 0, max 2 decimals, **≥ min settlement** (`WALLET_MIN_SETTLEMENT_AMOUNT`, default 100), **≤ available balance** |
| `notes` | string? | optional, 0–500 chars |

**Request**
```http
POST /api/v1/admin/settlements/5e770000-0000-0000-0000-000000000001/adjust
Authorization: Bearer <adminToken>
Content-Type: application/json
```
```json
{ "adjustedAmount": 120.00, "notes": "Partial payout per policy" }
```

**Success `200`** → `SettlementDetailDto` with `status: "ADJUSTED"`, `adjustedAmount: "120.00"`, `adminNotes` = note.

**Test cases**

| # | Scenario | Body | Expect |
|---|---|---|---|
| 1 | Valid adjust | `{ adjustedAmount: 120 }` | `200`, `status:"ADJUSTED"` |
| 2 | With notes | `{ adjustedAmount: 120, notes: "..." }` | `200`, `adminNotes` set |
| 3 | Below minimum (e.g. < 100) | `{ adjustedAmount: 50 }` | `422` `BELOW_MIN_SETTLEMENT_AMOUNT` (min shown in `message`) |
| 4 | Exceeds available balance | `{ adjustedAmount: 9999 }` | `422` `SETTLEMENT_AMOUNT_EXCEEDS_AVAILABLE` |
| 5 | `adjustedAmount` zero or negative | `{ adjustedAmount: 0 }` | `400` `VALIDATION_FAILED` |
| 6 | More than 2 decimals | `{ adjustedAmount: 120.999 }` | `400` `VALIDATION_FAILED` |
| 7 | Missing `adjustedAmount` | `{}` | `400` `VALIDATION_FAILED` |
| 8 | `notes` over 500 chars | long string | `400` `VALIDATION_FAILED` |
| 9 | Already actioned | — | `409` `SETTLEMENT_ALREADY_ACTIONED` |
| 10 | Not found | — | `404` `SETTLEMENT_NOT_FOUND` |
| 11 | `id` not a uuid | — | `400` `VALIDATION_FAILED` |
| 12 | No token / no permission | — | `401` / `403` |

> Validation order: existence + `NEW` status → below-minimum → (inside lock) exceeds-available.

---

## C7. Reject settlement — `POST /admin/settlements/:id/reject`

**Permission:** `REJECT_WITHDRAWAL` · **Status:** `200`

Rejects with a **mandatory reason**. **Does NOT touch the wallet balance.** Stores the reason, sets status `REJECTED`, notifies the seller. The seller can re-submit afterwards.

**Body (`RejectSettlementDto`)**

| Field | Type | Rules |
|---|---|---|
| `reason` | string | required, 1–500 chars |

**Request**
```http
POST /api/v1/admin/settlements/5e770000-0000-0000-0000-000000000001/reject
Authorization: Bearer <adminToken>
Content-Type: application/json
```
```json
{ "reason": "Invalid bank details" }
```

**Success `200`** → `SettlementDetailDto` with `status: "REJECTED"`, `adminNotes: "Invalid bank details"`.

**Test cases**

| # | Scenario | Body | Expect |
|---|---|---|---|
| 1 | Valid reject | `{ reason: "..." }` | `200`, `status:"REJECTED"`, balance unchanged |
| 2 | Missing `reason` | `{}` | `400` `VALIDATION_FAILED` |
| 3 | Empty `reason` | `{ reason: "" }` | `400` `VALIDATION_FAILED` |
| 4 | `reason` over 500 chars | long | `400` `VALIDATION_FAILED` |
| 5 | Already actioned | — | `409` `SETTLEMENT_ALREADY_ACTIONED` |
| 6 | Not found | — | `404` `SETTLEMENT_NOT_FOUND` |
| 7 | `id` not a uuid | — | `400` `VALIDATION_FAILED` |
| 8 | No token | — | `401` |
| 9 | Token without `REJECT_WITHDRAWAL` | — | `403` `FORBIDDEN` |

---

# 7. Error Codes (this module)

> **Where the details live:** these endpoints do **not** return a structured `error.details` / top-level `data` object. Any dynamic value (available balance, minimum amount, the failing field) is **interpolated into `error.message`** only. Also note: for every `/admin/*` route the server **forces English** error messages regardless of `Accept-Language`. Branch your UI logic on `error.code`; show `error.message` as the human text.

| `error.code` | HTTP | When | `message` example (EN) |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | Bad DTO / query / malformed UUID | first failing rule, e.g. `"limit must not be greater than 100"` |
| `UNAUTHORIZED` | 401 | Missing / expired / malformed / invalid admin token | `"Authentication required. Please log in."` |
| `TOKEN_REVOKED` | 401 | Token revoked (admin logged out) | `"Session is no longer valid. Please log in again."` |
| `ACCOUNT_DISABLED` | 403 | Admin account deactivated (blocklisted) | `"Your account has been suspended. Please contact support."` |
| `FORBIDDEN` | 403 | Admin lacks the required permission | `"You do not have permission to perform this action."` |
| `WALLET_NOT_FOUND` | 404 | Seller (user) not found on dashboard (B1) | `"Wallet not found."` |
| `SETTLEMENT_NOT_FOUND` | 404 | Settlement id doesn't exist | `"Settlement request not found."` |
| `BANK_NOT_FOUND` | 404 | Bank id doesn't exist | `"Bank not found."` |
| `RESOURCE_NOT_FOUND` | 404 | `countryId` doesn't exist (bank create/update) | `"Resource not found."` |
| `SETTLEMENT_ALREADY_ACTIONED` | 409 | Approve/adjust/reject a non-`NEW` request | `"This settlement request has already been processed."` |
| `BANK_NAME_DUPLICATE` | 409 | Bank EN/AR name already exists | `"A bank with this name already exists."` |
| `BANK_HAS_PENDING_SETTLEMENTS` | 409 | Deactivating a bank with `NEW` settlements | `"This bank has pending settlement requests and cannot be deactivated at this time."` |
| `SETTLEMENT_AMOUNT_EXCEEDS_AVAILABLE` | 422 | Approve/adjust amount > available balance | `"Adjusted amount exceeds available balance of 150.00."` |
| `BELOW_MIN_SETTLEMENT_AMOUNT` | 422 | Adjusted amount below minimum | `"Minimum settlement amount is 100.00."` |

---

# 8. Frontend Integration Notes & Gotchas

1. **Money fields are strings**, 2 decimals (`"450.00"`). Don't coerce to number for display; if you must compute, parse carefully and re-format.
2. **Transaction `amount` is sign-prefixed and uses U+2212 `−` for debits**, not ASCII `-`. Render as-is; `parseFloat("−150.00")` is `NaN`. To get a number: `Number(raw.replace('−','-').replace('+',''))`.
3. **`availableForSettlement = balance − holdingBalance`** is the only amount eligible for payout. Approve/adjust validate against this, not the full balance.
4. **IBAN is masked by default** in detail (C3). Only call **reveal-iban** (C4) on explicit user action — it's audit-logged.
5. **Only `NEW` settlements are actionable.** Disable approve/adjust/reject buttons for any other status; the API returns `409 SETTLEMENT_ALREADY_ACTIONED` if you try.
6. **Reject doesn't change balances**; approve/adjust do. After any action, **re-fetch the detail** (the action endpoints already return the fresh detail, so use that response directly).
7. **Snapshots** (`balanceSnapshot`, `holdingSnapshot`, `fullBalanceSnapshot`) are frozen at submission time — show them as "at request time", distinct from the live dashboard (B1).
8. **Bank create/update/toggle omit the `countryNameEn` / `countryNameAr` keys entirely** (they're `undefined`, not `null` — JSON drops them). Only the list endpoint (A1) returns resolved country names; re-list if you need them right after a write.
9. **Permissions differ per action.** A view-only admin (`VIEW_WITHDRAWALS` only) should see list/detail but get `403` on approve/adjust/reject — hide or disable those controls based on the admin's permissions **decoded from the JWT** (see §3.3; they are *not* in the login/profile response body).
10. **New-count badge** (C2) is cheap to poll for the sidebar; refresh it after every approve/adjust/reject.
11. **Pagination meta** includes `version` plus `page/limit/total/totalPages/hasNextPage/hasPrevPage`. Use `hasNextPage` for infinite scroll / "next" buttons.
12. **Date filters** (`dateFrom`/`dateTo`) take `YYYY-MM-DD`; `dateTo` is inclusive of the whole day (server appends `23:59:59.999`).

---

# 9. Not Yet Implemented (don't build UI for these yet)

From [`docs/wallet.md`](./wallet.md):
- Admin **manual wallet adjustment** endpoint (the `ADJUST_WALLET` / `admin:wallets:adjust` permission and `ADMIN_ADJUSTMENT` tx type exist, but **no endpoint** is wired yet).
- Top-up / payment gateway (Stripe), order payment flow, holding release on delivery, real-time balance push (WebSocket).

---

## Appendix — Endpoint Quick Reference

| # | Method | Path (prepend `/api/v1`) | Permission | Status |
|---|---|---|---|---|
| A1 | GET | `/admin/banks` | `VIEW_WITHDRAWALS` | 200 |
| A2 | POST | `/admin/banks` | `APPROVE_WITHDRAWAL` | 201 |
| A3 | PATCH | `/admin/banks/:bankId` | `APPROVE_WITHDRAWAL` | 200 |
| A4 | PATCH | `/admin/banks/:bankId/toggle-status` | `APPROVE_WITHDRAWAL` | 200 |
| B1 | GET | `/admin/wallets/:sellerId` | `VIEW_WALLETS` | 200 |
| B2 | GET | `/admin/wallets/:sellerId/transactions` | `VIEW_WALLETS` | 200 |
| C1 | GET | `/admin/settlements` | `VIEW_WITHDRAWALS` | 200 |
| C2 | GET | `/admin/settlements/new-count` | `VIEW_WITHDRAWALS` | 200 |
| C3 | GET | `/admin/settlements/:id` | `VIEW_WITHDRAWALS` | 200 |
| C4 | POST | `/admin/settlements/:id/reveal-iban` | `VIEW_WITHDRAWALS` | 200 |
| C5 | POST | `/admin/settlements/:id/approve` | `APPROVE_WITHDRAWAL` | 200 |
| C6 | POST | `/admin/settlements/:id/adjust` | `APPROVE_WITHDRAWAL` | 200 |
| C7 | POST | `/admin/settlements/:id/reject` | `REJECT_WITHDRAWAL` | 200 |
