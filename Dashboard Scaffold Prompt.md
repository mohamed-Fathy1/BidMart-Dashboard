# Dashboard Scaffold — Kickoff Prompt

You are scaffolding the frontend for a KSA marketplace admin dashboard (live-streaming commerce, Arabic/English, role-based). **This prompt produces scaffolding only** — no feature components, no mock pages beyond a proof-of-shell route. Each subsequent prompt builds one feature at a time.

---

## 0. Read skills first (non-negotiable)

Before writing any code, `view`:

1. `/mnt/skills/public/frontend-design/SKILL.md` — design tokens, typography, component patterns. Do not invent a palette or guess Tailwind classes; load this and follow it.
2. `/mnt/skills/examples/skill-creator/SKILL.md` — only to shape how `CLAUDE.md` reads as a conventions doc.

Read silently, then proceed.

---

## 1. Stack (locked)

- **Build**: Vite + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`, no JS config unless a plugin forces it)
- **Routing**: TanStack Router (file-based, typed, with route context carrying required permissions)
- **Data**: TanStack Query v5 + Axios (single shared client, interceptors)
- **Client state**: Zustand for cross-feature state (auth, UI, notifications). Context for scoped dependency injection only (providers tree, i18n, permission gate).
- **UI**: shadcn/ui primitives + TanStack Table v8 wrapped by a shared `DataTable`. shadcn charts (Recharts under the hood) for analytics.
- **Forms**: react-hook-form + zod
- **i18n**: i18next + react-i18next, Arabic + English, RTL-aware
- **Rich text**: tiptap (for Terms, Privacy, About Us)
- **File upload**: Admin S3 presign via **`src/lib/upload.ts`** (**`POST /admin/files/upload`** → browser **PUT** → **`mediaUrl`**) and **`src/components/shared/image-upload-field.tsx`**. Optional **react-dropzone** only if you add a richer dropzone wrapper later.
- **Date picker**: react-day-picker via shadcn
- **Export**: `xlsx` + `jspdf` + `jspdf-autotable`
- **Icons**: lucide-react
- **Toaster**: sonner

No dark mode. Light only. Tokens defined as CSS variables so dark mode can be added later without a rewrite.

---

## 2. Design direction

Modern admin aesthetic, financial/trustworthy feel.

- **Neutral base**: warm-tinted zinc. Off-white canvas `#FAFAF9`, cards pure white, hairline borders `#E7E5E4`.
- **Accent**: emerald `#059669`. Used sparingly — primary actions, active nav, positive deltas. Never decorative.
- **Destructive**: red-600 `#DC2626`, for block/reject/delete only.
- **Typography**:
  - Latin: Inter (UI), JetBrains Mono (numeric/code)
  - Arabic: IBM Plex Sans Arabic (UI), same mono for numbers
  - Swap per `:lang(ar)` in CSS, both font families loaded
  - Tight tracking on headings, generous line-height on body
  - `tabular-nums` on every financial column
- **Radius**: 8px default, 12px cards, 6px inputs/buttons
- **Shadows**: borders over shadows. One soft shadow reserved for overlays (popover, dialog, dropdown).
- **Motion**: 150ms ease-out for hovers, 200ms for layout shifts. No springs, no bounces.
- **Table density**: 48px rows (financial report has 10+ columns — density matters).

**Anti-slop rules** (enforced in `CLAUDE.md` and the scaffold itself):

- No gradients on buttons or cards
- No emoji in UI chrome
- No glass-morphism / backdrop blur panels
- No centered-hero-with-three-feature-cards layouts
- Numeric data is mono + tabular-nums, always
- Empty states: one line of copy, one action, no illustration
- Never `text-left`/`text-right` — use `text-start`/`text-end`
- Never `pl-*`/`pr-*` — use `ps-*`/`pe-*`
- Directional icons flip in RTL via `rtl:rotate-180` or mirrored variants

Define all tokens as CSS variables in `src/styles/tokens.css` and map them via Tailwind v4 `@theme` in `src/styles/index.css`.

---

## 3. Folder structure (flat, feature-first)

```
src/
  app/
    router.tsx
    providers.tsx         # QueryClient, Toaster, Auth, i18n, Router
    root.tsx
  routes/
    __root.tsx            # shell: sidebar + topbar
    index.tsx             # redirects to /overview or /login
    login.tsx
    forgot-password.tsx   # email → OTP + reset password (wired to Admin Auth API)
    _authed.tsx           # protected layout + permission enforcement
    _authed.overview.tsx  # proof-of-shell landing
  features/
    auth/ users/ moderators/ roles/ admins/ providers/ withdrawals/
    orders/ complaints/ ratings/ live-streams/ content/
    categories/ settings/ notifications/ profile/
  components/
    ui/                   # shadcn primitives
    layout/               # sidebar, topbar, shell, lang-switcher
    data-table/           # shared TanStack Table + shadcn wrapper
    permissions/          # <Can />
    rich-text/            # tiptap wrapper (stub)
    shared/               # cross-feature widgets (e.g. image-upload-field → lib/upload.ts)
  lib/
    axios.ts query-client.ts cn.ts env.ts
    format.ts             # currency (SAR), date, number — locale-aware
    export.ts             # xlsx + pdf helpers
    permissions.ts        # PERMISSIONS + usePermission + can
    i18n.ts
  locales/
    ar/common.json ar/shell.json
    en/common.json en/shell.json
  types/
    api.ts                # response envelopes, pagination shape
CLAUDE.md
components.json
```

**Categories** (`features/categories/`): layout route with section tabs + **`/categories/sub-categories`** hub (optional **`?parent=`**) + nested **`/categories/$categoryId/sub-categories`** drill-down; **`TableFiltersShell`**, server pagination, and API envelopes — see root **`CLAUDE.md`** — **Categories (product taxonomy)**.

Rules (baked into `CLAUDE.md`):

- **Named exports only.** Default exports only where TanStack Router file-route convention requires.
- **Flat within features.** No nested `components/`/`hooks/`/`utils/` inside a feature.
- **Colocate.** `<feature>.api.ts`, `<feature>.queries.ts`, `<feature>.store.ts`, `<feature>.columns.tsx`, `<feature>.schema.ts` live in the feature folder.
- **No barrel files** unless they remove real friction. Banned by default.
- **Comments only where intent isn't obvious.**

---

## 4. Axios + React Query wiring

`src/lib/axios.ts`:

- Single `api` instance, `baseURL` from `env.VITE_API_URL` (must match deployment, e.g. include `/api/v1` segment if your gateway serves that prefix once)
- Request interceptor: attach bearer from persisted Zustand token in **`localStorage`** (**`bidmart-auth`** persistence shape); attach `Accept-Language` from `i18n.language`
- Response interceptor: **`401`** → remove **`bidmart-auth`** + redirect **`/login`**, **except** for **`POST`** **`/admin/auth/login`**, **`/admin/auth/forgot-password`**, **`/admin/auth/forgot-password/resend`**, and **`/admin/auth/reset-password`** (so wrong credentials / validation errors stay on-page). **`403`** → generic permission toast + reject, **except** those same URLs (disabled-admin auth flows use API body messaging). Errors reject with **`{ message, status }`** (nested **`response.data.message`** / **`response.data.data.message`** extracted when present via **`extractApiErrorMessage`**)
- Export `apiRequest<T>(config): Promise<T>` that returns `axios` **`response.data`**

`src/lib/query-client.ts`:

- `staleTime: 30_000`, `gcTime: 5 * 60_000`, `retry: 1`, `refetchOnWindowFocus: false`
- Mutation default `onError` → sonner toast with normalized error message
- One health-check query proves the client. No other example queries.

---

## 5. Auth + permissions

`features/auth/auth.store.ts` (Zustand + persist):
`{ user, token, permissions: string[], status, setSession, clearSession }`. Persist **token** only (**`bidmart-auth`** key). **`loginRequest`** decodes the JWT once for an initial **`user`**. **`useMeQuery`** / **`getMeRequest`** validate JWT **`exp`**, call **`GET /admin/profile`**, and merge: **`permissions[]`** and JWT **`role`** (slug) from the token; **`fullName`**, **`email`**, **`phone`**, **`role.id`**, role labels, **`isSuperAdmin`** from the API. **`PATCH /admin/profile`** updates editable fields (**`useUpdateAdminProfileMutation`**). See root **`CLAUDE.md`** — Admin — Auth.

`_authed.tsx` layout:
- No token → redirect `/login`
- Token, no user → fire `useMeQuery`, render skeleton shell (not spinner), then `<Outlet />`
- Each route component guards via `usePermission()` hook, renders `<PermissionDenied />` on failure

`lib/permissions.ts`:

```ts
export const PERMISSIONS = {
  users:         { view: 'admin:users:view', ban: 'admin:users:ban', unban: 'admin:users:unban', suspend: 'admin:users:suspend', activate: 'admin:users:activate', delete: 'admin:users:delete' },
  providers:     { view: 'admin:providers:view', approve: 'admin:providers:approve', reject: 'admin:providers:reject', verify: 'admin:providers:verify', block: 'admin:providers:block', unblock: 'admin:providers:unblock' },
  countries:     { view: 'admin:countries:view', create: 'admin:countries:create', update: 'admin:countries:update', delete: 'admin:countries:delete' },
  categories:    { view: 'admin:categories:view', create: 'admin:categories:create', update: 'admin:categories:update', delete: 'admin:categories:delete' },
  subCategories: { view: 'admin:sub-categories:view', create: 'admin:sub-categories:create', update: 'admin:sub-categories:update', delete: 'admin:sub-categories:delete' },
  roles:         { view: 'admin:roles:view', create: 'admin:roles:create', update: 'admin:roles:update', delete: 'admin:roles:delete' },
  admins:        { view: 'admin:admins:view', create: 'admin:admins:create', update: 'admin:admins:update', delete: 'admin:admins:delete' },
} as const;
```

Export `usePermission(p: Permission)` hook and `<Can permission="..." fallback={null}>` component, both reading from `auth.store`.

`login.tsx`: real form (**email**, **password**, **remember-me** via **`react-hook-form` `Controller` + `Checkbox`**), **`useLoginMutation`** → **`POST /admin/auth/login`** with **`deviceId: "admin-panel"`**. Validates password length **8–20** client-side before submit.
`forgot-password.tsx`: request OTP (**`POST /admin/auth/forgot-password`**), optional resend, reset (**`POST /admin/auth/reset-password`**); client validation mirrors API OTP + password rules (see **`CLAUDE.md` — Admin — Auth**).

---

## 6. i18n + RTL

`lib/i18n.ts`: init i18next with `ar` + `en`, default `ar`, fallback `en`. Persist selection to localStorage. On language change, set `<html dir>` and `<html lang>`.

Namespaces:
- `common.json` — buttons (save, cancel, confirm), states (loading, empty, error), common labels
- `components.json` — shared component strings (image upload, data table, etc.)
- `shell.json` — sidebar nav labels, topbar labels, user menu
- Feature namespaces: `users.json`, `countries.json`, `categories.json`, `providers.json`, `roles.json`, `admins.json`, `profile.json` (authenticated `/profile` screen)

Each feature owns its own namespace. **No hardcoded strings in components, ever.**

`lang-switcher.tsx` in the topbar flips language + direction live.

---

## 7. Shell layout

`components/layout/shell.tsx` composes `<Sidebar />` + `<Topbar />` + `<main>`.

- **Sidebar**: fixed inline-start (respects RTL), 260px expanded / 64px collapsed, collapse state in `ui.store.ts` (Zustand, persisted). Nav items data-driven from `nav-items.ts`, each `{ label, icon, to, permission }`. Items hidden if permission fails. Active state via `useMatchRoute`.
- **Topbar**: 56px, hairline bottom border. Breadcrumb slot (start), then language switcher, notifications bell (stub — real feature folder, empty popover), user menu with **My profile** → **`/profile`** and sign-out (initials derived from **`lib/utils`** **`accountInitials`** when session is hydrated).
- **Main**: max-width container with token-based padding. Scroll lives on `<main>`.

---

## 8. Shared DataTable

`components/data-table/data-table.tsx` — one wrapper used by every table feature:

- Props: `columns`, `data`, `pagination` (server-side default), `sorting`, `filters`, `rowSelection`
- Built on TanStack Table v8 + shadcn `Table` + shadcn `Pagination`
- Sticky header, 48px rows, zebra off, hairline row borders
- Empty state and loading skeleton built in
- Toolbar slot above (for search, filters, export button)
- `onExport?: (rows, format: 'xlsx' | 'pdf') => void`

Mount it once in the proof-of-shell with zero columns/rows to prove it works.

---

## 9. Primitives to install now

shadcn add (exactly these):

```
button input label textarea select checkbox radio-group switch
card dialog alert-dialog dropdown-menu popover tooltip
sheet tabs skeleton separator avatar badge
form sonner table pagination command
breadcrumb scroll-area
```

Wire `<Toaster />` in `providers.tsx`: position `top-end` (RTL-aware), rich colors off, close button on.

---

## 10. Formatting helpers

`lib/format.ts`:

```ts
format.currency(value, { currency: 'SAR' })  // Intl.NumberFormat, locale-aware
format.number(value)
format.percent(value)
format.date(iso)
format.dateTime(iso)
format.dateRange(from, to)
```

All read current locale from i18next. Never render raw numbers or ISO dates in components.

`lib/export.ts`: `exportToXlsx(rows, columns, filename)` and `exportToPdf(rows, columns, filename, { title, meta })`. Both respect locale (Arabic PDF uses a bundled Arabic font).

---

## 11. CLAUDE.md

At repo root, in this order:

1. **Stack** — one-line why for each choice
2. **Folder conventions** — flat feature-first, colocated files, no barrels
3. **Context vs Zustand** — Context for DI (providers, gates), Zustand for shared mutable state (auth, UI, notifications)
4. **Styling rules** — tokens only, no arbitrary hex, no inline styles, `cn()` for conditionals
5. **RTL rules** — logical properties only, flip directional icons, never left/right in code
6. **i18n rules** — no hardcoded strings, one namespace per feature, pluralization via i18next
7. **Table rules** — extend shared `DataTable`, server-side pagination default, column defs colocated as `<feature>.columns.tsx`
8. **Permission rules** — every protected route declares `requiredPermissions` in route context; every mutation button wrapped in `<Can>`
9. **Formatting rules** — never raw numbers/dates, always through `lib/format.ts`
10. **Component authoring checklist** — named export, props as `interface`, no `React.FC`, no default exports, no unnecessary `useMemo`/`useCallback`
11. **Anti-slop rules** — from §2
12. **Skill triggers** — "When creating any component or screen, read `/mnt/skills/public/frontend-design/SKILL.md` first."
13. **Commit style** — conventional commits, imperative, no co-author footers

Tight bullets. No prose essays.

The authoritative root `CLAUDE.md` may add short **feature anchors** when useful (currently includes **Auth / profile**, **Roles**, **Admins**, **Users**, **Providers**, and **Categories**: API paths relative to Axios `baseURL`, response unwrapping, permission guards, and—where relevant—session fields such as `User.roleId` / `User.isSuperAdmin` plus `suppressInitialFocus` on `FormDialog` for admins modals).

---

## 12. Proof of shell

`/overview` (under `_authed`) renders:
- Topbar with breadcrumb "Overview", working language switcher, bell stub, user menu stub
- Sidebar with 3 placeholder nav items (Overview, Users, Settings) — real nav comes feature-by-feature
- Main area: one `<h1>`, one muted sentence, one empty `DataTable` (headers only, "No data" state), one `<Can permission="admin:users:view">` gate wrapping a dummy button, and a debug strip showing `format.currency(1234.5)` + `format.dateTime(new Date())` in both locales

Toggling the language switcher must flip direction, font family, and formatter output live.

Run `pnpm dev`, confirm:
- TypeScript passes with zero errors
- Shell renders in both `ar` and `en`
- `/` with no token redirects to `/login`
- Route context permission check renders 403 panel when required permission is missing
- Toaster fires from a dev-only test button
- Tailwind tokens resolve (inspect one element)

Leave the debug strip and dev-only test button in place — the first feature prompt will strip them.

---

## 13. Non-goals for this prompt

- No feature pages (users list, withdrawal table, reports, etc.)
- No mock data
- No Storybook, no tests, no CI
- No dark mode tokens
- No real notifications logic

Each becomes its own prompt.

---

## 14. Deliverable

A running scaffold. Output at the end:

- Tree of what was created (top 2 levels)
- Exact install + run commands
- Short "Assumptions" list for any decisions not specified above

Do not recap this prompt. Do not suggest next features.
