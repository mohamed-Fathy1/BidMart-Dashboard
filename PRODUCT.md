# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

BidMart's internal staff, signed in to the admin dashboard on a desktop, mostly working in Arabic.
Four groups use it daily, each with a role-scoped permission set:

- **Operations and moderation.** Approve, reject, verify, block and unblock sellers; ban, suspend
  and reactivate users; manage the catalog (categories, sub-categories, countries) and live-show
  settings.
- **Support.** Work complaints, support tickets and contact messages between buyers and sellers.
- **Finance.** Review settlements and withdrawals, adjust wallets, read the financial report and
  export it.
- **Management and owners.** Read Statistics and the reports to track platform health; they rarely
  take actions.

A super admin sees everything. Every other admin sees only what their role's permissions allow.

## Product Purpose

BidMart is a live-streaming commerce marketplace in Saudi Arabia: sellers run live shows and sell
through auctions, buy-now listings, accepted offers and giveaways. The mobile apps (buyers and
sellers) are built elsewhere; this repository is only the admin dashboard.

The dashboard is where staff run the marketplace: moderate who can sell, resolve disputes, move
money, keep reference data correct, and read how the platform is doing. Success means an admin
can clear their queue quickly and correctly, and never takes a harmful action by mistake.

## Positioning

The one operating console for a bilingual (Arabic and English) live-auction marketplace. It shows
the live marketplace as the backend reports it: live order drill-downs, the windows the server
actually used, and statuses translated from their enum values instead of server English.

## Operating Context

- Desktop first, at `lg` (1024px) and wider; phones are secondary but must stay usable (off-canvas
  sidebar below `lg`).
- Arabic (RTL) is the primary working language; English must be complete as well. Language is
  switchable in the topbar and persisted per browser.
- Money is Saudi riyal (SAR). Dates render in the Gregorian calendar in both languages; Arabic uses
  Arabic-Indic digits.
- Backend: a REST API under `/api/v1/admin/*` with bearer tokens. The server is authoritative for
  permissions (`403`), conflicts (`409`) and validation; the UI guards are convenience only.
- Admins jump between surfaces with the command palette (Cmd/Ctrl+K) and deep links; list state
  (filters, page, open sheet) lives in the URL so links and back/forward work.

## Capabilities and Constraints

- Surfaces: Statistics (general, business, financial tabs); Reports (financial, ratings, orders and
  sales, livestreams); users; providers (stores); complaints and complaint types; support tickets;
  notifications; wallets, withdrawals and settlements; catalog (categories, sub-categories);
  countries; roles and admins; system settings, content and live-show settings; profile.
- Role-based access: permission strings `admin:<resource>:<action>` from the JWT; `lib/permissions.ts`
  is the source of truth. Admins land on the first page they are allowed to open.
- Terminology is fixed in `CONTEXT.md` (counted sale, window, status bucket vs status group,
  snapshot metric, drill-down, and others). Copy and code use those words in those senses.
- House conventions, including the design system, live in `CLAUDE.md`.
- Undecided: whether Statistics should label registrations as "total registered users" (the ticket)
  or "new users" (what the API returns); the dashboard follows the API for now.

## Brand Commitments

- Name: BidMart. The logo mark and wordmark ship as `<BrandLogo />` and the favicon in `public/`.
- Voice for operator copy: dense, literal and declarative. It tells admins what a thing is and what
  an action does. No marketing adjectives, no exclamation points, no rhetorical questions.

## Evidence on Hand

- API contracts: `Admin_API_integration_S1.json` (OpenAPI), the Postman collections in the repo
  root, and the Sprint 8 reporting contracts in `~/Downloads/web/sprint-8/`.
- A deployed dev API (`VITE_API_URL` in `.env`) with real test data.
- No customer quotes, usage analytics or benchmark numbers exist. Do not invent them.

## Product Principles

1. **Fast, safe decisions.** Queues clear in few steps. Destructive actions (ban, reject, block,
   delete) are deliberate: confirmed, permission-gated, and never one stray click away.
2. **Arabic is the primary experience, not a translation.** Every screen is designed to work in
   RTL with Arabic-Indic digits first, and English must be just as complete.
3. **Show what the server decided.** Render the resolved window, the live detail and translated
   enums; never re-derive business rules or display server English.
4. **One word, one meaning.** A term from `CONTEXT.md` means the same thing on every screen, in
   both languages.
5. **Permissions shape the interface.** An admin sees and can reach only what their role allows,
   and never lands on a page they cannot use.
