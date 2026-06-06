# Admin Notifications — Complete Reference

Everything related to **admin-facing notifications** in BidMart: the server-side dispatch API, REST endpoints, every event that notifies an admin, the real-time WebSocket events an admin receives, the database schema, and known gaps.

Admins live in the **`admins` table**, completely separate from `users`. A notification row targets an admin via `admin_id` (with `user_id = NULL`), enforced by an XOR constraint. See `docs/admin.md` for the admin entity and `docs/notifications.md` for the user-facing side.

---

## 1. Architecture & Delivery Pipeline

Admin notifications follow the exact same fire-and-forget pipeline as user notifications:

```
caller service ──> NotificationsService.notifyAdmins*()   (sync, returns void)
                        │
                        ▼
                 resolve admin rows + fcm_tokens (DB)
                        │
                        ▼
                 BullMQ queue "push"  (job: "send-push")
                        │
                        ▼
                 PushProcessor (concurrency = 10)
                   ├─ 1. INSERT into `notifications` (admin_id set)   ← always, if saveToDb
                   └─ 2. FCM push to admin device tokens               ← best-effort, non-fatal
```

Key files:

| Concern | File |
|---|---|
| Dispatch API + DB queries | `src/modules/notifications/notifications.service.ts` |
| Worker (DB insert + FCM) | `src/modules/notifications/processors/push.processor.ts` |
| Job payload shape | `src/modules/notifications/interfaces/push-job.interface.ts` |
| Titles per type (bilingual) | `src/modules/notifications/constants/notification.constants.ts` |
| Reusable bodies (bilingual) | `src/modules/notifications/constants/notification-messages.ts` |
| Notification entity | `src/modules/notifications/entities/notification.entity.ts` |
| Admin REST controller | `src/modules/notifications/admin-notifications.controller.ts` |

**Delivery rules**

- Persist first, push second. The DB row is written before the FCM call so a record exists even if push delivery fails.
- Push is **best-effort**: FCM failures are logged but never fail the job (prevents retries that would duplicate DB rows).
- Job retries are driven **only by DB-write failures**.
- An admin with no `fcm_token` still gets the DB row — they just receive no push.
- Default push language is `'ar'` (`payload.lang ?? 'ar'`).
- There is **no in-app WebSocket fan-out** for generic notifications (no `online:users`-style socket delivery for admins). Admin real-time updates exist only inside the complaint-chat namespace — see §6.

---

## 2. Server-Side Dispatch API

All methods are declared on `NotificationsService`, are **fire-and-forget (`void`)**, and never throw to the caller (errors are caught and logged internally).

```typescript
constructor(private readonly notificationsService: NotificationsService) {}

// Target specific admins by id
notifyOneAdmin(adminId: string, payload: NotificationPayload): void
notifyManyAdmins(adminIds: string[], payload: NotificationPayload): void

// Target all active admins in a role
notifyAdminsByRole(roleId: string, payload: NotificationPayload): void

// Target all active admins holding a permission (super admins always included)
notifyAdminsByPermission(permission: AdminPermission, payload: NotificationPayload): void
```

### Recipient resolution

| Method | Query (TypeORM) | Filter |
|---|---|---|
| `notifyOneAdmin` / `notifyManyAdmins` | `adminRepo.find({ where: { id: In(ids) } })` | by id only |
| `notifyAdminsByRole` | `adminRepo.find({ where: { role_id, is_active: true } })` | active + role |
| `notifyAdminsByPermission` | QueryBuilder `innerJoin admin.role` + `is_active = true AND (is_super_admin = true OR :permission = ANY(role.permissions))` | active + (super admin OR permission) |

> `notifyAdminsByPermission` is the method used in production. `notifyAdminsByRole`, `notifyOneAdmin`, and `notifyManyAdmins` exist and are tested but are **not called anywhere in the codebase yet**.

### `NotificationPayload`

```typescript
interface NotificationPayload {
  type: NotificationType;               // drives the bilingual title (NOTIFICATION_TITLES)
  bodyEn: string;                       // push body — English
  bodyAr: string;                       // push body — Arabic
  imageUrl?: string;
  metadata?: Record<string, unknown>;   // extra data sent to device + used to resolve action_id
  saveToDb?: boolean;                   // default true
  lang?: 'ar' | 'en';                   // default 'ar' — language chosen for the FCM push body
}
```

The `type` is mapped to a bilingual title in `NOTIFICATION_TITLES`. TypeScript fails to compile if a `NotificationType` has no title entry.

---

## 3. Admin REST Endpoints

Base controller: `admin-notifications.controller.ts` — `@Controller('admin/notifications')`, guarded by `AdminGuard` + `PermissionGuard`. (The class is annotated `@Public()` to bypass the global **user** JWT guard; admin authentication is handled by `AdminGuard`.)

### The notification bell (admin's own notifications)

These three endpoints back the admin dashboard's notification bell. They read the admin's **own**
notifications (`admin_id = me`) — any valid admin token works, **no special permission** required.

| # | Method | Route | Status | Service | Description |
|---|---|---|---|---|---|
| 1 | GET | `/admin/notifications` | 200 | `listForAdmin` | Paginated list, newest first. Infinite scroll via `page`/`limit`. |
| 2 | GET | `/admin/notifications/unread-count` | 200 | `countUnreadForAdmin` | Bell badge count. |
| 3 | PATCH | `/admin/notifications/:id/read` | 200 | `markReadForAdmin` | Mark one as read. |

#### 1. `GET /admin/notifications` · 200

Query (`NotificationQueryDto`): `page` (default 1, min 1), `limit` (default 20, min 1, max 100),
optional `type` (a `NotificationType` filter).

Response — paginated, **dual-language** (does **not** use `Accept-Language`):

```jsonc
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "NEW_COMPLAINT",
      "title_en": "New Complaint",
      "title_ar": "شكوى جديدة",
      "body_en": "New complaint submitted by a user.",
      "body_ar": "تم تقديم شكوى جديدة من مستخدم.",
      "is_read": false,
      "action_type": "COMPLAINT",      // NotificationActionType | null
      "action_id": "complaint-uuid",   // string | null — per-type mapping in §8
      "created_at": "2026-06-06T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false }
}
```

> **Infinite scroll:** start at `page=1`; load the next page while `meta.hasNextPage === true`.

#### 2. `GET /admin/notifications/unread-count` · 200

```jsonc
{ "success": true, "data": { "count": 5 } }
```

#### 3. `PATCH /admin/notifications/:id/read` · 200

No body. `id` must be a UUID belonging to the current admin.

```jsonc
{ "success": true, "data": { "read": true } }
```

Errors: `400` (`Invalid notification id`) if the notification doesn't exist or isn't the admin's;
`401` missing/expired admin token.

> There is intentionally **no** `read-all` endpoint for admins (only the per-id mark-read above).

### Other admin endpoint

| Method | Route | Permission | Status | Description |
|---|---|---|---|---|
| POST | `/admin/notifications/test-broadcast` | `BROADCAST_NOTIFICATION` | 200 | Queue a test `GENERAL` push to **every** registered user (batched 500/page). Verifies FCM tokens work. Returns `{ queued: true, message }` immediately. |

---

## 4. Admin Notification Events (every trigger that notifies an admin)

Every place in the codebase that pushes a notification to admins. All use `notifyAdminsByPermission`, so recipients = active admins holding the listed permission **plus all super admins**.

| # | Trigger | Source | Permission | `NotificationType` | Title (en / ar) | Body source | Metadata |
|---|---|---|---|---|---|---|---|
| 1 | Buyer registers as a seller | `auth.service.ts` (`registerSeller`) | `APPROVE_PROVIDER` | `NEW_SELLER_APPLICATION` | New Seller Application / طلب بائع جديد | `NOTIFICATION_MESSAGES.sellerRegistration(username)` | `{ storeId }` |
| 2 | Existing user submits seller upgrade | `seller.service.ts` (apply) | `APPROVE_PROVIDER` | `NEW_SELLER_APPLICATION` | New Seller Application / طلب بائع جديد | `NOTIFICATION_MESSAGES.sellerUpgrade` | `{ storeId }` |
| 3 | Seller updates store → back to PENDING | `seller.service.ts` (update store) | `APPROVE_PROVIDER` | `NEW_SELLER_APPLICATION` | New Seller Application / طلب بائع جديد | `NOTIFICATION_MESSAGES.storeUpdatedPendingReview` | `{ storeId }` |
| 4 | Seller submits store verification request | `seller.service.ts` (request verification) | `VERIFY_PROVIDER` | `VERIFICATION_REQUESTED` | Verification Request / طلب تحقق | `NOTIFICATION_MESSAGES.verificationRequested` | `{ storeId }` |
| 5 | User deletes account (phone/password flow) | `auth.service.ts` (`deleteAccount`) | `DELETE_USER` | `ACCOUNT_DELETION_REQUESTED` | Account Deletion Request / طلب حذف حساب | `NOTIFICATION_MESSAGES.accountDeletionRequested(username)` | `{ userId }` |
| 6 | User deletes account (Google/Apple OTP flow) | `auth.service.ts` (`deleteAccountWithOtp`) | `DELETE_USER` | `ACCOUNT_DELETION_REQUESTED` | Account Deletion Request / طلب حذف حساب | `NOTIFICATION_MESSAGES.accountDeletionRequested(username)` | `{ userId }` |
| 7 | Seller submits a wallet settlement request | `wallet.service.ts` (`submitSettlement`) | `APPROVE_WITHDRAWAL` | `SETTLEMENT_REQUESTED` | Settlement Request / طلب تسوية | `NOTIFICATION_MESSAGES.settlementRequested` | `{ settlementId }` |
| 8 | New contact-us message received | `contact-us.service.ts` | `VIEW_CONTACT_MESSAGES` | `CONTACT_MESSAGE_RECEIVED` | New Contact Message / رسالة تواصل جديدة | `NOTIFICATION_MESSAGES.contactMessageReceived(name, type)` | `{ contactMessageId }` |
| 9 | New complaint submitted | `complaints.service.ts` (create) | `VIEW_COMPLAINTS` | `NEW_COMPLAINT` | New Complaint / شكوى جديدة | inline: "New complaint submitted by a user." | `{ complaintId }` |
| 10 | User replies on a complaint thread | `complaints.service.ts` (`saveComplaintMessage`) | `VIEW_COMPLAINTS` | `COMPLAINT_MESSAGE` | New Message / رسالة جديدة بخصوص شكواك | inline: "A user sent a new reply on a complaint." | `{ complaintId }` |

> Event 10 fires only when the message sender is the **user** (admin-sent messages instead notify the user, and only if that user is offline).

### Bodies (bilingual, from `notification-messages.ts`)

| Key | English | Arabic |
|---|---|---|
| `sellerRegistration(username)` | A new seller registration has been submitted by `{username}`. Please review the application. | تم تقديم طلب تسجيل بائع جديد من قِبَل `{username}`. يرجى مراجعة الطلب. |
| `sellerUpgrade` | A user has submitted a seller upgrade request. Please review the application. | قدّم مستخدم طلب ترقية إلى حساب بائع. يرجى مراجعة الطلب. |
| `storeUpdatedPendingReview` | A seller has updated their store information and their account is now pending review. | قام بائع بتحديث معلومات متجره وحسابه قيد المراجعة الآن. |
| `verificationRequested` | A seller has submitted a verification request. Please review their commercial registration. | قدّم بائع طلب تحقق. يرجى مراجعة سجله التجاري. |
| `accountDeletionRequested(username)` | User `{username}` has requested to delete their account. | طلب المستخدم `{username}` حذف حسابه. |
| `settlementRequested` | A seller has submitted a settlement request. Please review and process it. | قدّم بائع طلب تسوية. يرجى مراجعته ومعالجته. |
| `contactMessageReceived(name, type)` | New `{type}` message received from `{name}`. | تم استلام رسالة `{type}` جديدة من `{name}`. |

---

## 5. Permissions Reference (admin-notification related)

`AdminPermission` (`src/common/enums/admin-permission.enum.ts`). A permission check passes if the admin holds the permission **or** `is_super_admin = true`.

| Permission | Key | Used for |
|---|---|---|
| `BROADCAST_NOTIFICATION` | `admin:notifications:broadcast` | `POST /admin/notifications/test-broadcast` |
| `APPROVE_PROVIDER` | — | Seller application / upgrade / re-review notifications |
| `VERIFY_PROVIDER` | — | Store verification request notifications |
| `DELETE_USER` | — | Account deletion request notifications |
| `APPROVE_WITHDRAWAL` | — | Settlement request notifications |
| `VIEW_CONTACT_MESSAGES` | — | Contact-us message notifications |
| `VIEW_COMPLAINTS` | — | New complaint + complaint reply notifications |

> There is **no** `MANAGE_NOTIFICATIONS` permission in the enum, despite an older doc referencing it (see §7).

---

## 6. Admin Real-Time WebSocket Events

Generic notifications are **not** pushed over WebSocket. The only real-time channel an admin participates in is the **complaint chat** namespace.

**Namespace:** `/complaint-chat` — `src/modules/complaints/complaint.gateway.ts`

**Auth (handshake):** `socket.handshake.auth.token`. The gateway verifies the **admin JWT first**; an admin connects only if `is_super_admin` or holds `VIEW_COMPLAINTS`, otherwise `FORBIDDEN`.

**Rooms:** on connect, every admin auto-joins the shared **`admin-complaints`** room. (Users join per-conversation `complaint:<id>` rooms instead.)

### Server → Admin events (received in `admin-complaints`)

| Event | Emitted from | Payload | Meaning |
|---|---|---|---|
| `complaint:message:new` | `complaint.gateway.ts` | saved message object | A new message was posted on any complaint |
| `complaint:typing:start` | `complaint.gateway.ts` | `{ complaintId, actorId, actorType }` | Someone started typing |
| `complaint:typing:stop` | `complaint.gateway.ts` | `{ complaintId, actorId, actorType }` | Someone stopped typing |
| `complaint:updated` | `complaints.service.ts` | `{ ...complaintUpdatedBase, isMe }` | Complaint thread changed (new activity) |
| `complaint:message:status` | `complaints.service.ts` | status payload | Message delivery/read status changed |
| `complaint:messages:read` | `complaints.service.ts` | read payload | Messages were marked read |
| `complaint:status:updated` | `complaints-admin.service.ts` | `{ complaintId, status: IN_PROGRESS }` | An admin moved a complaint to in-progress |
| `complaint:conversation:closed` | `complaints-admin.service.ts` | `{ complaintId }` | Conversation was closed |
| `complaint:closed` | `complaints-admin.service.ts` | `{ complaintId, status }` | Complaint was closed/resolved |

### Admin → Server events (admin can emit)

| Event | Payload | Effect |
|---|---|---|
| `complaint:message:send` | `{ complaintId, messageType?, message?, fileUrl? }` | Persists a message, fans out `complaint:message:new` to the `complaint:<id>` room + `admin-complaints`. Rate-limited 20/min. |
| `complaint:message:read` | `{ complaintId }` | Marks the complaint read for the admin side (`markComplaintAdminRead`). Rate-limited 10/min. |
| `complaint:typing:start` | `{ complaintId }` | Broadcasts typing indicator |
| `complaint:typing:stop` | `{ complaintId }` | Broadcasts typing indicator |

> Note: when an admin sends a complaint reply, the user is notified by **push** (`COMPLAINT_MESSAGE`) only if they are offline — see `complaints.service.ts` presence check.

---

## 7. Database Schema (admin notifications)

Table `notifications` (`notification.entity.ts`):

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid, nullable, FK → users (CASCADE) | NULL for admin notifications |
| `admin_id` | uuid, nullable, FK → admins (CASCADE) | Set for admin notifications |
| `type` | enum `NotificationType` | |
| `title_en`, `title_ar` | varchar(255) | from `NOTIFICATION_TITLES[type]` |
| `body_en`, `body_ar` | text | |
| `image_url` | varchar(500), nullable | |
| `metadata` | jsonb, nullable | drives `action_id` resolution |
| `is_read` | boolean, default false | |
| `created_at` | timestamptz | |

Indexes: `idx_notification_admin_read` (`admin_id`), `idx_notification_read` (`is_read`).
Constraint: exactly one of `user_id` / `admin_id` must be set (XOR).

### How `action_type` / `action_id` resolve (admin list)

`listForAdmin` runs each row through `enrichWithAction`, which looks up `NOTIFICATION_ACTION_MAP[type]`:
- `action_type` = the mapped `NotificationActionType` (or `null`).
- `action_id` = `metadata[mapping.actionIdKey]` (or `null`).

---

## 8. Known Gaps & Inconsistencies

1. ~~**Admin notification feed is not exposed.**~~ ✅ **Resolved.** `GET /admin/notifications`, `GET /admin/notifications/unread-count`, and `PATCH /admin/notifications/:id/read` are now wired in `admin-notifications.controller.ts` (see §3).

2. ~~**`docs/notifications.md` is out of sync.**~~ ✅ **Resolved.** Its admin table now matches the real endpoints. (`MANAGE_NOTIFICATIONS` was never a defined permission; `BROADCAST_NOTIFICATION` is the only notification permission.)

3. ~~**`action_id` mismatches on several admin notifications.**~~ ✅ **Resolved.** Emitter metadata keys and `NOTIFICATION_ACTION_MAP` are now aligned, and two new action types (`USER`, `SUPPORT`) were added. Every admin notification now resolves `action_type` + `action_id` to a real deep-link target:

   | Type | `action_type` | `action_id` key | Admin opens |
   |---|---|---|---|
   | `NEW_SELLER_APPLICATION` | `SELLER` | `storeId` | `GET /admin/providers/:storeId` |
   | `VERIFICATION_REQUESTED` | `SELLER` | `storeId` | `GET /admin/providers/:storeId` |
   | `SETTLEMENT_REQUESTED` | `SETTLEMENT` | `settlementId` | `GET /admin/settlements/:id` |
   | `CONTACT_MESSAGE_RECEIVED` | `SUPPORT` | `contactMessageId` | `GET /admin/support-tickets/:id` |
   | `ACCOUNT_DELETION_REQUESTED` | `USER` | `userId` | `GET /admin/users/:userId` |
   | `NEW_COMPLAINT` | `COMPLAINT` | `complaintId` | complaint detail |
   | `COMPLAINT_MESSAGE` | `COMPLAINT` | `complaintId` | complaint detail |

   > Implementation note: `NEW_SELLER_APPLICATION` now carries `storeId` — the registration/upgrade transactions were updated to return the created store's id.

4. **No WebSocket fan-out for generic admin notifications.** Admin notifications are DB + FCM only. Real-time admin updates exist solely within `/complaint-chat`.

---

## 9. Quick Reference

```typescript
// Notify all admins who can approve sellers (+ super admins)
this.notificationsService.notifyAdminsByPermission(AdminPermission.APPROVE_PROVIDER, {
  type: NotificationType.NEW_SELLER_APPLICATION,
  ...NOTIFICATION_MESSAGES.sellerRegistration(username),
  metadata: { userId },
});

// Notify a single admin
this.notificationsService.notifyOneAdmin(adminId, {
  type: NotificationType.GENERAL,
  bodyEn: 'Heads up.',
  bodyAr: 'تنبيه.',
});
```

**Adding a new admin notification:**
1. Add the `NotificationType` (+ bilingual title in `NOTIFICATION_TITLES`).
2. (Optional) Add a reusable body to `notification-messages.ts`.
3. (Optional, for navigation) Add a `NOTIFICATION_ACTION_MAP` entry and pass matching `metadata[actionIdKey]`.
4. Call the right `notifyAdmins*` method from your service.
