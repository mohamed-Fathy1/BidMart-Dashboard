# Admin API — Live Show Max Duration

How the admin panel reads and updates the **maximum duration a live show may run** before the
backend auto-ends it. The value is **admin-only** — it is stored in its own table
(`live_show_settings`) and is **never** exposed to the mobile app (`GET /app-config`).

- Default: **120 minutes (2 hours)**
- A live show that exceeds this limit is **auto-ended** by the backend (Agora recording stopped,
  seller-live lock released). Changing the value applies to **newly started** shows immediately; a
  running show is re-evaluated against the new value when its scheduled check fires.

---

## Base URL & auth

| | |
|---|---|
| Base URL | `{{API_BASE}}/api/v1` |
| Auth | Admin Bearer JWT — `Authorization: Bearer <adminAccessToken>` |
| Get a token | `POST /api/v1/admin/auth/login` (email + password) → use the returned `accessToken` |
| Content-Type | `application/json` |

**Permissions** (checked against the admin's `permissions[]`; `is_super_admin` bypasses all):

| Endpoint | Required permission |
|---|---|
| `GET /admin/shows/settings` | `admin:shows:view` |
| `PATCH /admin/shows/settings` | `admin:shows:update` |

> All responses use the standard envelope: `{ "success": true, "data": { ... }, "meta": { "version": "1.0.0" } }`.

---

## Field reference

| Field | Type | Rules | Notes |
|---|---|---|---|
| `maxDurationMinutes` | integer | **5 – 1440** | Minutes a live show may run before auto-end. `120` = 2h, `1440` = 24h. |
| `updatedAt` | string (ISO 8601) | read-only | When the setting was last changed. |

---

## 1) Get current duration

```
GET /api/v1/admin/shows/settings
Authorization: Bearer <adminAccessToken>
```

**200 OK**
```json
{
  "success": true,
  "data": {
    "maxDurationMinutes": 120,
    "updatedAt": "2026-06-09T02:20:00.000Z"
  },
  "meta": { "version": "1.0.0" }
}
```

> On first ever read the row is created automatically with the default (120). You always get a value back.

---

## 2) Update the duration

```
PATCH /api/v1/admin/shows/settings
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

**Request body**
```json
{ "maxDurationMinutes": 90 }
```

**200 OK**
```json
{
  "success": true,
  "data": {
    "maxDurationMinutes": 90,
    "updatedAt": "2026-06-09T05:31:12.144Z"
  },
  "meta": { "version": "1.0.0" }
}
```

---

## Error responses

| HTTP | When | Body (`error.code` / message) |
|---|---|---|
| **400** | `maxDurationMinutes` missing, not an integer, or outside 5–1440 | Validation error — `message` lists the failing constraint |
| **401** | Missing / expired admin token | `Missing or expired admin token` |
| **403** | Admin lacks the required permission | `Insufficient permissions` |

**400 example**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "maxDurationMinutes must not be greater than 1440",
    "timestamp": "2026-06-09T05:31:12.144Z",
    "path": "/api/v1/admin/shows/settings"
  },
  "meta": { "version": "1.0.0" }
}
```

---

## cURL

```bash
# Read
curl -X GET "$API_BASE/api/v1/admin/shows/settings" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update to 90 minutes
curl -X PATCH "$API_BASE/api/v1/admin/shows/settings" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "maxDurationMinutes": 90 }'
```

## JavaScript (admin panel)

```ts
const API = `${import.meta.env.VITE_API_BASE}/api/v1`;

// Read
export async function getLiveShowDuration(token: string) {
  const res = await fetch(`${API}/admin/shows/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json.data.maxDurationMinutes as number; // e.g. 120
}

// Update
export async function setLiveShowDuration(token: string, minutes: number) {
  const res = await fetch(`${API}/admin/shows/settings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ maxDurationMinutes: minutes }),
  });
  if (!res.ok) throw new Error((await res.json()).error?.message ?? 'Update failed');
  return (await res.json()).data; // { maxDurationMinutes, updatedAt }
}
```

---

## UI integration checklist

1. On the settings screen load → `GET /admin/shows/settings`, prefill the input with `maxDurationMinutes`.
2. Input = integer **minutes**, clamp to **5–1440** client-side (server enforces the same range).
3. On save → `PATCH /admin/shows/settings` with `{ maxDurationMinutes }`, then show `updatedAt`.
4. Optional helper: show the value as hours (`minutes / 60`) next to the field — store still sends minutes.
5. Requires an admin with the `admin:shows:view` / `admin:shows:update` permission (or super admin).

> Swagger reference: tag **“Admin — Live Show Settings”** in `/api/docs`.
