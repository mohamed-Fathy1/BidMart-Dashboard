# BidMart — Sprint 1 Frontend Guide

> **Base URL:** `https://<host>/api/v1`
> **Swagger UI:** `https://<host>/api/docs` (Basic-Auth protected — ask backend for credentials)

---

## Authentication

### Admin routes
All `/admin/*` endpoints require:
```
Authorization: Bearer <adminToken>
```
Token is obtained from `POST /admin/auth/login`.

### User/Seller routes
All protected user endpoints require:
```
Authorization: Bearer <userToken>
```
Token is obtained from `POST /auth/login`.

---

## Key Enums

### `AccountStatus`
```
active
suspended
banned
pending_verification
deleted
```

### `UserRole`
```
USER
SELLER
ADMIN
```

### `SellerStatus` (store approval state)
```
PENDING
APPROVED
REJECTED
SUSPENDED
```

### Admin provider API — store lifecycle (HTTP wire format)
List rows expose **`accountStatus`**; detail exposes **`status`**. Both use the same **lowercase** literals (aligned with the dashboard + `Admin_API_integration_S1.json`):
```
pending
approved
rejected
blocked
```
- **`blocked`** — admin-blocked seller (cannot trade / forced logout). Often maps to **`SUSPENDED`** in the `stores.status` column; clients should not assume uppercase enums on these JSON fields.
- **`PATCH /admin/providers/:id/verify`** toggles **`isVerified`** (storefront badge) on **approved** stores only. That flag is **not** the same as **`verificationStatus`** on list rows (commercial-registration / KYC pipeline).

### Admin provider API — `verificationStatus` (documents / CR pipeline)
```
pending_verification
unverified
verified
```

### `AdminUserAccountType`
```
user_only          ← regular user, no store
upgraded_to_seller ← user who owns a store
```

### `SellerApplicationStatus`
```
PENDING
APPROVED
REJECTED
```

### `AuthProvider`
```
phone
google
apple
```

### `AdminRole`
```
super_admin
admin
finance
support
content
```

---

## DB Entity Shapes

> This section shows the full data shape stored in the database. What the API returns is a **subset** of these fields — sensitive columns like `password_hash` are never exposed.

---

### `admins` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `email` | varchar(255) | unique, required |
| `password_hash` | varchar(255) | bcrypt — never exposed |
| `full_name` | varchar(100) | nullable |
| `role` | enum `AdminRole` | `super_admin` / `admin` / `finance` / `support` / `content` |
| `permissions` | text[] | array of `AdminPermission` values — embedded in JWT on login |
| `is_super_admin` | boolean | default false — super admins have all permissions regardless of the array |
| `is_active` | boolean | default true — disabled admins cannot login (403) |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**Relations:** none outward (admins are standalone).

---

### `users` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `username` | varchar(32) | unique, required |
| `email` | varchar(255) | unique, nullable (optional at registration) |
| `phone_number` | varchar(15) | unique, nullable (E.164 format e.g. `+966501234567`) |
| `password_hash` | varchar(255) | nullable — null for Google/Apple accounts, never exposed |
| `full_name` | varchar(100) | nullable |
| `profile_picture` | varchar(500) | URL, nullable |
| `country_id` | uuid | FK → `countries.id`, nullable |
| `auth_provider` | enum `AuthProvider` | `phone` / `google` / `apple` |
| `google_id` | varchar(255) | nullable, unique — set only for Google signups |
| `apple_id` | varchar(255) | nullable, unique — set only for Apple signups |
| `role` | enum `UserRole` | `USER` / `SELLER` — default `USER` |
| `account_status` | enum `AccountStatus` | `pending_verification` / `active` / `suspended` / `banned` / `deleted` |
| `is_phone_verified` | boolean | default false — true after OTP verified |
| `has_completed_onboarding` | boolean | default false — true after category selection (US-009) |
| `suspended_until` | timestamptz | nullable — set when admin suspends with duration |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |
| `deleted_at` | timestamptz | nullable — soft-delete (GDPR) |

**Relations:**
- `country` → `countries` (many-to-one)
- `stores` → `stores[]` (one-to-many) — max 1 store per user in practice
- `seller_applications` → `seller_applications[]` (one-to-many)
- `preferred_sub_categories` → `user_preferred_sub_categories[]` (one-to-many)

**Business rules:**
- `auth_provider = phone` → `password_hash` must NOT be null (enforced by DB CHECK constraint)
- `account_status = pending_verification` → cannot login until OTP verified
- `account_status = banned` → login blocked with message "Your account has been banned"
- `account_status = suspended` → login blocked temporarily
- `deleted_at` not null → record exists but treated as deleted (excluded from all public queries)

---

### `countries` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name_en` | varchar(100) | required |
| `name_ar` | varchar(100) | required |
| `image_url` | varchar(500) | flag/image URL, required |
| `iso_code` | varchar(3) | unique, uppercase (e.g. `SAU`, `ARE`) |
| `is_enabled` | boolean | default true — only enabled countries appear in public dropdown |
| `sort_order` | int | default 0 — lower = higher in list |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**Business rules:**
- Only countries where `is_enabled = true` appear in `GET /countries` (public endpoint for registration dropdowns)
- Admin can toggle `is_enabled` via `PATCH /admin/countries/:id`

---

### `categories` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name_en` | varchar(100) | unique, required |
| `name_ar` | varchar(100) | required |
| `image_url` | varchar(500) | required |
| `icon_url` | varchar(500) | required — not in original OpenAPI spec |
| `sub_category_image_url` | varchar(500) | required — not in original OpenAPI spec |
| `display_order` | int | default 0 — lower = shown first |
| `is_active` | boolean | default true — inactive categories hidden from users |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**Relations:**
- `sub_categories` → `sub_categories[]` (one-to-many)

---

### `sub_categories` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `category_id` | uuid | FK → `categories.id` (CASCADE delete) |
| `name_en` | varchar(100) | unique per category, required |
| `name_ar` | varchar(100) | required |
| `image_url` | varchar(500) | nullable |
| `display_order` | int | default 0 |
| `is_active` | boolean | default true |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**Business rules:**
- Deleting a category cascades and deletes all its sub-categories
- `(category_id, name_en)` is unique — same English name can exist in different categories

---

### `stores` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `users.id` (CASCADE), unique — one store per user |
| `store_name` | varchar(100) | nullable — seller can set later |
| `store_logo` | varchar(500) | URL, nullable |
| `owner_full_name` | varchar(100) | required |
| `country_id` | uuid | FK → `countries.id` |
| `city` | varchar(100) | required |
| `detailed_address` | text | required |
| `commercial_registration_number` | varchar(50) | unique — read-only after creation |
| `commercial_registration_doc` | varchar(500) | URL — read-only after creation |
| `status` | enum `SellerStatus` | `PENDING` / `APPROVED` / `REJECTED` / `SUSPENDED` — set by admin |
| `is_verified` | boolean | default false — verification badge, set by admin |
| `return_days_number` | smallint | default 2, min 1 — return policy window |
| `return_policy_ar` | text | nullable — shown on product/order pages |
| `return_policy_en` | text | nullable |
| `store_bio` | text | nullable — shown on store public page |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**Relations:**
- `user` → `users` (many-to-one)
- `country` → `countries` (many-to-one)
- `verification_requests` → `store_verification_requests[]` (one-to-many)

**Business rules:**
- `status = PENDING` → seller cannot edit store settings yet
- `status = APPROVED` → seller has full access to their store panel
- `is_verified = true` → verified badge shown to buyers (admin-toggled; see `PATCH /admin/providers/:storeId/verify`)
- `commercial_registration_number` and `commercial_registration_doc` cannot be changed after store creation
- **Admin JSON** may surface a blocked seller as `accountStatus`/`status` **`blocked`** while the DB column remains `SellerStatus` — treat as an implementation detail; see **§5b**.

---

### `seller_applications` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `users.id` |
| `owner_full_name` | varchar(100) | required |
| `country_id` | uuid | FK → `countries.id` |
| `city` | varchar(100) | required |
| `detailed_address` | text | required |
| `commercial_registration_number` | varchar(50) | required |
| `commercial_registration_doc` | varchar(500) | URL, required |
| `status` | enum `SellerApplicationStatus` | `PENDING` / `APPROVED` / `REJECTED` — default `PENDING` |
| `reviewed_by` | uuid | FK → `users.id` (admin who reviewed), nullable |
| `reviewed_at` | timestamptz | nullable |
| `rejection_reason` | text | nullable — shown to seller on rejection |
| `is_upgrade` | boolean | false = new seller registration, true = existing user upgrading |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**Business rules:**
- A user can only have ONE `PENDING` application at a time
- After approval → `user.role` changes to `SELLER` and `store.status` changes to `APPROVED`
- After rejection → seller sees the `rejection_reason` and can resubmit

---

### `store_verification_requests` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `store_id` | uuid | FK → `stores.id` (CASCADE) |
| `commercial_registration_number` | varchar(50) | snapshot at time of request |
| `commercial_registration_doc` | varchar(500) | URL snapshot |
| `status` | enum `VerificationRequestStatus` | `pending` / `approved` / `rejected` — default `pending` |
| `reviewed_by` | uuid | FK → `users.id`, nullable |
| `reviewed_at` | timestamptz | nullable |
| `rejection_reason` | text | nullable |
| `created_at` | timestamptz | — |

**Business rules:**
- Only one `pending` request per store at a time
- On approval → `store.is_verified` set to `true` by admin
- Store must be `APPROVED` before it can submit a verification request

---

### Entity Relationship Summary

```
admins          (standalone — no FK relations to users)

users ──────────────────────────────────────────────────┐
  │                                                      │
  ├── country_id ──→ countries                           │
  ├── stores[] ──→ stores                                │
  │     └── verification_requests[] ──→ store_verif...   │
  └── seller_applications[] ──→ seller_applications      │
                                                         │
categories                                               │
  └── sub_categories[]                                   │
        └── user_preferred_sub_categories[] ←── users ──┘
```

---

## Common Response Shape

### Success
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-04-23T10:00:00.000Z"
}
```

### Error
```json
{
  "success": false,
  "statusCode": 409,
  "errorCode": "CONFLICT",
  "message": "Human-readable message",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/api/v1/admin/countries"
}
```

### Pagination meta (inside `data.meta`)
```json
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## 1 — Admin Auth

### `POST /admin/auth/login`
**Public — no token needed**

Request:
```json
{
  "email": "admin@bidmart.com",
  "password": "Admin@123",
  "rememberMe": false
}
```
- `rememberMe: true` → token expires in 30 days instead of 8 hours
- `deviceId` — optional string (defaults to `"admin-panel"`)

Response `200`:
```json
{ "accessToken": "eyJ..." }
```

Errors:
| Status | Meaning |
|--------|---------|
| 401 | Wrong email or password |
| 403 | Admin account disabled |

---

### `POST /admin/auth/forgot-password`
**Public**

Request:
```json
{ "email": "admin@bidmart.com" }
```
Response `200`:
```json
{
  "message": "OTP sent to admin@bidmart.com",
  "otp": "123456"   // only present in development
}
```
OTP is **6 digits**, expires in **10 minutes**.

---

### `POST /admin/auth/forgot-password/resend`
Same body and response as `forgot-password`.

---

### `POST /admin/auth/reset-password`
**Public**

Request:
```json
{
  "email": "admin@bidmart.com",
  "otp": "123456",
  "newPassword": "NewAdmin@456",
  "confirmPassword": "NewAdmin@456"
}
```
Password rules: 8–20 chars, uppercase, lowercase, digit, symbol.

Response `200`:
```json
{ "message": "Password has been reset successfully." }
```

---

### `POST /admin/auth/logout`
**Requires `adminAuth` token**

No body. Response `204 No Content`.

---

## 2 — Admin: Countries

> Token required + permission `admin:countries:*`

### `GET /admin/countries`
Query params (all optional):
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Max 100 |
| `isEnabled` | boolean | — | Filter by enabled/disabled |

Response `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "name_en": "Saudi Arabia",
      "name_ar": "السعودية",
      "iso_code": "SAU",
      "image_url": "https://flagcdn.com/w320/sa.png",
      "is_enabled": true,
      "sort_order": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

---

### `POST /admin/countries`
Request:
```json
{
  "name_en": "Saudi Arabia",
  "name_ar": "السعودية",
  "iso_code": "SAU",
  "image_url": "https://flagcdn.com/w320/sa.png",
  "is_enabled": true,
  "sort_order": 1
}
```
- `iso_code`: 2–3 letters only (auto-uppercased)
- `is_enabled` and `sort_order` are optional (defaults: `true`, `0`)

Response `201`: same shape as a single country object above.

Errors:
| Status | Meaning |
|--------|---------|
| 409 | `iso_code` already exists |

---

### `PATCH /admin/countries/:id`
All fields optional — send only what changed:
```json
{
  "name_en": "Saudi Arabia",
  "name_ar": "السعودية",
  "iso_code": "SAU",
  "image_url": "https://...",
  "is_enabled": false,
  "sort_order": 2
}
```
Response `200`: updated country object.

---

### `DELETE /admin/countries/:id`
Response `204 No Content`. Permanent delete.

---

## 3 — Admin: Categories

> Token required + permission `admin:categories:*`

### `GET /admin/categories`
No query params. Returns up to 500 categories ordered by `display_order`.

Response `200`:
```json
[
  {
    "id": "uuid",
    "name_en": "Electronics",
    "name_ar": "إلكترونيات",
    "image_url": "https://cdn.bidmart.com/cats/electronics.png",
    "display_order": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```
> `sub_categories` field is **not** populated in the list — use `GET /admin/categories/:id` to get it.

---

### `GET /admin/categories/:id`
Returns the category **with** its sub-categories array.

Response `200`:
```json
{
  "id": "uuid",
  "name_en": "Electronics",
  "name_ar": "إلكترونيات",
  "image_url": "https://...",
  "display_order": 1,
  "is_active": true,
  "created_at": "...",
  "sub_categories": [
    {
      "id": "uuid",
      "category_id": "parent-uuid",
      "name_en": "Phones & Tablets",
      "name_ar": "هواتف وتابلت",
      "image_url": null,
      "display_order": 1,
      "is_active": true,
      "created_at": "..."
    }
  ]
}
```

---

### `POST /admin/categories`
Request:
```json
{
  "name_en": "Electronics",
  "name_ar": "إلكترونيات",
  "image_url": "https://cdn.bidmart.com/cats/electronics.png",
  "icon_url": "https://cdn.bidmart.com/cats/electronics-icon.png",
  "sub_category_image_url": "https://cdn.bidmart.com/cats/electronics-sub.png",
  "display_order": 1
}
```
- `display_order` optional (default: `0`)
- `icon_url` and `sub_category_image_url` are **required** by the API (not in original OpenAPI spec — discovered during integration)

Response `201`: category object (no `sub_categories`).

---

### `PATCH /admin/categories/:id`
All fields optional:
```json
{
  "name_en": "Electronics",
  "name_ar": "إلكترونيات",
  "image_url": "https://...",
  "display_order": 2,
  "is_active": false
}
```
Response `200`: updated category object.

> Setting `is_active: false` = soft-delete (use `DELETE` for explicit deactivation).

---

### `DELETE /admin/categories/:id`
Sets `is_active = false`. Response `204 No Content`.

---

## 4 — Admin: Sub-Categories

> Token required + permission `admin:sub-categories:*`

### `GET /admin/sub-categories?category_id=<uuid>`
`category_id` query param is **required**.

Response `200`:
```json
[
  {
    "id": "uuid",
    "category_id": "parent-uuid",
    "name_en": "Phones & Tablets",
    "name_ar": "هواتف وتابلت",
    "image_url": "https://...",
    "display_order": 1,
    "is_active": true,
    "created_at": "..."
  }
]
```

---

### `GET /admin/sub-categories/:id`
Response `200`: single sub-category object (same shape as above).

---

### `POST /admin/sub-categories`
Request:
```json
{
  "category_id": "parent-uuid",
  "name_en": "Phones & Tablets",
  "name_ar": "هواتف وتابلت",
  "image_url": "https://cdn.bidmart.com/cats/phones.png",
  "display_order": 1
}
```
- `image_url` and `display_order` are optional

Response `201`: sub-category object.

---

### `PATCH /admin/sub-categories/:id`
All fields optional (same as create minus `category_id`):
```json
{
  "name_en": "Phones",
  "name_ar": "هواتف",
  "image_url": "https://...",
  "display_order": 2,
  "is_active": false
}
```
Response `200`: updated sub-category object.

---

### `DELETE /admin/sub-categories/:id`
Sets `is_active = false`. Response `204 No Content`.

---

## 5 — Admin: Users (Buyer Management)

> Token required + permission `admin:users:*`

### `GET /admin/users`
Query params (all optional):
| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `search` | string | — | Matches name, email, or phone |
| `status` | enum | `active` `banned` `suspended` | Filter by account status |
| `accountType` | enum | `user_only` `upgraded_to_seller` | Filter by account type |
| `page` | number | default 1 | — |
| `limit` | number | default 10, max 100 | — |

Response `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "accountName": "Ahmed Ali",
      "phoneNumber": "+966500000000",
      "email": "ahmed@example.com",
      "status": "active",
      "accountType": "user_only",
      "registrationDate": "2025-11-03T14:23:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

---

### `GET /admin/users/:userId`
Response `200` — full user detail:
```json
{
  "id": "uuid",
  "fullName": "Ahmed Ali",
  "email": "ahmed@example.com",
  "phone": "+966500000000",
  "role": "USER",
  "isActive": true,
  "isVerified": true,
  "avatarUrl": "https://cdn.bidmart.com/avatars/abc.jpg",
  "language": "ar",
  "store": {
    "id": "store-uuid",
    "nameEn": "Ahmed Store",
    "status": "APPROVED"
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```
- `store` is `null` if the user has no store

---

### `PATCH /admin/users/:userId/ban`
Request:
```json
{ "reason": "Violation of terms of service" }
```
- `reason` is **required**, max 500 chars

Response `204 No Content`.

Side effects: revokes all refresh tokens + force-logs-out active access tokens within 15 min.

Errors:
| Status | Meaning |
|--------|---------|
| 404 | User not found |
| 409 | User is already banned |

---

### `PATCH /admin/users/:userId/suspend`
Request:
```json
{ "reason": "Suspicious activity" }
```
Response `204 No Content`.

Side effects: same force-logout as ban.

Errors:
| Status | Meaning |
|--------|---------|
| 409 | User already suspended or deleted |

---

### `PATCH /admin/users/:userId/activate`
No request body.
Response `204 No Content`.

Clears the force-logout flag so the user can log in again.

Errors:
| Status | Meaning |
|--------|---------|
| 409 | User already active, or deleted, or still unverified |

---

### `DELETE /admin/users/:userId`
Soft-delete (GDPR). Response `204 No Content`.

Errors:
| Status | Meaning |
|--------|---------|
| 409 | Cannot delete an admin account |

---

## 5b — Admin: Providers (sellers / stores)

> Token required + permissions `admin:providers:*` (see §8).  
> **OpenAPI:** `Admin_API_integration_S1.json` — tag **Admin — Providers** (paths under `/api/v1/admin/providers`).  
> **Dashboard:** `CLAUDE.md` § **Providers (sellers / stores)**; routes `/providers`, `/providers/:storeId`; feature folder `src/features/providers/` (`providers.api.ts`, `providers.queries.ts`, `providers.columns.tsx`, `providers-list-page.tsx`, `provider-detail-page.tsx`). Axios calls use paths **relative to `VITE_API_URL`** (typically `/admin/providers/...` when base includes `/api/v1`).

### `GET /admin/providers`
Query params (all optional):

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Matches account name, phone, or store name |
| `status` | string | — | Filter: `pending` · `approved` · `rejected` · `blocked` (lowercase, same as list `accountStatus`) |
| `page` | number | 1 | Page index |
| `limit` | number | 20 | Page size (max per gateway) |

Response **`200`** — envelope:
```json
{
  "success": true,
  "data": [
    {
      "id": "store-uuid",
      "accountName": "Ahmed Store",
      "phoneNumber": "+966501234567",
      "verificationStatus": "unverified",
      "commercialRegistrationNumber": "1234567890",
      "country": { "id": "country-uuid", "name_en": "Saudi Arabia", "name_ar": "السعودية" },
      "accountStatus": "pending",
      "createdAt": "2026-05-02T18:51:14.627Z"
    }
  ],
  "meta": {
    "version": "1.0.0",
    "page": 1,
    "limit": 20,
    "total": 44,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
- `country` may be **`null`**.  
- **`verificationStatus`** — commercial registration / KYC (not the storefront **`isVerified`** badge).  
- Sorted **newest first** (default).

---

### `GET /admin/providers/:storeId`
Response **`200`** — envelope with full store + owner + documents:
```json
{
  "success": true,
  "data": {
    "id": "store-uuid",
    "storeLogo": "https://...",
    "isVerified": false,
    "status": "pending",
    "country": { "id": "...", "name_en": "Saudi Arabia", "name_ar": "السعودية" },
    "detailedAddress": "…",
    "returnPolicy": { "ar": null, "en": null },
    "owner": {
      "id": "user-uuid",
      "fullName": "Ahmed Ali",
      "email": "seller@example.com",
      "phoneNumber": "+966501234567",
      "accountStatus": "active",
      "registeredAt": "2026-05-02T18:42:51.844Z"
    },
    "documents": {
      "commercialRegistrationNumber": "…",
      "commercialRegistrationDoc": "https://...pdf",
      "verificationStatus": "unverified"
    },
    "createdAt": "2026-05-02T18:44:27.644Z"
  },
  "meta": { "version": "1.0.0" }
}
```

Errors: `400` invalid UUID, `404` not found.

---

### `PATCH /admin/providers/:storeId/approve`
No body. Response **`204`**. Sets store to approved and user to seller; creates wallet if missing.  
**`409`** — not pending, already resolved, or **owner user is banned**.

---

### `PATCH /admin/providers/:storeId/reject`
Request:
```json
{ "reason": "Commercial registration document is invalid or expired" }
```
Response **`204`**. Seller notified; may re-apply.  
**`409`** — store is not **`pending`**.

---

### `PATCH /admin/providers/:storeId/verify`
No body. Response **`200`** — toggles **`isVerified`** badge. Body is either `{ "isVerified": true }` or wrapped `{ "success": true, "data": { "isVerified": true } }` depending on gateway.  
**`409`** — store is not **approved**.

---

### `PATCH /admin/providers/:storeId/block`
No body. Response **`204`**. Blocks seller (hide catalog, force logout).  
**`409`** — already blocked or store not **approved**.

---

### `PATCH /admin/providers/:storeId/unblock`
No body. Response **`204`**. Restores **approved** store.  
**`409`** — store is not blocked.

---

## 6 — Admin: Roles

> Token required + permissions `admin:roles:*`.
> Dashboard: route `/roles` (`routes/_authed.roles.tsx`), feature folder `src/features/roles/` (`roles.api.ts`, `roles.queries.ts`, `roles.columns.tsx`, `roles-list-page.tsx`). i18n namespace `roles` (registered in `lib/i18n.ts`). Axios paths are relative to `VITE_API_URL` — typically `/admin/roles`, not the full `/api/v1` prefix repeated in handlers.
> JWT may include `role_id`; session maps it to `User.roleId` for UI guards (disable delete when it matches the row, or when `adminCount > 0`, or `isProtected`). API still returns `403`/`409` on violation.

### `GET /admin/roles`
Query params (all optional):

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by English or Arabic role name |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Page size |

Response `200` — paginated list (sorted alphabetically by name):
```json
{
  "data": [
    {
      "id": "uuid",
      "name_en": "Admin",
      "name_ar": "مدير",
      "adminCount": 0,
      "isProtected": false,
      "createdAt": "2026-04-25T12:32:33.456Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 2, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

---

### `GET /admin/roles/permissions`
Returns the permission tree grouped by module (bilingual module titles and permission labels). Used only to render the checklist in create/edit role.

Response `200` (may include `success` / `meta` wrapper depending on gateway):
```json
{
  "success": true,
  "data": [
    {
      "module_en": "User Management",
      "module_ar": "إدارة المستخدمين",
      "permissions": [
        { "key": "admin:users:view", "label_en": "View", "label_ar": "عرض" }
      ]
    }
  ],
  "meta": { "version": "1.0.0" }
}
```

---

### `GET /admin/roles/:roleId`
Response `200` — full role including permission keys:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name_en": "Moderator",
    "name_ar": "مشرف",
    "permissions": ["admin:users:view"],
    "adminCount": 0,
    "isProtected": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Errors: `400` invalid UUID, `404` not found.

---

### `POST /admin/roles`
Request:
```json
{
  "name_en": "Moderator",
  "name_ar": "مشرف",
  "permissions": ["admin:users:view", "admin:orders:view"]
}
```

Response `201` — envelope with message + nested `role` object (same fields as GET detail).

Errors: `409` duplicate name (EN or AR uniqueness per backend rules).

---

### `PATCH /admin/roles/:roleId`
Partial body — send only changing fields (`name_en`, `name_ar`, `permissions`).

Errors: `403` cannot edit protected role, `404`, `409` duplicate name.

---

### `DELETE /admin/roles/:roleId`
Response `204 No Content`.

Errors:
| Status | Meaning |
|--------|---------|
| 403 | Protected / system role |
| 409 | Role still has admins assigned, or is the logged-in admin's role |

---

## 6b — Admin: Admins (operators)

> Token required + permissions `admin:admins:*` (see §8). Block/unblock use **`admin:admins:update`** in the dashboard until the API exposes dedicated JWT keys.
> Dashboard: route `/admins` (`routes/_authed.admins.tsx`), feature folder `src/features/admins/` (`admins.api.ts`, `admins.queries.ts`, `admins.columns.tsx`, `admins-list-page.tsx`). i18n namespace `admins` (registered in `lib/i18n.ts`).
> **Paths:** Handlers in OpenAPI use the full prefix `/api/v1/admin/admins`. The dashboard Axios client uses paths **relative to `VITE_API_URL`** (usually `/admin/admins` when `baseURL` already ends with `/api/v1`).
> **Canonical shapes:** Repo root `Admin_API_integration_S1.json` — tag **`Admin — Admins`**, schemas `AdministratorAccountDto`, `AdministratorRoleSummaryDto`, `PaginatedAdministratorsDto`, `CreateAdministratorDto`, `UpdateAdministratorDto`, `AdministratorMutationResponseDto`.
> JWT includes `is_super_admin`; session maps to `User.isSuperAdmin` for UI guards (super-admin rows: edit only where self applies; never delete/block self or another super admin). Create uses a generated password and triggers a welcome email (no password field in UI).

### `GET /admin/admins`

Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Name or email |
| `isActive` | boolean | — | Active (`true`) vs blocked (`false`) |
| `page` | number | `1` | Page |
| `limit` | number | `10` | Page size |

Response `200` — paginated list sorted by **last login** (most recent first). Gateway may include optional `success: true`:

```json
{
  "success": true,
  "data": [
    {
      "id": "298a276c-9416-4db5-a445-8303969da16b",
      "fullName": "Super Admin",
      "phone": null,
      "email": "admin@bidmart.com",
      "role": {
        "id": "3de76c2e-47dd-46bc-86cc-2456898aa695",
        "name_en": "Super Admin",
        "name_ar": "مدير عام"
      },
      "isActive": true,
      "isSuperAdmin": true,
      "lastLoginAt": "2026-05-02T05:44:54.794Z",
      "createdAt": "2026-04-20T04:32:52.814Z"
    }
  ],
  "meta": {
    "version": "1.0.0",
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### `POST /admin/admins`

Request:

```json
{
  "fullName": "Ahmed Ali",
  "phone": "+966500000000",
  "email": "admin@bidmart.com",
  "roleId": "12a08f81-07b9-4400-9ea8-749520065534"
}
```

Response `201` — `{ "message": "...", "admin": { ...AdministratorAccountDto } }`.

Errors: `400` validation, `404` role not found, `409` duplicate email or phone.

### `GET /admin/admins/:adminId`

Response `200` — administrator object (same shape as list rows). Implemented client-side as `getAdmin()` for detail routes or edit prefetch.

Errors: `400` invalid UUID, `404` not found.

### `PATCH /admin/admins/:adminId`

Partial body: `fullName`, `phone`, `email`, `roleId`. Response `200` — `{ "message": "...", "admin": { ... } }`.

Errors: `403` cannot edit another Super Admin (except self where allowed), `404` admin or role not found, `409` duplicate email or phone.

### `DELETE /admin/admins/:adminId`

Response `204`. Hard delete; sessions terminated.

Errors: `403` cannot delete Super Admin, `409` cannot delete own account.

### `PATCH /admin/admins/:adminId/block`

Response `204`. Sets inactive and terminates sessions.

Errors: `403` cannot block Super Admin, `409` already blocked or cannot block yourself.

### `PATCH /admin/admins/:adminId/unblock`

Response `204`.

Errors: `409` already active.

---

## 7 — HTTP Status Code Reference

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete/action with no body) |
| 400 | Validation failed — check field errors |
| 401 | Missing or expired token |
| 403 | Token valid but insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate, wrong state) |
| 422 | Business rule violation |
| 429 | Rate limited |

---

## 8 — Required Admin Permissions per Action

| Action | Permission value in JWT |
|--------|------------------------|
| View countries | `admin:countries:view` |
| Create country | `admin:countries:create` |
| Update country | `admin:countries:update` |
| Delete country | `admin:countries:delete` |
| View categories | `admin:categories:view` |
| Create category | `admin:categories:create` |
| Update category | `admin:categories:update` |
| Delete category | `admin:categories:delete` |
| View sub-categories | `admin:sub-categories:view` |
| Create sub-category | `admin:sub-categories:create` |
| Update sub-category | `admin:sub-categories:update` |
| Delete sub-category | `admin:sub-categories:delete` |
| View users | `admin:users:view` |
| Ban user | `admin:users:ban` |
| Unban user | `admin:users:unban` |
| Suspend user | `admin:users:suspend` |
| Activate user | `admin:users:activate` |
| Delete user | `admin:users:delete` |
| View providers | `admin:providers:view` |
| Approve provider | `admin:providers:approve` |
| Reject provider | `admin:providers:reject` |
| Verify provider | `admin:providers:verify` |
| Block provider | `admin:providers:block` |
| Unblock provider | `admin:providers:unblock` |
| View roles | `admin:roles:view` |
| Create role | `admin:roles:create` |
| Update role | `admin:roles:update` |
| Delete role | `admin:roles:delete` |
| View admins | `admin:admins:view` |
| Create admin | `admin:admins:create` |
| Update admin | `admin:admins:update` |
| Delete admin | `admin:admins:delete` |
| Block administrator | `admin:admins:update` |
| Unblock administrator | `admin:admins:update` |

The JWT payload contains a `permissions` array. Check that the required permission is present before showing action buttons in the UI.

**Providers (sellers):** full wire shapes, filters, and dashboard mapping — **§5b** above and root **`CLAUDE.md`** (Providers).

---

## 9 — Notes

- All UUIDs follow **UUID v4** format — validate before sending to avoid unnecessary 400s.
- All timestamps are **ISO 8601 UTC** strings (`2026-04-23T10:00:00.000Z`).
- Admin token from login is stored in Zustand with localStorage persistence. User/permissions are decoded from the JWT payload at login (JWT contains `sub`, `role`, `role_id`, `is_super_admin`, `permissions[]`, `deviceId`).
- The `DELETE /admin/categories/:id` and `DELETE /admin/sub-categories/:id` are **soft-deletes** (sets `is_active = false`) — the record still exists in the DB.
- The `DELETE /admin/countries/:id` and `DELETE /admin/users/:userId` are also soft-deletes from the user's perspective but behave differently: countries are permanently deleted, users get a `deletedAt` timestamp.
- **Roles RBAC:** OpenAPI excerpt `Admin_API_integration_S1.json` includes `Admin — Roles` paths (`GET/POST /admin/roles`, `GET /admin/roles/permissions`, `GET/PATCH/DELETE /admin/roles/{roleId}`) and schemas (`RoleDetailDto`, `CreateRoleDto`, permission module DTOs).
- **Admins (operators):** Same file adds tag **`Admin — Admins`** with paths `/api/v1/admin/admins`, `/api/v1/admin/admins/{adminId}`, `/api/v1/admin/admins/{adminId}/block`, `/api/v1/admin/admins/{adminId}/unblock` and DTOs **`AdministratorAccountDto`**, **`PaginatedAdministratorsDto`**, **`CreateAdministratorDto`**, **`UpdateAdministratorDto`**, **`AdministratorMutationResponseDto`**, **`AdministratorRoleSummaryDto`**.
