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
- **Providers example:** `providers.api.ts`, `providers.queries.ts`, `providers.columns.tsx`, `providers-list-page.tsx`, `provider-detail-page.tsx` (list `routes/_authed.providers.tsx`, detail `routes/_authed.providers.$storeId.tsx`)
- **Categories example:** `categories.api.ts`, `categories.queries.ts`, `categories.columns.tsx`, `categories-section-tabs.tsx`, `categories-list-page.tsx`, `sub-categories.columns.tsx`, `sub-categories-list-page.tsx` (layout `routes/_authed.categories.tsx` + index `routes/_authed.categories.index.tsx`, hub `routes/_authed.categories.sub-categories.tsx`, nested `routes/_authed.categories.$categoryId.sub-categories.tsx`)

## Roles (admin RBAC)

- UI: `/roles`, file route `routes/_authed.roles.tsx`; list + create/edit modal in `features/roles/roles-list-page.tsx` with `DataTable` + granular permission matrix from API.
- HTTP (paths are relative to the Axios `baseURL` in env): list `GET /admin/roles` (search, pagination); modules `GET /admin/roles/permissions`; detail `GET /admin/roles/{id}`; `POST /admin/roles`; `PATCH` / `DELETE /admin/roles/{id}`.
- Auth: JWT may include `role_id`; session `User.roleId` in `features/auth/auth.api.ts` mirrors it for UI-only guards (blocked delete for current role, protected rows, nonzero `adminCount`). Server remains authoritative (`403`/`409`).
- Guards: route uses `PERMISSIONS.roles.view`; mutations use `roles.create` | `update` | `delete` with `<Can>`.

## Admins (operator accounts)

- UI: `/admins`, file route `routes/_authed.admins.tsx`; list + create/edit modal in `features/admins/admins-list-page.tsx` with `DataTable`; role assignments use `GET /admin/roles` (picklist while the modal is open).
- HTTP (paths are relative to the Axios `baseURL` in env): list `GET /admin/admins` (`search`, `isActive`, pagination); detail `GET /admin/admins/{id}` (`getAdmin` in `admins.api.ts`, optional for detail routes or edit prefetch); `POST /admin/admins`; `PATCH /admin/admins/{id}`; `DELETE /admin/admins/{id}`; `PATCH /admin/admins/{id}/block`; `PATCH /admin/admins/{id}/unblock`.
- Auth: JWT includes `is_super_admin`; session `User.isSuperAdmin` in `features/auth/auth.api.ts` mirrors it for UI-only guards (no edit/delete/block/unblock for another super admin except where self-edit applies; no delete/block self). Server remains authoritative (`403`/`409`).
- Guards: route uses `PERMISSIONS.admins.view`; header create uses `<Can permission={PERMISSIONS.admins.create}>`. Row actions gate on `admins.update` (edit, block, unblock) and `admins.delete` (delete)—there are no separate JWT strings for block/unblock today.
- Forms: this modal passes `suppressInitialFocus` on `FormDialog` (`components/shared/form-dialog.tsx`) so opening does not auto-focus the first input (avoids one field showing an isolated focus ring); programmatic focus lands on the dialog title instead.

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

- Single emerald accent `#059669` — used sparingly: primary button, active nav, focus ring, positive deltas
- Warm stone neutrals for everything else — canvas `#F5F3F0`, card `#FFFFFF`, sidebar `#FAFAF8`
- Destructive is `#DC2626` — reserved for block/reject/delete only
- No blues, no purples, no secondary accents, no gradients
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
- Current namespaces: `common`, `components`, `shell`, `users`, `countries`, `categories`, `providers`, `roles`, `admins`
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