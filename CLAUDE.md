# BidMart Dashboard — Conventions

## Stack

- **Vite** — fast HMR, ESM-native bundler
- **React 19 + TypeScript** (strict) — UI library
- **Tailwind CSS v4** — CSS-first `@theme`, no JS config
- **TanStack Router** — file-based, typed, route context carries permissions
- **TanStack Query v5 + Axios** — server state + HTTP client
- **TanStack Table v8** — headless table engine
- **Zustand** — cross-feature state (auth, UI)
- **shadcn/ui** — primitives (button, dialog, table, etc.)
- **react-hook-form + zod** — forms & validation
- **i18next** — AR + EN, RTL-aware
- **lucide-react** — icons
- **sonner** — toasts

## Folder Conventions

- Flat, feature-first: `src/features/<name>/`
- Colocated files: `<feature>.api.ts`, `<feature>.queries.ts`, `<feature>.store.ts`, `<feature>.columns.tsx`, `<feature>.schema.ts`
- No nested `components/`/`hooks/`/`utils/` inside features
- No barrel files unless they remove real friction
- Named exports only; default exports only where TanStack Router file-route convention requires
- **Roles example:** `roles.api.ts`, `roles.queries.ts`, `roles.columns.tsx`, `roles-list-page.tsx` (mounted from `routes/_authed.roles.tsx`)
- **Admins example:** `admins.api.ts`, `admins.queries.ts`, `admins.columns.tsx`, `admins-list-page.tsx` (mounted from `routes/_authed.admins.tsx`)
- **Users example:** `users.api.ts`, `users.queries.ts`, `users.columns.tsx`, `users-list-page.tsx`, `user-detail-page.tsx` (`routes/_authed.users.tsx`, detail `routes/_authed.users.$userId.tsx`)
- **Providers example:** `providers.api.ts`, `providers.queries.ts`, `providers.columns.tsx`, `providers-list-page.tsx`, `provider-detail-page.tsx` (list `routes/_authed.providers.tsx`, detail `routes/_authed.providers.$storeId.tsx`)
- **Categories example:** `categories.api.ts`, `categories.queries.ts`, `categories.columns.tsx`, `categories-section-tabs.tsx`, `categories-list-page.tsx`, `sub-categories.columns.tsx`, `sub-categories-list-page.tsx` (layout `routes/_authed.categories.tsx` + index `routes/_authed.categories.index.tsx`, hub `routes/_authed.categories.sub-categories.tsx`, nested `routes/_authed.categories.$categoryId.sub-categories.tsx`)
- **Profile (authenticated admin):** `profile-page.tsx` in `features/profile/` (`routes/_authed.profile.tsx` → **`/profile`**); profile HTTP colocated in **`auth.api.ts`**
- **Countries example:** `countries.api.ts`, `countries.queries.ts`, `countries.columns.tsx`, `countries-list-page.tsx` (`routes/_authed.countries.tsx` → **`/countries`**)

## Admin — Auth

- OpenAPI: repo **`Admin_API_integration_S1.json`** — **`/api/v1/admin/auth/*`** (**`AdminLoginDto`**, **`AdminTokenResponseDto`**, **`AdminLoginApiResponseDto`**, **`AdminForgotPasswordApiResponseDto`**, **`AdminResetPasswordApiResponseDto`**, forgot/reset DTOs); **`/api/v1/admin/profile`** (**`AdminProfileApiResponseDto`**, **`AdminProfileDto`**, **`AdminProfileRoleDto`**, **`UpdateAdminProfileDto`**, **`AdminProfileUpdateApiResponseDto`**, **`AdminProfileUpdateDataDto`**).
- UI: **`routes/login.tsx`** (remember-me checkbox), **`routes/forgot-password.tsx`** (request OTP → resend → reset password), protected **`routes/_authed.tsx`** runs **`useMeQuery`** before **`Outlet`** (`Shell` skeleton while loading). Authenticated admin **`/profile`** — **`routes/_authed.profile.tsx`** → **`features/profile/profile-page.tsx`** (edit **`fullName`**, **`email`**, **`phone`**); topbar user menu links here; locale namespace **`profile`**.
- Colocated (flat **`features/auth/`**): **`auth.api.ts`**, **`auth.store.ts`**, **`auth.queries.ts`** (**`useLoginMutation`**, **`useLogoutMutation`**, **`useMeQuery`**, **`useUpdateAdminProfileMutation`**, forgot/reset mutations, exported **`rejectionMessage`**). Profile UI lives under **`features/profile/`** (page only; HTTP in **`auth.api.ts`**).
- HTTP (paths relative to Axios **`baseURL`**): **`POST /admin/auth/login`** — **`email`**, **`password`**, **`rememberMe`**, **`deviceId`** (dashboard sends **`"admin-panel"`**). Wrapped response **`{ success, data: { accessToken }, meta }`** — unwrap in **`loginRequest`**. Forgot / resend / reset return **`data.message`** (and **`data.otp`** in dev only); logout **`POST /admin/auth/logout`** with bearer — **`204`**. Authenticated profile — **`GET /admin/profile`** (read **`fullName`**, **`email`**, **`phone`**, **`role`** `{ id, name_en, name_ar }`, **`isSuperAdmin`**); **`PATCH /admin/profile`** body **`fullName`**, **`email`**, **`phone`** — response **`data.message`** + **`data.admin`** (same shape as **`GET`**). Unwrap **`{ success, data }`** when present.
- Session: **`useAuthStore`** + persist (**`bidmart-auth`**) saves **`token`** only. **`loginRequest`** decodes the JWT once to seed a minimal **`user`** until layout hydration. **`getMeRequest`** / **`useMeQuery`** validate JWT **`exp`**, then call **`GET /admin/profile`** and merge via **`userFromAdminProfile`**: **`permissions[]`** and the JWT **`role`** string (permission slug) stay from the token; **`User.id`**, **`name`** (`fullName`), **`email`**, **`phone`**, **`roleId`** (API **`role.id`**), **`roleNameEn`** / **`roleNameAr`**, **`isSuperAdmin`** come from the profile response. If **`GET /admin/profile`** fails (e.g. **`401`** / **`404`**), **`useMeQuery`** errors and the session is cleared. JWT claims still include **`sub`**, **`email`**, **`role`**, **`role_id`**, **`is_super_admin`**, **`permissions`**, **`deviceId`**, **`jti`**, **`exp`** (after **`PATCH`**, **`email`** in the store may differ from the token until re-login).
- Forms: Login password **8–20** chars (API **`400`** outside range). Reset matches API strength (uppercase, lowercase, digit, symbol). Bind **`rememberMe`** with **`Controller`** + **`Checkbox`** (**`register`** does not work with Radix checkbox).
- Axios (**`lib/axios.ts`**): **`401`** clears storage + hard redirect **`/login`** **unless** the request targets **`/admin/auth/login`**, **`/admin/auth/forgot-password`**, **`/admin/auth/forgot-password/resend`**, or **`/admin/auth/reset-password`** (wrong password / validation must show on the form). **`403`** permission toast is skipped for those same paths so disabled-account copy can come from the response. Request bearer is read from persisted Zustand storage in **`localStorage`**; helpers **`extractApiErrorMessage`** + **`rejectionMessage`** prefer nested **`data.message`** when present.

## Admin — Files (S3 presign upload)

- OpenAPI: repo **`Admin_API_integration_S1.json`** — **`POST /api/v1/admin/files/upload`**, **`DELETE /api/v1/admin/files`** (tag **Admin — Files**); schemas **`AdminPresignUploadRequestDto`**, **`AdminPresignFileItemDto`**, **`AdminPresignUploadResponseDto`**, **`UploadResultDto`**, **`DeleteFileDto`**.
- Code: **`lib/upload.ts`** — **`uploadFile`** (presign → **PUT** to S3 → return **`mediaUrl`**), **`deleteFile`**, **`validateImageFile`**, **`extractS3Key`** (pathname without leading slash, for **`DELETE`** **`key`**). Exported **`UploadCase`**: **`category_image`**, **`country_image`**, **`sub_category_image`**, **`product_image`**.
- HTTP (paths relative to Axios **`baseURL`**): **`POST /admin/files/upload`** — body **`{ case, files }`**: **`case`** is the upload kind (same literals as **`UploadCase`**); **`files`** is **`1–10`** items **`{ contentType, fileName }`**. The dashboard sets **`fileName`** to **`{case}/{uuid}-{timestamp}.{ext}`** derived from MIME. Response **`{ success, data: [{ preSignedURL, mediaUrl }], meta? }`** (unwrap **`data`**). Browser **`PUT`** **`preSignedURL`** with header **`Content-Type: <file.type>`** and body = file bytes; use returned **`mediaUrl`** as **`image_url`** / **`icon_url`** / etc. **`DELETE /admin/files`** — JSON **`{ key }`** (**S3 object key**) — **`204`**. Not wired on **`ImageUploadField`** “remove” today (optional orphan cleanup).
- UI: **`components/shared/image-upload-field.tsx`** (**`ImageUploadField`**) — categories (**`category_image`**, **`sub_category_image`**), sub-categories (**`sub_category_image`**), countries (**`country_image`**). Single module for presign; do not duplicate **`/files/*`** client paths in the dashboard.
- Auth: requires admin bearer like other **`/admin/*`** routes.

## Roles (admin RBAC)

- UI: `/roles`, file route `routes/_authed.roles.tsx`; list + create/edit modal in `features/roles/roles-list-page.tsx` with `DataTable` + granular permission matrix from API.
- HTTP (paths are relative to the Axios `baseURL` in env): list `GET /admin/roles` (search, pagination); modules `GET /admin/roles/permissions`; detail `GET /admin/roles/{id}`; `POST /admin/roles`; `PATCH` / `DELETE /admin/roles/{id}`.
- Auth: JWT may include `role_id`; after **`useMeQuery`**, session **`User.roleId`** matches **`GET /admin/profile` → `role.id`** (the JWT **`role`** string remains on **`User.role`** for permission checks). UI-only guards: blocked delete for current role, protected rows, nonzero `adminCount`. Server remains authoritative (`403`/`409`).
- Guards: route uses `PERMISSIONS.roles.view`; mutations use `roles.create` | `update` | `delete` with `<Can>`.

## Admins (operator accounts)

- UI: `/admins`, file route `routes/_authed.admins.tsx`; list + create/edit modal in `features/admins/admins-list-page.tsx` with `DataTable`; role assignments use `GET /admin/roles` (picklist while the modal is open).
- HTTP (paths are relative to the Axios `baseURL` in env): list `GET /admin/admins` (`search`, `isActive`, pagination); detail `GET /admin/admins/{id}` (`getAdmin` in `admins.api.ts`, optional for detail routes or edit prefetch); `POST /admin/admins`; `PATCH /admin/admins/{id}`; `DELETE /admin/admins/{id}`; `PATCH /admin/admins/{id}/block`; `PATCH /admin/admins/{id}/unblock`.
- Auth: JWT includes `is_super_admin`; session **`User.isSuperAdmin`** is taken from **`GET /admin/profile`** after hydration (login still seeds from JWT). UI-only guards (no edit/delete/block/unblock for another super admin except where self-edit applies; no delete/block self). Server remains authoritative (`403`/`409`).
- Guards: route uses `PERMISSIONS.admins.view`; header create uses `<Can permission={PERMISSIONS.admins.create}>`. Row actions gate on `admins.update` (edit, block, unblock) and `admins.delete` (delete)—there are no separate JWT strings for block/unblock today.
- Forms: this modal passes `suppressInitialFocus` on `FormDialog` (`components/shared/form-dialog.tsx`) so opening does not auto-focus the first input (avoids one field showing an isolated focus ring); programmatic focus lands on the dialog title instead.

## Countries (admin reference data)

- OpenAPI: repo **`Admin_API_integration_S1.json`** — tag **Admin — Countries** (`CountryDto`, **`CreateCountryDto`**, **`UpdateCountryDto`**, list **`{ success, data, meta }`**, **`PATCH …/{id}/toggle`**).
- UI: **`/countries`**, **`routes/_authed.countries.tsx`** → **`features/countries/countries-list-page.tsx`** with **`DataTable`**; locale namespace **`countries`**.
- Colocated files (flat **`features/countries/`**): **`countries.api.ts`**, **`countries.queries.ts`**, **`countries.columns.tsx`**, **`countries-list-page.tsx`**, **`countries.mock.ts`** (optional).
- HTTP (paths relative to Axios **`baseURL`**): list **`GET /admin/countries`** — **`search`** (name EN or AR), **`isEnabled`** (boolean), **`page`**, **`limit`** (default **10**). Response **`{ success, data, meta }`**; **`listCountries`** returns **`{ data, meta }`**. **`POST /admin/countries`** body **`name_en`**, **`name_ar`**, **`iso_code`**, **`image_url`**, optional **`is_enabled`**, **`sort_order`** — unwrap created country from **`data`**. **`PATCH /admin/countries/{id}`** partial update (**no `iso_code`** in body; UI keeps ISO read-only after create). **`PATCH /admin/countries/{id}/toggle`** toggles **`is_enabled`**; response **`{ isEnabled }`** or nested / snake_case — unwrapped in **`toggleCountryEnabled`**. **`DELETE /admin/countries/{id}`** — **204**; **409** if users are linked.
- Types (`types/api.ts`): **`Country`** — list rows may omit **`updated_at`**; **`iso_code`** is three-letter; snake_case fields match API.
- List UX: **`TableFiltersShell`** + **`SearchInput`** + **`FilterSelect`** (enabled/disabled); combined **country** column (flag + bilingual names); **`onRowClick`** opens edit when **`countries.update`**; row actions: edit, enable/disable via **toggle** endpoint ( **`countries.update`**), delete (**`countries.delete`**) with menu separator before delete; **`FormDialog`** **`sm:max-w-2xl`**, **`suppressInitialFocus`**, sectioned form, client validation + **`submitDisabled`**, **`ImageUploadField`** **`country_image`**.
- Errors: **`extractMutationError`** in **`countries.queries.ts`** → **`toast.error`** with **`countries:errors.*`** (mutations + validation toasts).
- Guards: route **`PERMISSIONS.countries.view`**; create/edit/toggle/delete gated with **`<Can>`** and **`PERMISSIONS.countries.create` \| `update` \| `delete`**.

## Users (buyers — buyer management)

- OpenAPI: repo **`Admin_API_integration_S1.json`** — **`/api/v1/admin/users`** (**`AdminUsersListResponseDto`**, **`AdminUserRowDto`**, **`AdminUserDetailResponseDto`**, **`AdminUserDetailDto`**, **`AdminUserStoreDto`**, **`AdminUserVerificationRequestDto`**).
- UI: **`/users`** list and **`/users/:userId`** detail. **`routes/_authed.users.tsx`** guards with **`PERMISSIONS.users.view`** and renders **`UsersListPage`** when the active route is not the detail match; **`useMatchRoute({ to: '/users/$userId' })`** selects **`<Outlet />`** so **`routes/_authed.users.$userId.tsx`** mounts **`UserDetailPage`** (same guard). **`PageHeader`** **`description`** may be **`ReactNode`** (e.g. mono phone).
- Colocated files (flat **`features/users/`**): **`users.api.ts`**, **`users.queries.ts`**, **`users.columns.tsx`**, **`users-list-page.tsx`**, **`user-detail-page.tsx`**, **`users.mock.ts`** (optional local mocks).
- HTTP (paths relative to Axios **`baseURL`**): list **`GET /admin/users`** — **`search`** (name / email / phone), **`status`** (`active` \| `banned` \| `suspended`), **`accountType`** (`user_only` \| `upgraded_to_seller`), **`page`**, **`limit`** (default **10**). Response **`{ success, data, meta }`**; **`listUsers`** returns **`{ data, meta }`**. Detail **`GET /admin/users/{userId}`** — unwrap **`{ success, data }`** when present (**`getUserDetail`**). **`PATCH …/ban`** and **`PATCH …/suspend`** with **`{ reason }`** (**204**). **`PATCH …/activate`** (**204**, no body). **`DELETE …/{userId}`** soft-delete (**204**).
- Types (`types/api.ts`): list **`AdminUserListItem`** (**`accountName`**, **`phoneNumber`**, **`email`**, **`status`**, **`accountType`**, **`registrationDate`** — camelCase as returned by the list API). Detail **`AdminUserDetail`** uses API-aligned fields: **`phone_number`**, **`full_name`**, **`profile_picture`**, **`account_status`**, **`created_at`**, **`updated_at`**, **`role`** (`user` \| `seller`), **`stores`** (**`AdminUserStore[]`** with **`commercial_registration_number`**, **`status`**, **`is_verified`**, **`verification_requests`**, etc.). Do not assume legacy detail shapes (**`fullName`**, **`isActive`**, **`language`**, single **`store`** with **`nameEn`**) — they are not returned by this API.
- Badges: list **`status`** → **`StatusBadge`** (default **account** type). **`accountType`** → **`StatusBadge`** **`type="accountType"`**. On detail, store lifecycle → **`StatusBadge`** **`type="seller"`** via **`providerAccountStatusForSellerBadge()`** in **`providers.api.ts`**. Store **`is_verified`** → **`type="sellerVerified"`**.
- Moderation UX (list + detail): **suspend** only when **`account_status === 'active'`**; **ban** when **`account_status !== 'banned'`** (includes suspended); **activate** when **`banned`** or **`suspended`**.
- Errors: **`extractMutationError`** in **`users.queries.ts`** → **`toast.error`** with **`users:errors.*`** fallback copy (same idea as **`categories.queries.ts`** / **`providers.queries.ts`**).
- Guards: **`PERMISSIONS.users.view`** on routes; **`users.ban`**, **`suspend`**, **`activate`**, **`delete`** on actions with **`<Can>`**. **`PERMISSIONS.users.unban`** exists in **`lib/permissions.ts`** for JWT completeness; the live API restores banned accounts via **`PATCH …/activate`** (**`users.activate`**), not a separate unban route.

## Providers (sellers / stores)

- OpenAPI: repo **`Admin_API_integration_S1.json`** — tag **Admin — Providers** (`ProviderSummaryDto`, **`AdminProvidersListResponseDto`** `{ success, data, meta }`, **`AdminProviderDetailResponseDto`**, `PATCH …/block` & `…/unblock`, **`ToggleVerificationMutationResponseDto`**).
- UI: `/providers` list and `/providers/:storeId` detail; `PageHeader` `description` may be **`ReactNode`** (e.g. provider detail subtitle with phone, country icon, timestamps). **Detail moderation actions** use `PageHeader` **`actions`** as plain **`Button`** / `<Can>` siblings (no extra bordered `bg-muted` strip around the group).
- HTTP (paths relative to Axios `baseURL`): list `GET /admin/providers` with `search`, `status`, `page`, `limit`; detail `GET /admin/providers/{storeId}`; `PATCH …/approve` (204); `PATCH …/reject` with `{ reason }` (204); `PATCH …/verify` toggles **`isVerified`** badge on approved stores (200 — body may be `{ isVerified }` or nested `{ data: { isVerified } }`, unwrapped in `providers.api.ts`); `PATCH …/block` and `PATCH …/unblock` (204).
- Responses: backend wraps payloads in **`{ success, data, meta? }`**; `listProviders` / `getProviderDetail` unwrap in `providers.api.ts` (follow the same pattern as `listAdmins` / `getAdmin`).
- Payload shapes (`types/api.ts`): list rows are **`ProviderSummary`** (`accountName`, `phoneNumber`, `verificationStatus` for docs/KYC, `commercialRegistrationNumber`, `country` ref or null, **`accountStatus`** as lowercase `pending` | `approved` | `rejected` | `blocked`, `createdAt`). Detail is **`ProviderDetail`** (`storeLogo`, `isVerified`, `status`, `country`, `detailedAddress`, `returnPolicy`, **`owner`** object, **`documents`** object including `verificationStatus`, `commercialRegistrationDoc`, `createdAt`). Do not assume legacy list fields (`nameEn` / `user` nesting) — they are not returned by this API.
- Status filter & badges: query **`status`** uses the same lowercase values as **`accountStatus`**. For **`StatusBadge`** `type="seller"`, map **`blocked` → `SUSPENDED`** via **`providerAccountStatusForSellerBadge()`** in `providers.api.ts`. Documents column uses **`StatusBadge`** `type="providerVerification"` (`pending_verification` \| `unverified` \| `verified`); locale keys live under **`components:provider_verification.*`**. Platform verified badge on detail uses **`type="sellerVerified"`** (`components:status.verified` / `unverified`).
- Guards: routes use **`PERMISSIONS.providers.view`**; mutations use **`providers.approve`** \| **`reject`** \| **`verify`** \| **`block`** \| **`unblock`** with `<Can>` and row/menu actions. **`PATCH /verify`** is not the same field as list **`verificationStatus`** (documents vs storefront badge — list confirms toggle via neutral copy since **`isVerified`** is absent on list rows).
- Errors: mutations use **`onError`** toasts with **`providers:errors.*`** (see **`extractMutationError`** pattern in **`providers.queries.ts`**, same idea as admins/roles).

## Categories (product taxonomy)

- **UI:** Layout **`routes/_authed.categories.tsx`** — **`CategoriesSectionTabs`** (`features/categories/categories-section-tabs.tsx`) + **`<Outlet />`**; guarded with **`PERMISSIONS.categories.view`**. Child routes:
  - **Index** **`routes/_authed.categories.index.tsx`** → **`/categories`** (and **`/categories/`**) → **`categories-list-page.tsx`**.
  - **Sub-categories hub** **`routes/_authed.categories.sub-categories.tsx`** → **`/categories/sub-categories`**, optional typed search **`parent`** (parent category UUID) → **`sub-categories-list-page.tsx`** with **`variant="hub"`**. Guarded with **`PERMISSIONS.subCategories.view`**.
  - **Nested drill-down** **`routes/_authed.categories.$categoryId.sub-categories.tsx`** → **`/categories/$categoryId/sub-categories`** → **`sub-categories-list-page.tsx`** with **`variant="under-category"`**. Same permission as hub.
- **Navigation:** Row click and **View sub-categories** open the **nested** route. **Open sub-categories hub** (when the user has **`subCategories.view`**) opens the hub with **`?parent=`** set. Tabs link **Categories** ↔ **Sub-categories** (hub); the hub tab is omitted if the user lacks **`subCategories.view`**.
- **Colocated files:** `categories.api.ts`, `categories.queries.ts`, `categories.columns.tsx`, `categories-section-tabs.tsx`, `categories-list-page.tsx`, `sub-categories.columns.tsx`, `sub-categories-list-page.tsx` (flat **`features/categories/`** — no nested **`components/`**).
- **HTTP** (paths relative to Axios **`baseURL`):**  
  - List **`GET /admin/categories`** — query **`search`** (EN/AR name), **`page`**, **`limit`** (default page size **10**). Response **`{ success, data, meta }`**; **`listCategories`** returns **`{ data, meta }`** (same idea as **`listProviders`**).  
  - Detail **`GET /admin/categories/{id}`** — full record + **`sub_categories`[]**; unwrap **`{ success, data }`** when present.  
  - **`POST /admin/categories`** / **`PATCH /admin/categories/{id}`** — **`name_en`**, **`name_ar`**, **`image_url`**, **`icon_url`**, **`sub_category_image_url`**, optional **`description_en`/`description_ar`**, **`display_order`**; **`PATCH`** may include **`is_active`**. Unwrap created/updated body from **`data`**.  
  - **`DELETE /admin/categories/{id}`** — **204**; **409** if sub-categories must be deleted first (dashboard delete copy reflects this).  
  - Sub-categories: **`GET /admin/sub-categories`** — required **`category_id`**; optional **`search`** (EN/AR name), **`page`**, **`limit`**. Response **`{ success, data, meta }`**; **`listSubCategories`** returns **`{ data, meta }`**. **`GET /admin/sub-categories/{id}`** — **`getSubCategoryDetail`**, unwrap **`data`**. **`POST`** / **`PATCH`** — names, optional **`image_url`**, **`description_en`/`description_ar`**, **`display_order`**; **`PATCH`** may include **`is_active`** and **`category_id`** (move to another parent). **`DELETE /admin/sub-categories/{id}`** — **204** per current product spec; confirm if deployment differs.
- **Types (`types/api.ts`):** List rows **`Category`** — **`subCategoriesCount`**, **`icon_url`**, timestamps **`created_at`**. **`CategoryRecord`** — full scalar fields (incl. **`sub_category_image_url`**, descriptions, **`updated_at`**) without nested subs. **`CategoryDetail`** extends **`CategoryRecord`** with **`sub_categories`** (**`SubCategoryRecord[]`**). **`SubCategoryListItem`** — paginated list row (optional embedded **`parentCategory`**). **`SubCategoryRecord`** — full sub-category (**`description_en` / `description_ar`**, **`updated_at`**). **`SubCategory`** aliases **`SubCategoryRecord`**.
- **List UX:** **`TableFiltersShell`** + **`SearchInput`** + server **`DataTable`** pagination; optional **`meta`** line with **`format.number(meta.total)`**. **Media** column shows hero image + icon (**`ImagePreview`**). Sub-category list is server-paginated; hub view may show a **parent** column.
- **Forms:** Category: large **`FormDialog`** (**`sm:max-w-2xl`**). Sub-category: **`sm:max-w-2xl`**, **`suppressInitialFocus`**, sections (names / media / descriptions / order & parent on edit / visibility). Edit prefetches **`getCategoryDetail`** or **`getSubCategoryDetail`** via **`queryClient.fetchQuery`**; gate submit with **`submitDisabled`** during prefill. Parent **`PageHeader`** may use **`description` as `ReactNode`** (thumbnail + bilingual title on nested sub view; hub uses copy + picker in filters).
- **Errors:** **`extractMutationError`** in **`categories.queries.ts`** → toasts **`categories:errors.*`** and **`categories:sub.errors.*`**.
- **Guards:** Layout uses **`categories.view`**; hub and nested sub routes use **`subCategories.view`**. Mutations use **`categories.*`** and **`subCategories.*`** with **`<Can>`**. Row actions expose **View sub-categories**; **Open sub-categories hub** when **`subCategories.view`**.
- **Spec / OpenAPI:** Repo **`Admin_API_integration_S1.json`** — **Admin — Categories** (`CategoryListItemDto`, **`AdminCategoriesListResponseDto`**, **`AdminCategoryDetailResponseDto`**, **`CategoryDto`**) and **Admin — Sub-categories** (`SubCategoryListItemDto`, **`AdminSubCategoriesListResponseDto`**, **`AdminSubCategoryDetailResponseDto`**, **`SubCategoryDto`**, create/update DTOs). If production responses differ, keep **`categories.api.ts`** aligned with deployment.

## Shell / Navigation Chrome

- **Topbar is dumb** (`components/layout/topbar.tsx`). It takes **no props** — no `title`, no breadcrumb data, nothing per-page. All header surfaces derive from `useRouterState` + `navSections`. If you find yourself wanting a `title` prop on `Shell`, register the route in `nav-items.ts` instead. Threading per-page chrome through `Shell` is an anti-pattern (this is exactly what made every page show "Overview" before the rework).
- **Breadcrumb is route-derived** (`components/layout/breadcrumb-trail.tsx`) and **group-aware**. At module init it walks `navSections` and stores a full **chain** (Group → … → Leaf) per surface in `PATH_TO_CRUMBS`, plus a `SEGMENT_LABELS` map of leaves' final URL segments → label key. At render it finds the **longest known prefix** of the pathname, emits that chain (so `/categories` → "Catalog → Categories", `/categories/sub-categories` → "Catalog → Sub-categories"), then continues segment-by-segment for any tail (`/categories/<uuid>/sub-categories` → "Catalog → Categories → Detail → Sub-categories"). Group crumbs have no `to` (groups aren't pages) so they render as spans; leaf crumbs link to their path unless they're the final URL segment, in which case they render as `<span aria-current="page">`. Unknown tail segments fall back to `SEGMENT_LABELS[seg]`, then `shell:topbar.detail` for uuid/numeric ids, then a humanized string. To label a new route correctly, just register it in `nav-items.ts` (the chain comes for free); for surfaces not in the sidebar (e.g. `/profile`), add a manual entry to `PATH_TO_CRUMBS`. Separator uses `ChevronRight` with `rtl:rotate-180`.
- **Command palette is the canonical jump-to surface** (`components/layout/command-palette.tsx`). Flatten `navSections` into leaves once at module init, filter at render with `can(permissions, leaf.permission)`, render with `CommandDialog` from `components/ui/command.tsx`. Bind `⌘K` / `Ctrl+K` globally with **`useCommandPaletteHotkey`** (listens on `keydown`, `metaKey || ctrlKey`, preventDefault). **Always** `queueMicrotask(() => navigate({ to }))` from `onSelect` so the dialog unmounts before the route change — navigating synchronously inside `onSelect` leaves the palette mounted and steals focus from the new page. Any new top-level surface appears in the palette automatically once registered in `nav-items.ts`; no per-feature wiring.
- **Search-trigger pill pattern.** A surface that *looks* like a search input but *opens* something is a `<button>`, not an `<input>` — the topbar uses `bg-muted/60` → `hover:bg-muted`, search icon at start, placeholder span with `flex-1 text-start`, keyboard `<kbd>` hint at end. Hidden under `md` (`hidden md:flex`); the global hotkey still works on smaller viewports. Use this anywhere a launcher needs to feel input-shaped without the form-control semantics.
- **Tray popovers (notifications, etc.)** use `Popover` from `components/ui/popover.tsx`, not `DropdownMenu` — `DropdownMenu` is for action lists, `Popover` is for arbitrary content. Layout: thin header strip (`border-b border-border px-4 py-3`) with the section title, then body. Empty state = icon at `text-muted-foreground/40` + one-line headline (`text-foreground`) + one-line hint (`text-xs text-muted-foreground`). No illustration (Anti-Slop Rules).
- **Platform key detection.** Detect Mac via `navigator.userAgent` matching `/Mac|iPhone|iPad/i`. `navigator.platform` is deprecated and TS will flag it.
- **Shell chrome i18n** lives in `shell.json` under `topbar.*` (`search`, `search_placeholder`, `search_empty`, `navigate`, `account`, `detail`, `notifications`, `notifications_empty`, `notifications_empty_hint`, `my_profile`, `logout`, etc.). Jump-to-page labels in the palette and breadcrumb **reuse `shell:nav.*`** — never duplicate sidebar labels into a new namespace; one source of truth keeps sidebar / breadcrumb / palette in sync forever.

## Context vs Zustand

- **Context**: dependency injection only (providers tree, i18n, permission gate)
- **Zustand**: shared mutable state (auth, UI, notifications)
- Do not put server-state in Zustand — use TanStack Query

## Styling Rules

- All tokens as CSS variables in `src/styles/tokens.css`, mapped via `@theme` in `src/styles/index.css`
- No arbitrary hex values — always reference token variables or Tailwind utilities (motion tokens exposed to Tailwind often use parentheses form, e.g. `duration-(--duration-hover)` / `ease-(--ease-default)`)
- No inline styles
- `cn()` from `lib/utils` for conditional classes
- Tailwind classes only — no custom CSS unless unavoidable

## Color Rules

- Primary brand `#3660B5` (Primary500) — primary button, active nav, focus ring; exposed as `--color-primary` / `--color-ring`
- Primary hover `#6993E8` (Primary400) — primary button hover, soft accent surfaces; exposed as `--color-primary-hover` (`bg-primary-hover`)
- Secondary brand `#551CCA` (Secondary500) — purple accent for charts, dual-tone highlights; opt-in via `--color-brand-secondary` (`bg-brand-secondary`). Lighter variant `#884FFD` (Secondary400) via `--color-brand-secondary-hover`
- Do NOT remap `--color-secondary` (neutral `#F5F5F4`) — backs the shadcn `variant="secondary"` button as a grey surface
- Semantic success — emerald (`bg-emerald-50/500/700`, `text-emerald-600/700`) reserved for active/approved/verified/enabled states and positive deltas. Never tinted with primary
- Warm stone neutrals for everything else — canvas `#F5F3F0`, card `#FFFFFF`, sidebar `#FAFAF8`
- Destructive `#DC2626` — block/reject/delete only
- No gradients. No tertiary brand accents beyond the blue/purple pair above
- Borders do structure, not shadows — universally `1px solid var(--color-border)`

## Shadow Rules

- 3-tier elevation: `--shadow-rest` (cards at rest), `--shadow-raised` (content shell, dialogs), `--shadow-floating` (popovers, dropdowns, toasts)
- **`Card`** (`components/ui/card.tsx`): default drop shadow is **`shadow-rest`** (maps to `--shadow-rest`), not Tailwind `shadow-sm`. Do not override with generic shadows unless the surface is a different tier.
- Hover NEVER adds shadow — use background change instead
- Shadow = depth tier = state, not feedback
- Sidebar has no shadow — separates from canvas by background color only

## Motion Rules

Three house patterns — the difference between "transitions" and "smooth":

1. **Two-speed transitions.** Never animate structure and color on the same timeline. Width/height = `--duration-layout` (280ms) + `--ease-sidebar`. Color/opacity = `--duration-hover` (150ms) + `--ease-default`. Split them across two transition properties when both change at once.
2. **Morph, don't swap.** State changes (active/inactive, expanded/collapsed, chevron flip) animate existing element properties. `display: none` ↔ `display: block` is banned. Use opacity + scale-y/rotate for appear/disappear.
3. **Background as a sibling, not a style.** For surfaces that resize AND recolor (sidebar rows, segmented controls, tab bars), render the hover/active fill as an absolutely-positioned `<span>` behind content. The fill resizes on `--duration-layout`, its color cross-fades on `--duration-hover`.

Duration/easing pairings:
- `--duration-instant` (90ms) + `--ease-default` — checkbox, focus ring, icon swap
- `--duration-hover` (150ms) + `--ease-default` — color, opacity, fill
- `--duration-emphasized` (180ms) + `--ease-emphasized` — tooltip/popover/menu/toast entry
- `--duration-layout` (280ms) + `--ease-sidebar` — width, height, margin, collapse
- Exit transitions always use `--ease-exit` (ease-in), faster than entry
- No springs. No bounces. No stagger.

## Z-index Rules

- Use tokens from `tokens.css` (`var(--z-sidebar)`, etc.), never raw numbers
- Scale: base(0), sticky(10), overlay(20), sidebar(30), topbar(40), popover(50), tooltip(60), backdrop(70), dialog(80), toast(90)

## Interaction State Rules

| Component | Hover | Active/Selected | Focus (keyboard) | Disabled |
|---|---|---|---|---|
| Nav link | `bg-muted-foreground/10` | `bg-primary/10`, `text-primary`, 3px edge bar | 3px `ring/50` | — |
| Primary button | `bg-primary/90` | — | 3px `ring/50` | `opacity:.5`, `pointer-events:none` |
| Ghost/outline button | `bg-accent` | — | 3px `ring/50` | `opacity:.5` |
| Destructive button | `bg-destructive/90` | — | 3px `ring/50` on destructive | `opacity:.5` |
| Input | no change | — | `border-ring` + 3px `ring/50` | `bg-muted`, `opacity:.6` |
| Table row | `bg-muted/50` | `bg-primary/10` (multi-select only) | outline offset 2px | — |
| Card | static (no hover) | — | — | — |

- Focus ring is always 3px at `primary/50` — never another color, never dashed
- No scale-down or translate on press — opacity only (`.95`)

## Radius Rules

- `6px` — inputs, small buttons
- `8px` — default (cards, popovers)
- `12px` — elevated cards/panels
- `16px` — outer content shell
- Nothing over 16px. Full-pill (`rounded-full`) only on badges.

## Iconography Rules

- `lucide-react` is the sole icon library
- Sizes: `h-4 w-4` (inline/buttons), `h-[18px] w-[18px]` (nav items), `h-5 w-5` (emphasis)
- Icon buttons: `size-9` (default), `size-8` (sm), `size-10` (lg)
- Icons inherit text color — never apply color tint directly
- Directional icons (chevrons, arrows) flip via `rtl:rotate-180`
- No emoji, no unicode-as-icon

## Content/Copy Rules

- Operator copy: dense, literal, denotational — tells admins what a thing is
- Title Case for nav items and page titles; Sentence case for button labels
- Short, declarative, verb-first. No marketing adjectives ("powerful", "seamless")
- No exclamation points, no em-dashes for drama, no rhetorical questions
- Currency is SAR (Saudi Riyal), always locale-formatted via `format.currency()`

## RTL Rules

- Logical properties only: `ps-`*/`pe-*` (not `pl-*`/`pr-*`), `ms-*`/`me-*`, `text-start`/`text-end` (not `text-left`/`text-right`)
- `inset-inline-start`/`inset-inline-end` for positioning
- Directional icons flip in RTL via `rtl:rotate-180` or mirrored variants
- Never use `left`/`right` in utility classes

## i18n Rules

- No hardcoded strings in components, ever
- One namespace per feature (e.g., `users.json`), plus `common.json`, `components.json`, and `shell.json`
- Current namespaces: `common`, `components`, `shell`, `users`, `countries`, `categories`, `providers`, `roles`, `admins`, `profile`
- Use `t('namespace:key')` pattern
- Pluralization via i18next
- Locale persisted to localStorage (`bidmart-lang` key), applied to `<html dir>` and `<html lang>` on change
- When adding a new feature, register its namespace in `src/lib/i18n.ts` (import + add to `resources` and `ns`)

## Table Rules

- Extend shared `DataTable` from `components/data-table/data-table.tsx`
- Server-side pagination by default
- Column defs colocated as `<feature>.columns.tsx`
- 48px row height, sticky header, hairline borders
- Empty state: one line of copy, one action, no illustration
- **Filter bar:** Wrap search/filters above the table in **`TableFiltersShell`** (`components/shared/table-filters-shell.tsx`): `rounded-xl border border-border bg-card p-4 shadow-rest`, optional trailing **`meta`** (localized total using `format.number(meta.total)`). Avoid one-off `bg-muted/*` shells for primary list filters.
- **List page layout:** `space-y-6` between `PageHeader` and the table block (aligned with admins, roles, users, countries, providers, categories).

## TanStack Router — list + detail under one path

- If a URL has nested children (e.g. `/providers` + `/providers/$storeId`), the parent layout must render **`<Outlet />`** when the child route is active. Rendering only the list component hides detail pages.
- **Preferred:** layout route with **`<Outlet />`** and an **index** file for the table (e.g. `_authed.providers.index.tsx` with `createFileRoute('/_authed/providers/')`); avoid ad-hoc `useMatchRoute` branching when an index route keeps the tree obvious.
- **Users:** `_authed.users.tsx` intentionally uses **`useMatchRoute`** to render **`UsersListPage`** on **`/users`** vs **`<Outlet />`** for **`/users/$userId`** (no `_authed.users.index.tsx`). Keep list + detail behavior in sync when changing this tree.
- **Categories:** `_authed.categories.tsx` layout + `_authed.categories.index.tsx` for the main table; add sibling child files for **`/sub-categories`** (hub) and **`/$categoryId/sub-categories`** (drill-down). Do not use the old flat **`_authed.categories_.$categoryId...`** path-only trick unless a child cannot be nested under the layout.

## Permission Rules

- Every protected route guards via `usePermission(PERMISSIONS.resource.action)` in the route component, rendering `<PermissionDenied />` on failure
- Every mutation button wrapped in `<Can permission="...">` component (`components/permissions/can.tsx`)
- Permission format: `admin:resource:action` (e.g., `admin:users:view`, `admin:providers:approve`)
- `PERMISSIONS` constant in `lib/permissions.ts` is the source of truth — maps to actual JWT permission strings
- Available permission groups: `users`, `providers`, `countries`, `categories`, `subCategories`, `roles`, `admins`

## Formatting Rules

- Never render raw numbers or ISO date strings
- Always use `lib/format.ts`: `format.currency()`, `format.number()`, `format.date()`, `format.dateTime()`
- Financial columns use `font-mono tabular-nums`

## Component Authoring Checklist

- Named export, not default
- Props as `interface`, not `type`
- No `React.FC`
- No unnecessary `useMemo`/`useCallback`
- No `React.FC` or `React.FunctionComponent`

## Anti-Slop Rules

- No gradients on buttons or cards
- No emoji in UI chrome
- No glass-morphism / backdrop blur panels
- No centered-hero-with-three-feature-cards layouts
- Numeric data is `font-mono tabular-nums`, always
- Empty states: one line of copy, one action, no illustration
- Never `text-left`/`text-right` — use `text-start`/`text-end`
- Never `pl-*`/`pr-*` — use `ps-*`/`pe-*`
- Directional icons flip in RTL

## Commit Style

- Conventional commits, imperative mood
- `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- No co-author footers