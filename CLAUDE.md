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

## Context vs Zustand

- **Context**: dependency injection only (providers tree, i18n, permission gate)
- **Zustand**: shared mutable state (auth, UI, notifications)
- Do not put server-state in Zustand — use TanStack Query

## Styling Rules

- All tokens as CSS variables in `src/styles/tokens.css`, mapped via `@theme` in `src/styles/index.css`
- No arbitrary hex values — always reference token variables or Tailwind utilities
- No inline styles
- `cn()` from `lib/utils` for conditional classes
- Tailwind classes only — no custom CSS unless unavoidable

## RTL Rules

- Logical properties only: `ps-`*/`pe-*` (not `pl-*`/`pr-*`), `ms-*`/`me-*`, `text-start`/`text-end` (not `text-left`/`text-right`)
- `inset-inline-start`/`inset-inline-end` for positioning
- Directional icons flip in RTL via `rtl:rotate-180` or mirrored variants
- Never use `left`/`right` in utility classes

## i18n Rules

- No hardcoded strings in components, ever
- One namespace per feature (e.g., `users.json`), plus `common.json` and `shell.json`
- Use `t('namespace:key')` pattern
- Pluralization via i18next
- Locale persisted to localStorage, applied to `<html dir>` and `<html lang>` on change

## Table Rules

- Extend shared `DataTable` from `components/data-table/data-table.tsx`
- Server-side pagination by default
- Column defs colocated as `<feature>.columns.tsx`
- 48px row height, sticky header, hairline borders
- Empty state: one line of copy, one action, no illustration

## Permission Rules

- Every protected route declares `requiredPermissions` in route context
- Every mutation button wrapped in `<Can permission="...">` component
- Permission format: `resource.action` (e.g., `users.read`, `withdrawals.approve`)
- `PERMISSIONS` constant in `lib/permissions.ts` is the source of truth

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