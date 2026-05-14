export const COMPLAINT_CHAT_DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BidMart Complaint Chat API — Developer Reference</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sidebar-bg: #1e2130;
      --sidebar-width: 260px;
      --bg: #ffffff;
      --surface: #f6f8fa;
      --border: #d0d7de;
      --text: #1f2328;
      --sub: #656d76;
      --code-bg: #0d1117;
      --code-text: #e6edf3;
      --green: #1a7f37;
      --green-bg: #dafbe1;
      --blue: #0969da;
      --blue-bg: #dbeafe;
      --amber: #9a6700;
      --amber-bg: #fef3c7;
      --red: #cf222e;
      --red-bg: #ffebe9;
      --purple: #8250df;
      --purple-bg: #fbefff;
      --note-bg: #fff8c5;
      --note-border: #d4a72c;
      --warn-bg: #fff0e0;
      --warn-border: #e07a00;
      /* section banners */
      --mobile-banner: #1d4ed8;
      --admin-banner: #d97706;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar ── */
    nav {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      background: var(--sidebar-bg);
      position: fixed;
      top: 0; left: 0; bottom: 0;
      overflow-y: auto;
      padding: 0 0 32px 0;
      z-index: 100;
    }

    .nav-logo {
      padding: 20px 16px 14px;
      font-size: 13px;
      font-weight: 700;
      color: #e6edf3;
      border-bottom: 1px solid #30363d;
      letter-spacing: 0.02em;
    }
    .nav-logo span { color: #f59e0b; }

    .nav-section {
      padding: 14px 16px 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #484f58;
    }
    .nav-section.mobile { color: #60a5fa; }
    .nav-section.admin  { color: #fbbf24; }

    nav a {
      display: block;
      padding: 5px 16px;
      font-size: 12px;
      color: #8b949e;
      text-decoration: none;
      transition: color 0.15s, background 0.15s;
      border-left: 2px solid transparent;
    }
    nav a:hover { color: #e6edf3; background: rgba(255,255,255,0.05); }
    nav a.mobile-link:hover { color: #93c5fd; }
    nav a.admin-link:hover  { color: #fcd34d; }

    /* ── Main content ── */
    main {
      margin-left: var(--sidebar-width);
      flex: 1;
      padding: 0 48px 80px 48px;
      max-width: 980px;
    }

    /* ── Page header ── */
    .page-header {
      padding: 40px 0 28px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 40px;
    }
    .page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .page-header p  { color: var(--sub); font-size: 14px; max-width: 640px; }
    .badge-row { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

    /* ── Section banner ── */
    .section-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 8px;
      margin: 40px 0 24px;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }
    .banner-mobile { background: var(--mobile-banner); }
    .banner-admin  { background: var(--admin-banner); }

    h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 48px 0 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    h3 { font-size: 16px; font-weight: 600; margin: 32px 0 12px; }
    h4 { font-size: 14px; font-weight: 600; margin: 24px 0 8px; }

    /* ── Endpoint block ── */
    .endpoint {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .endpoint-path {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }
    .endpoint-body { padding: 16px; }
    .endpoint-desc { color: var(--sub); margin-bottom: 12px; font-size: 13px; }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'SFMono-Regular', Consolas, monospace;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .badge-get    { background: var(--green-bg); color: var(--green); }
    .badge-post   { background: var(--blue-bg);  color: var(--blue); }
    .badge-patch  { background: var(--amber-bg); color: var(--amber); }
    .badge-delete { background: var(--red-bg);   color: var(--red); }
    .badge-ws     { background: var(--purple-bg); color: var(--purple); }
    .badge-201    { background: var(--blue-bg);   color: var(--blue); }
    .badge-200    { background: var(--green-bg);  color: var(--green); }
    .badge-204    { background: #f0f0f0; color: #555; }

    .dir-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      flex-shrink: 0;
    }
    .dir-client { background: var(--blue-bg);  color: var(--blue); }
    .dir-server { background: var(--green-bg); color: var(--green); }

    /* ── Tables ── */
    .table-wrap { overflow-x: auto; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th {
      text-align: left;
      padding: 8px 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      font-weight: 600;
      color: var(--sub);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td { padding: 8px 12px; border: 1px solid var(--border); vertical-align: top; }
    tr:nth-child(even) td { background: var(--surface); }

    /* ── Code blocks ── */
    pre {
      background: var(--code-bg);
      color: var(--code-text);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
      font-size: 12px;
      line-height: 1.7;
      margin: 12px 0;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
      font-size: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 3px;
      padding: 1px 5px;
    }
    pre code { background: none; border: none; padding: 0; font-size: inherit; }

    /* ── Note / Warning boxes ── */
    .note {
      background: var(--note-bg);
      border-left: 4px solid var(--note-border);
      border-radius: 0 6px 6px 0;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 13px;
    }
    .note strong { color: #5a4000; }

    .warn {
      background: var(--warn-bg);
      border-left: 4px solid var(--warn-border);
      border-radius: 0 6px 6px 0;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 13px;
    }
    .warn strong { color: #7a3500; }

    /* ── Flow steps ── */
    .flow-steps { list-style: none; margin: 12px 0; }
    .flow-steps li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .step-mobile { background: var(--mobile-banner); }
    .step-admin  { background: var(--admin-banner); }

    /* ── Event block ── */
    .event-block {
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .event-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .event-name {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 13px;
      font-weight: 600;
    }
    .event-body { padding: 12px 16px; font-size: 13px; }
    .event-rate { margin-left: auto; font-size: 11px; color: var(--sub); }

    /* ── Schema block ── */
    .schema-block {
      background: var(--code-bg);
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 12px;
      line-height: 1.8;
      color: var(--code-text);
      overflow-x: auto;
    }
    .schema-key   { color: #79c0ff; }
    .schema-type  { color: #ff7b72; }
    .schema-note  { color: #8b949e; }
    .schema-enum  { color: #ffa657; }

    /* ── Status lifecycle ── */
    .lifecycle {
      display: flex;
      align-items: stretch;
      gap: 0;
      margin: 16px 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .lifecycle-step {
      flex: 1;
      padding: 12px 14px;
      border-right: 1px solid var(--border);
      font-size: 13px;
    }
    .lifecycle-step:last-child { border-right: none; }
    .lifecycle-step h5 {
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .lifecycle-step p { font-size: 12px; color: var(--sub); margin: 0; }
    .ls-review   { background: #fff8f0; }
    .ls-progress { background: #eff6ff; }
    .ls-resolved { background: #f0fdf4; }
    .ls-rejected { background: #fff1f2; }

    /* ── Status flow inline ── */
    .status-flow {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      flex-wrap: wrap;
    }
    .status-pill {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-arrow { color: var(--sub); font-size: 16px; }

    /* ── Inline tag ── */
    .tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
    }
    .tag-req { background: #ffebe9; color: #cf222e; }
    .tag-opt { background: #f0f0f0; color: #555; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 4px; }

    hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
    p  { margin-bottom: 10px; }
    ul { padding-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>

<!-- ══════════════════════════════════════════════════════════════
     SIDEBAR
═══════════════════════════════════════════════════════════════ -->
<nav>
  <div class="nav-logo"><span>BidMart</span> — Complaint Chat API</div>

  <div class="nav-section">Overview</div>
  <a href="#overview">Introduction</a>
  <a href="#auth">Authentication</a>
  <a href="#envelope">Response Envelope</a>
  <a href="#lifecycle">Complaint Lifecycle</a>
  <a href="#chat-available">chatAvailable Flag</a>

  <div class="nav-section mobile">📱 Mobile — REST</div>
  <a href="#mobile-get-types" class="mobile-link">GET Complaint Types</a>
  <a href="#mobile-submit" class="mobile-link">POST Submit Complaint</a>
  <a href="#mobile-list" class="mobile-link">GET My Complaints</a>
  <a href="#mobile-get-one" class="mobile-link">GET Complaint Detail</a>
  <a href="#mobile-active" class="mobile-link">GET Support Inbox</a>
  <a href="#mobile-get-messages" class="mobile-link">GET Complaint Messages</a>

  <div class="nav-section mobile">📱 Mobile — Schemas</div>
  <a href="#mobile-schema-list-item" class="mobile-link">ComplaintListItem</a>
  <a href="#mobile-schema-support-item" class="mobile-link">UnifiedInboxItem (support)</a>
  <a href="#mobile-schema-detail" class="mobile-link">ComplaintDetail</a>
  <a href="#mobile-schema-message" class="mobile-link">ComplaintMessage</a>

  <div class="nav-section mobile">📱 Mobile — WebSocket</div>
  <a href="#mobile-ws-overview" class="mobile-link">Connection &amp; Auth</a>
  <a href="#mobile-ws-client" class="mobile-link">Client → Server Events</a>
  <a href="#mobile-ws-server" class="mobile-link">Server → Client Events</a>
  <a href="#mobile-ws-force-logout" class="mobile-link">force:logout</a>
  <a href="#mobile-ws-errors" class="mobile-link">Error Codes</a>
  <a href="#mobile-notification-delivery" class="mobile-link">Notification Delivery</a>

  <div class="nav-section mobile">📱 Mobile — Flows</div>
  <a href="#mobile-flow-submit" class="mobile-link">Submit &amp; Track</a>
  <a href="#mobile-flow-support" class="mobile-link">Support Inbox</a>

  <div class="nav-section admin">🖥 Admin — REST</div>
  <a href="#admin-list" class="admin-link">GET Complaints List</a>
  <a href="#admin-get-one" class="admin-link">GET Complaint Detail</a>
  <a href="#admin-start" class="admin-link">PATCH Start Investigation</a>
  <a href="#admin-resolve" class="admin-link">PATCH Resolve</a>
  <a href="#admin-reject" class="admin-link">PATCH Reject</a>
  <a href="#admin-add-note" class="admin-link">POST Add Note</a>
  <a href="#admin-get-notes" class="admin-link">GET Notes</a>
  <a href="#admin-notify" class="admin-link">POST Send Notification</a>
  <a href="#admin-close-conv" class="admin-link">PATCH Close Conversation</a>

  <div class="nav-section admin">🖥 Admin — Schemas</div>
  <a href="#admin-schema-list-item" class="admin-link">ComplaintAdminListItem</a>
  <a href="#admin-schema-detail" class="admin-link">ComplaintAdminDetail</a>
  <a href="#admin-schema-note" class="admin-link">ComplaintNoteItem</a>
  <a href="#admin-schema-activity" class="admin-link">ComplaintActivityItem</a>
  <a href="#admin-schema-message" class="admin-link">ComplaintMessageAdmin</a>

  <div class="nav-section admin">🖥 Admin — WebSocket</div>
  <a href="#admin-ws-overview" class="admin-link">Connection &amp; Room</a>
  <a href="#admin-ws-events" class="admin-link">Events (same namespace)</a>

  <div class="nav-section admin">🖥 Admin — Flows</div>
  <a href="#admin-flow-handle" class="admin-link">Handle a Complaint</a>
  <a href="#admin-flow-realtime" class="admin-link">Real-time Dashboard</a>
</nav>

<!-- ══════════════════════════════════════════════════════════════
     MAIN CONTENT
═══════════════════════════════════════════════════════════════ -->
<main>

  <!-- ── Page Header ── -->
  <div class="page-header">
    <h1>BidMart Complaint Chat API</h1>
    <p>
      Complaint submission and support chat system. This reference covers all REST endpoints,
      WebSocket events, and integration flows for <strong>both mobile developers</strong> (user side)
      <strong>and web/admin dashboard developers</strong>.
    </p>
    <div class="badge-row">
      <span class="badge badge-ws">WebSocket /complaint-chat</span>
      <span class="badge badge-get">REST /api/v1/complaints</span>
      <span class="badge badge-get" style="background:#fef3c7;color:#9a6700;">REST /api/v1/admin/complaints</span>
    </div>
  </div>

  <!-- ═══════════════════════════════
       OVERVIEW
  ════════════════════════════════ -->
  <section id="overview">
    <h2>Introduction</h2>
    <p>
      The Complaint Chat module handles user support requests. Users submit complaints via the mobile
      app; admins manage and respond via the web dashboard. The system has two completely separate
      REST API surfaces (user JWT vs admin JWT) but shares a single WebSocket namespace
      (<code>/complaint-chat</code>).
    </p>
    <p>
      <strong>Chat is not immediately available.</strong> A complaint starts in UNDER_REVIEW status.
      Chat only becomes active after an admin explicitly moves the complaint to IN_PROGRESS.
      Once closed (RESOLVED or REJECTED), chat is permanently disabled.
    </p>
  </section>

  <section id="auth">
    <h2>Authentication</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Side</th><th>JWT type</th><th>REST header</th><th>WebSocket</th></tr></thead>
        <tbody>
          <tr>
            <td>Mobile (users)</td>
            <td>User JWT</td>
            <td><code>Authorization: Bearer &lt;token&gt;</code></td>
            <td><code>socket.handshake.auth.token</code></td>
          </tr>
          <tr>
            <td>Admin dashboard</td>
            <td>Admin JWT</td>
            <td><code>Authorization: Bearer &lt;token&gt;</code></td>
            <td><code>socket.handshake.auth.token</code></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="note">
      <strong>Note:</strong> The <code>/complaint-chat</code> WebSocket namespace accepts <em>both</em>
      user JWTs and admin JWTs. The server determines behavior (which rooms to join) based on the token type.
    </div>
    <div class="warn">
      <strong>Admin WebSocket permission:</strong> Admin JWTs must carry the
      <code>VIEW_COMPLAINTS</code> permission (or <code>is_super_admin = true</code>).
      Admins without this permission receive a <code>FORBIDDEN</code> connection error and cannot connect.
    </div>
  </section>

  <section id="envelope">
    <h2>Response Envelope</h2>
    <h4>Success</h4>
    <pre><code>{ "success": true, "data": { ... }, "meta": { "version": "1.0.0" } }</code></pre>
    <h4>Offset-paginated</h4>
    <pre><code>{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}</code></pre>
    <h4>Error</h4>
    <pre><code>{
  "success": false,
  "error": {
    "code": "COMPLAINT_ACCESS_DENIED",
    "message": "You do not have access to this complaint",
    "timestamp": "2024-06-15T10:30:00.000Z",
    "path": "/api/v1/complaints/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "meta": { "version": "1.0.0" }
}</code></pre>
  </section>

  <section id="lifecycle">
    <h2>Complaint Lifecycle</h2>

    <div class="status-flow">
      <span class="status-pill" style="background:#fef3c7;color:#9a6700;">UNDER_REVIEW</span>
      <span class="status-arrow">→</span>
      <span class="status-pill" style="background:#dbeafe;color:#0969da;">IN_PROGRESS</span>
      <span class="status-arrow">→</span>
      <span class="status-pill" style="background:#dafbe1;color:#1a7f37;">RESOLVED</span>
      <span class="status-arrow">or</span>
      <span class="status-pill" style="background:#ffebe9;color:#cf222e;">REJECTED</span>
    </div>

    <div class="lifecycle">
      <div class="lifecycle-step ls-review">
        <h5>UNDER_REVIEW</h5>
        <p>Just submitted. Chat is NOT available yet. Admin reviews the complaint.</p>
      </div>
      <div class="lifecycle-step ls-progress">
        <h5>IN_PROGRESS</h5>
        <p>Admin clicked "Start Investigation". Chat IS available. Socket events flow between user and admin.</p>
      </div>
      <div class="lifecycle-step ls-resolved">
        <h5>RESOLVED</h5>
        <p>Admin resolved with a note. Chat closed automatically. Final state.</p>
      </div>
      <div class="lifecycle-step ls-rejected">
        <h5>REJECTED</h5>
        <p>Admin rejected with a reason. Chat closed automatically. Final state.</p>
      </div>
    </div>

    <div class="note">
      <strong>RESOLVED and REJECTED are terminal states.</strong> A closed complaint cannot be
      re-opened. The user must submit a new complaint.
    </div>
  </section>

  <section id="chat-available">
    <h2>chatAvailable Flag &amp; chatClosedReason</h2>
    <p>
      <strong>These fields are available in <code>ComplaintDetail</code> only</strong>
      (<code>GET /complaints/:id</code> and <code>POST /complaints</code>).
      They are <em>not</em> included in the inbox list responses (<code>GET /inbox</code> or
      <code>GET /complaints/support/active</code>), which use the unified <code>UnifiedInboxItem</code>
      shape instead. Fetch <code>GET /complaints/:id</code> when the user opens a complaint to
      determine whether to show the message input.
    </p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>chatAvailable</th><th>chatClosedReason</th><th>Condition</th></tr></thead>
        <tbody>
          <tr><td><code>true</code></td><td><code>null</code></td><td>Status is IN_PROGRESS AND conversation_closed is false — show message input</td></tr>
          <tr><td><code>false</code></td><td><code>"resolved"</code></td><td>Complaint was resolved — show resolution note</td></tr>
          <tr><td><code>false</code></td><td><code>"rejected"</code></td><td>Complaint was rejected — show rejection reason</td></tr>
          <tr><td><code>false</code></td><td><code>"manually_closed"</code></td><td>Admin closed the chat thread without resolving — disable input but complaint may still be open</td></tr>
          <tr><td><code>false</code></td><td><code>null</code></td><td>Complaint is UNDER_REVIEW — chat not yet activated</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <hr>

  <!-- ═══════════════════════════════
       MOBILE — SECTION BANNER
  ════════════════════════════════ -->
  <div class="section-banner banner-mobile" id="mobile-section">
    📱 Mobile — User Side
  </div>
  <p style="color:var(--sub);font-size:13px;margin-bottom:24px;">
    All endpoints in this section require a <strong>User JWT</strong>.
    These are the endpoints your mobile app developers will integrate against.
  </p>

  <!-- GET complaint types -->
  <section id="mobile-get-types">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/complaints/types</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Returns all active complaint types. Names are resolved to the language specified in the
          <code>Accept-Language</code> header (<code>ar</code> or <code>en</code>).
          Use to populate the complaint type dropdown before the user submits a complaint.
        </p>
        <h4>Headers</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Header</th><th>Value</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>Accept-Language</code></td><td><code>ar</code> or <code>en</code></td><td>Language for name field. Defaults to en.</td></tr>
            </tbody>
          </table>
        </div>
        <h4>Example Response (200)</h4>
        <pre><code>{
  "success": true,
  "data": [
    { "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "name": "Delayed Shipment" },
    { "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "name": "Wrong Item Received" },
    { "id": "c3d4e5f6-a7b8-9012-cdef-123456789012", "name": "Seller Unresponsive" }
  ],
  "meta": { "version": "1.0.0" }
}</code></pre>
      </div>
    </div>
  </section>

  <!-- POST submit complaint -->
  <section id="mobile-submit">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/v1/complaints</span>
        <span class="badge badge-201" style="margin-left:auto;">201 Created</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Submit a new complaint. The initial status is always <code>UNDER_REVIEW</code>.
          Chat is not available until an admin starts the investigation.
        </p>

        <h4>Request Body</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraints</th><th>Description</th></tr></thead>
            <tbody>
              <tr>
                <td><code>complaint_type_id</code></td><td>UUID</td>
                <td><span class="tag tag-req">required</span></td>
                <td>—</td>
                <td>ID from GET /complaints/types</td>
              </tr>
              <tr>
                <td><code>description</code></td><td>string</td>
                <td><span class="tag tag-req">required</span></td>
                <td>1–2000 chars</td>
                <td>Full description of the complaint</td>
              </tr>
              <tr>
                <td><code>attachment_urls</code></td><td>string[]</td>
                <td><span class="tag tag-opt">optional</span></td>
                <td>—</td>
                <td>S3 URLs from POST /api/v1/file-upload. Upload files first, then pass the returned URLs here.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>Example Request</h4>
        <pre><code>POST /api/v1/complaints
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "complaint_type_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "description": "I received the wrong item. Order #12345 was supposed to be a blue shirt but I received a red one.",
  "attachment_urls": [
    "https://cdn.bidmart.sa/uploads/receipt_abc.jpg",
    "https://cdn.bidmart.sa/uploads/photo_xyz.jpg"
  ]
}</code></pre>

        <h4>Example Response (201)</h4>
        <pre><code>{
  "success": true,
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "complaint_type": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Wrong Item Received"
    },
    "status": "UNDER_REVIEW",
    "description": "I received the wrong item...",
    "attachment_urls": ["https://cdn.bidmart.sa/uploads/receipt_abc.jpg"],
    "conversation_closed": false,
    "chatAvailable": false,
    "chatClosedReason": null,
    "messages": [],
    "created_at": "2024-06-15T10:00:00.000Z"
  },
  "meta": { "version": "1.0.0" }
}</code></pre>

        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>complaint_type_id does not exist or is inactive</td></tr>
              <tr><td><code>VALIDATION_FAILED</code></td><td>400</td><td>description empty / over 2000 chars, or invalid UUID</td></tr>
              <tr><td><code>UNAUTHORIZED</code></td><td>401</td><td>Missing or expired JWT</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- GET my complaints -->
  <section id="mobile-list">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/complaints</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Retrieve a paginated list of the authenticated user's complaints.
          Sorted newest-first. Use for the complaint history screen.
        </p>
        <h4>Query Parameters</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>page</code></td><td>number</td><td>1</td><td>Page number</td></tr>
              <tr><td><code>limit</code></td><td>number</td><td>10</td><td>Items per page. Maximum 50.</td></tr>
            </tbody>
          </table>
        </div>
        <h4>Example Response (200)</h4>
        <pre><code>{
  "success": true,
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "complaint_type": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Wrong Item Received"
      },
      "status": "IN_PROGRESS",
      "statusLabel": "In Progress",
      "description_preview": "I received the wrong item. Order #12345 was supposed to be...",
      "created_at": "2024-06-15T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}</code></pre>
      </div>
    </div>
  </section>

  <!-- GET complaint detail -->
  <section id="mobile-get-one">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/complaints/:id</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Retrieve the full detail of a complaint including the complete message thread (oldest-first).
          Check <code>chatAvailable</code> before showing the message input.
        </p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>id</code></td><td>UUID</td><td>Complaint UUID</td></tr>
            </tbody>
          </table>
        </div>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint does not exist</td></tr>
              <tr><td><code>COMPLAINT_ACCESS_DENIED</code></td><td>403</td><td>Complaint belongs to a different user</td></tr>
              <tr><td><code>UNAUTHORIZED</code></td><td>401</td><td>Missing or expired JWT</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- GET support inbox -->
  <section id="mobile-active">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/complaints/support/active</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Returns a list of the user's complaints (all statuses by default), sorted by
          <code>lastMessageAt DESC NULLS LAST, created_at DESC</code>.
          Use for the Support tab inbox screen to show all complaint threads with unread badges.
        </p>

        <h4>Query Parameters</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr>
                <td><code>status</code></td>
                <td>enum</td>
                <td>—</td>
                <td>Optional filter: <code>UNDER_REVIEW</code>, <code>IN_PROGRESS</code>, <code>RESOLVED</code>, or <code>REJECTED</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>Example Response (200)</h4>
        <pre><code>{
  "success": true,
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "source": "support",
      "lastMessageAt": "2024-06-15T10:35:00.000Z",
      "lastMessagePreview": "We have received your complaint and are looking into it.",
      "unreadCount": 2,
      "conversationClosed": false,
      "otherParticipant": {
        "id": null,
        "username": "support",
        "fullName": "الدعم الفني",
        "profilePicture": null
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}</code></pre>
        <div class="note">
          <strong>Response shape is now unified</strong> with the chat inbox — both return the same
          <code>UnifiedInboxItem</code> structure. Status, complaint type, and chat availability are
          not included in the list response; retrieve them via <code>GET /complaints/:id</code>
          when the user opens a specific complaint. <code>unreadCount</code> resets to 0 when the
          user calls <code>GET /complaints/:id/messages</code> or emits <code>complaint:message:read</code>.
        </div>
      </div>
    </div>
  </section>

  <!-- GET complaint messages -->
  <section id="mobile-get-messages">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/complaints/:id/messages</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Paginated message history for a complaint thread. Messages are grouped by calendar date
          (same structure as the regular chat messages endpoint). Calling this endpoint also
          resets the caller's <code>unreadCount</code> to 0 for this complaint.
        </p>

        <div class="warn">
          <strong>Side effect:</strong> Calling this endpoint resets <code>unreadCount</code> to 0
          for this complaint. Call when the user opens the conversation view.
        </div>

        <h4>Query Parameters</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr>
                <td><code>cursor</code></td>
                <td>ISO8601 string</td>
                <td>—</td>
                <td><code>createdAt</code> of the oldest message on the current page (<code>meta.nextCursor</code>). Omit for the first/most-recent page.</td>
              </tr>
              <tr>
                <td><code>limit</code></td>
                <td>number</td>
                <td>20</td>
                <td>Messages per page. Maximum 50.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>Example Response (200)</h4>
        <pre><code>{
  "success": true,
  "data": {
    "complaint": {
      "complaint_created_at": "2024-06-15T10:00:00.000Z",
      "conversation_closed": false,
      "chatAvailable": true,
      "status": "IN_PROGRESS",
      "statusLabel": "In Progress",
      "complaint_type": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Wrong Item Received"
      }
    },
    "messages": [
      {
        "date": "2024-06-15",
        "listOfMessages": [
          {
            "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
            "conversationId": "d4e5f6a7-b8c9-0123-def0-234567890123",
            "senderId": "f6a7b8c9-d0e1-2345-f012-456789012345",
            "content": "We have received your complaint and are looking into it.",
            "messageType": "TEXT",
            "imageUrl": null,
            "status": "DELIVERED",
            "deliveredAt": "2024-06-15T10:35:05.000Z",
            "readAt": null,
            "isMe": false,
            "createdAt": "2024-06-15T10:35:00.000Z"
          }
        ]
      }
    ]
  },
  "meta": {
    "version": "1.0.0",
    "nextCursor": "2024-06-15T10:35:00.000Z",
    "hasNextPage": false
  }
}</code></pre>
        <div class="note">
          <strong>isMe</strong> is pre-computed server-side — use it directly to determine bubble side
          instead of comparing <code>senderId</code> to your userId.
        </div>
      </div>
    </div>
  </section>

  <!-- ── Mobile Schemas ── -->
  <h2>Mobile Response Schemas</h2>

  <section id="mobile-schema-support-item">
    <h3>UnifiedInboxItem (support)</h3>
    <p>
      Returned by <code>GET /complaints/support/active</code> and <code>GET /inbox</code>.
      Both endpoints return the same shape — complaint-specific fields
      (<code>status</code>, <code>complaint_type</code>, <code>chatAvailable</code>) are available
      via <code>GET /complaints/:id</code> when the user opens the thread.
    </p>
    <div class="schema-block">
<span class="schema-key">id</span>:                    <span class="schema-type">string</span>  <span class="schema-note">// complaint UUID — use as :id in /complaints/:id/messages</span>
<span class="schema-key">source</span>:                <span class="schema-enum">"support"</span>  <span class="schema-note">// Always "support" from this endpoint</span>
<span class="schema-key">lastMessageAt</span>:         <span class="schema-type">string | null</span>  <span class="schema-note">// ISO8601 — null if no messages yet</span>
<span class="schema-key">lastMessagePreview</span>:   <span class="schema-type">string | null</span>  <span class="schema-note">// First 120 chars; "[Image]" for image-only messages</span>
<span class="schema-key">unreadCount</span>:            <span class="schema-type">number</span>  <span class="schema-note">// Admin messages not yet read by user; resets on GET /messages or complaint:message:read</span>
<span class="schema-key">conversationClosed</span>:   <span class="schema-type">boolean</span>  <span class="schema-note">// true when admin explicitly closed the chat thread</span>
<span class="schema-key">otherParticipant</span>:      <span class="schema-type">object</span>  <span class="schema-note">// Always the synthetic support agent — not a real user</span>
  <span class="schema-key">id</span>:               <span class="schema-type">null</span>
  <span class="schema-key">username</span>:          <span class="schema-enum">"support"</span>
  <span class="schema-key">fullName</span>:          <span class="schema-type">string</span>  <span class="schema-note">// "الدعم الفني" (ar) or "Support" (en) — resolved by Accept-Language</span>
  <span class="schema-key">profilePicture</span>:   <span class="schema-type">null</span>
    </div>
  </section>

  <section id="mobile-schema-list-item">
    <h3>ComplaintListItem</h3>
    <p>Returned in the paginated list from GET /complaints.</p>
    <div class="schema-block">
<span class="schema-key">id</span>:                    <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">complaint_type</span>:        <span class="schema-type">{ id: string, name: string }</span>  <span class="schema-note">// name localized by Accept-Language</span>
<span class="schema-key">status</span>:                 <span class="schema-enum">"UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"</span>
<span class="schema-key">statusLabel</span>:            <span class="schema-type">string</span>  <span class="schema-note">// Display-ready label resolved by Accept-Language</span>
<span class="schema-key">description_preview</span>:   <span class="schema-type">string</span>  <span class="schema-note">// Truncated at 100 chars</span>
<span class="schema-key">created_at</span>:             <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
  </section>

  <section id="mobile-schema-detail">
    <h3>ComplaintDetail (user-facing)</h3>
    <p>Returned by POST /complaints and GET /complaints/:id.</p>
    <div class="schema-block">
<span class="schema-key">id</span>:                    <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">complaint_type</span>:        <span class="schema-type">{ id: string, name: string }</span>
<span class="schema-key">status</span>:                 <span class="schema-enum">"UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"</span>
<span class="schema-key">description</span>:           <span class="schema-type">string</span>  <span class="schema-note">// Full description</span>
<span class="schema-key">attachment_urls</span>:        <span class="schema-type">string[]</span>  <span class="schema-note">// S3 URLs</span>
<span class="schema-key">conversation_closed</span>:   <span class="schema-type">boolean</span>
<span class="schema-key">chatAvailable</span>:          <span class="schema-type">boolean</span>  <span class="schema-note">// true = show message input</span>
<span class="schema-key">chatClosedReason</span>:      <span class="schema-enum">"resolved" | "rejected" | "manually_closed" | null</span>
<span class="schema-key">messages</span>:               <span class="schema-type">ComplaintMessage[]</span>  <span class="schema-note">// Full thread, oldest-first</span>
<span class="schema-key">created_at</span>:             <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
  </section>

  <section id="mobile-schema-message">
    <h3>ComplaintMessage (user-facing)</h3>
    <p>
      Returned by <code>GET /complaints/:id/messages</code> inside each <code>listOfMessages</code>
      array, and by the <code>complaint:message:new</code> socket event.
    </p>
    <div class="schema-block">
<span class="schema-key">id</span>:              <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">conversationId</span>:  <span class="schema-type">string</span>  <span class="schema-note">// complaintId — matches complaint UUID</span>
<span class="schema-key">senderId</span>:        <span class="schema-type">string</span>  <span class="schema-note">// UUID — compare to myUserId to determine bubble side</span>
<span class="schema-key">content</span>:         <span class="schema-type">string</span>
<span class="schema-key">messageType</span>:     <span class="schema-enum">"TEXT" | "IMAGE"</span>
<span class="schema-key">imageUrl</span>:        <span class="schema-type">string | null</span>  <span class="schema-note">// pre-uploaded URL for IMAGE messages; null for TEXT</span>
<span class="schema-key">status</span>:           <span class="schema-enum">"SENT" | "DELIVERED" | "READ"</span>  <span class="schema-note">// SENT → DELIVERED when recipient fetches messages; READ when recipient emits complaint:message:read</span>
<span class="schema-key">deliveredAt</span>:     <span class="schema-type">string | null</span>  <span class="schema-note">// ISO8601 — set when recipient first fetches the conversation</span>
<span class="schema-key">readAt</span>:           <span class="schema-type">string | null</span>  <span class="schema-note">// ISO8601 — set when recipient emits complaint:message:read</span>
<span class="schema-key">isMe</span>:             <span class="schema-type">boolean</span>  <span class="schema-note">// true when sent by the authenticated caller — use for bubble side</span>
<span class="schema-key">createdAt</span>:        <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
    <div class="note">
      The <code>complaint:message:new</code> socket event carries the same shape with the addition of
      <code>sender: "USER" | "ADMIN"</code> and <code>status: "SENT"</code> for newly created messages.
    </div>
  </section>

  <hr>

  <!-- ── Mobile WebSocket ── -->
  <h2 id="mobile-ws-overview">Mobile WebSocket — <code>/complaint-chat</code> Namespace</h2>

  <section>
    <h3>Connection &amp; Auth</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Detail</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Namespace</td><td><code>/complaint-chat</code></td></tr>
          <tr><td>Auth</td><td>User JWT via <code>socket.handshake.auth.token</code></td></tr>
          <tr><td>On connect (user)</td><td>Server joins user to all their IN_PROGRESS complaint rooms — <code>complaint:{complaintId}</code></td></tr>
          <tr><td>Chat guard</td><td>Chat events are only processed when complaint is IN_PROGRESS and conversation_closed is false</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Connection Example</h4>
    <pre><code>import { io } from 'socket.io-client';

const socket = io('https://api.bidmart.sa/complaint-chat', {
  auth: { token: 'eyJhbGciOiJIUzI1NiJ9...' },
  transports: ['websocket'],
});

socket.on('connect', () => console.log('Complaint chat connected'));
socket.on('error', (err) => handleSocketError(err.message));</code></pre>
  </section>

  <section id="mobile-ws-client">
    <h3>Client → Server Events (Mobile)</h3>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-client">CLIENT → SERVER</span>
        <span class="event-name">complaint:message:send</span>
        <span class="event-rate">Rate limit: 20 per 60s</span>
      </div>
      <div class="event-body">
        <p>Send a message in a complaint chat thread. Will receive an <code>error</code> event if the complaint is not IN_PROGRESS or the conversation is closed.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>complaintId</code></td><td>UUID</td><td><span class="tag tag-req">required</span></td><td>The complaint UUID</td></tr>
              <tr><td><code>messageType</code></td><td><code>"TEXT" | "IMAGE"</code></td><td><span class="tag tag-opt">optional</span></td><td>Defaults to <code>"TEXT"</code></td></tr>
              <tr><td><code>message</code></td><td>string</td><td>required for TEXT</td><td>Message text (non-empty, max 1000 chars)</td></tr>
              <tr><td><code>imageUrl</code></td><td>string</td><td>required for IMAGE</td><td>Pre-uploaded image URL</td></tr>
            </tbody>
          </table>
        </div>
        <pre><code>// Text message
socket.emit('complaint:message:send', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
  message: 'I can provide more photos if needed.',
});

// Image message (upload file first, then send URL)
socket.emit('complaint:message:send', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
  messageType: 'IMAGE',
  imageUrl: 'https://cdn.bidmart.sa/uploads/screenshot.jpg',
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-client">CLIENT → SERVER</span>
        <span class="event-name">complaint:typing:start</span>
      </div>
      <div class="event-body">
        <p>Notify the support agent that the user is typing.</p>
        <pre><code>socket.emit('complaint:typing:start', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-client">CLIENT → SERVER</span>
        <span class="event-name">complaint:typing:stop</span>
      </div>
      <div class="event-body">
        <p>Notify the support agent that the user stopped typing. Also emit when a message is sent.</p>
        <pre><code>socket.emit('complaint:typing:stop', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-client">CLIENT → SERVER</span>
        <span class="event-name">complaint:message:read</span>
        <span class="event-rate">Rate limit: 10 per 60s — User and Admin</span>
      </div>
      <div class="event-body">
        <p>
          Marks all unread messages from the <em>other side</em> as READ in this complaint thread.
        </p>
        <ul style="margin:8px 0 8px 18px;line-height:1.8;">
          <li><strong>User emits</strong> → marks all unread admin messages READ, resets <code>unreadCount</code> to 0, notifies admin via <code>complaint:messages:read</code>.</li>
          <li><strong>Admin emits</strong> → marks all unread user messages READ, notifies user via <code>complaint:messages:read</code>.</li>
        </ul>
        <p>Also resets automatically for the user when <code>GET /complaints/:id/messages</code> is called via REST.</p>
        <pre><code>socket.emit('complaint:message:read', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
});</code></pre>
      </div>
    </div>
  </section>

  <section id="mobile-ws-server">
    <h3>Server → Client Events (Mobile)</h3>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:message:new</span>
      </div>
      <div class="event-body">
        <p>Received by <strong>both user and admin</strong> when any message is sent in the complaint thread.</p>
        <div class="note">
          <strong>Sender detection:</strong> Compare <code>data.senderId === myUserId</code>.
          If true, it's your own message being confirmed — reconcile your optimistic bubble.
          If false, it's the support agent's reply — render as an incoming message on the left side.
        </div>
        <h4>Payload</h4>
        <pre><code>{
  "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "complaintId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "sender": "ADMIN",
  "senderId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "messageType": "TEXT",
  "content": "We have received your complaint and are looking into it.",
  "imageUrl": null,
  "status": "SENT",
  "createdAt": "2024-06-15T10:35:00.000Z"
}</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:status:updated</span>
      </div>
      <div class="event-body">
        <p>
          Emitted when an admin starts the investigation (UNDER_REVIEW → IN_PROGRESS).
          Chat is now available. Show the message input and update the UI state
          <strong>without polling</strong>.
        </p>
        <h4>Payload</h4>
        <pre><code>{
  "complaintId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "status": "in_progress"
}</code></pre>
        <pre><code>socket.on('complaint:status:updated', (data) => {
  if (data.complaintId === currentComplaintId) {
    setChatAvailable(true);
    showNotification('Support agent started reviewing your complaint');
  }
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:closed</span>
      </div>
      <div class="event-body">
        <p>Complaint was resolved or rejected. Disable the message input and show the resolution state.</p>
        <h4>Payload</h4>
        <pre><code>{
  "complaintId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "status": "resolved"
}</code></pre>
        <pre><code>socket.on('complaint:closed', (data) => {
  disableMessageInput();
  showResolutionState(data.status); // 'resolved' or 'rejected'
  // Re-fetch complaint detail to get the updated status and chatClosedReason
  refetchComplaint(data.complaintId);
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:conversation:closed</span>
      </div>
      <div class="event-body">
        <p>
          Admin closed the chat thread without resolving or rejecting the complaint.
          Disable the message input. <code>chatClosedReason</code> will be <code>"manually_closed"</code>
          on the next detail fetch.
        </p>
        <h4>Payload</h4>
        <pre><code>{
  "complaintId": "d4e5f6a7-b8c9-0123-def0-234567890123"
}</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:typing:start</span>
      </div>
      <div class="event-body">
        <p>Show "Support agent is typing..." indicator.</p>
        <h4>Payload</h4>
        <pre><code>{
  "actorId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "actorType": "admin"
}</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:typing:stop</span>
      </div>
      <div class="event-body">
        <p>Hide the typing indicator.</p>
        <h4>Payload</h4>
        <pre><code>{
  "actorId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "actorType": "admin"
}</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:message:status</span>
      </div>
      <div class="event-body">
        <p>
          Notifies the original sender that one of their messages was delivered or read by the recipient.
          <strong>User receives this</strong> when the admin fetches the complaint (→ DELIVERED) or emits
          <code>complaint:message:read</code> (→ READ). <strong>Admin receives this</strong> via the
          <code>admin-complaints</code> room under the same conditions for user-sent messages.
        </p>
        <h4>Payload</h4>
        <pre><code>{
  "messageId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "status": "DELIVERED",
  "deliveredAt": "2024-06-15T10:35:05.000Z"
}</code></pre>
        <pre><code>socket.on('complaint:message:status', (data) => {
  updateMessageStatus(data.messageId, data.status, data.deliveredAt ?? data.readAt);
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">complaint:messages:read</span>
      </div>
      <div class="event-body">
        <p>
          Notifies the original sender(s) that the recipient has read their messages.
          Emitted after <code>complaint:message:read</code> is processed.
          <strong>User receives this</strong> (via <code>complaint:{id}</code> room) when the admin marks messages read.
          <strong>Admin receives this</strong> (via <code>admin-complaints</code> room) when the user marks messages read.
        </p>
        <h4>Payload</h4>
        <pre><code>{
  "complaintId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "messageIds": ["e5f6a7b8-c9d0-1234-ef01-345678901234"],
  "readAt": "2024-06-15T10:36:00.000Z"
}</code></pre>
        <pre><code>socket.on('complaint:messages:read', (data) => {
  data.messageIds.forEach(id => markMessageRead(id, data.readAt));
});</code></pre>
      </div>
    </div>

    <div class="event-block">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">error</span>
      </div>
      <div class="event-body">
        <p>Socket-level error. Always listen and handle.</p>
        <h4>Payload</h4>
        <pre><code>{ "message": "COMPLAINT_CHAT_NOT_OPEN" }</code></pre>
      </div>
    </div>

    <div class="event-block" id="mobile-ws-force-logout">
      <div class="event-header">
        <span class="dir-badge dir-server">SERVER → CLIENT</span>
        <span class="event-name">force:logout</span>
        <span class="event-rate">User only</span>
      </div>
      <div class="event-body">
        <p>
          Sent to the user's socket when the account is suspended or the JWT is revoked.
          Clear local tokens and redirect to the login screen.
        </p>
        <h4>Payload</h4>
        <pre><code>{ "reason": "TOKEN_REVOKED" }</code></pre>
        <div class="table-wrap">
          <table>
            <thead><tr><th>reason</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td><code>TOKEN_REVOKED</code></td><td>JWT invalidated. Clear tokens and redirect to login.</td></tr>
              <tr><td><code>USER_BLOCKED</code></td><td>Account suspended. Show blocked message.</td></tr>
            </tbody>
          </table>
        </div>
        <pre><code>socket.on('force:logout', (data) => {
  clearAuthTokens();
  redirectToLogin(data.reason);
});</code></pre>
      </div>
    </div>
  </section>

  <section id="mobile-ws-errors">
    <h3>Mobile Socket Error Codes</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>message value</th><th>Meaning / Action</th></tr></thead>
        <tbody>
          <tr><td><code>AUTH_REQUIRED</code></td><td>No token provided. Redirect to login.</td></tr>
          <tr><td><code>INVALID_TOKEN</code></td><td>Token malformed or expired. Refresh and reconnect.</td></tr>
          <tr><td><code>USER_BLOCKED</code></td><td>Account is blocked.</td></tr>
          <tr><td><code>COMPLAINT_CHAT_NOT_OPEN</code></td><td>Complaint is UNDER_REVIEW — chat not yet activated. Show informational message, not an error.</td></tr>
          <tr><td><code>COMPLAINT_CLOSED</code></td><td>Complaint is RESOLVED or REJECTED. Disable input.</td></tr>
          <tr><td><code>COMPLAINT_CONVERSATION_CLOSED</code></td><td>Conversation was manually closed by admin. Disable input.</td></tr>
          <tr><td><code>INVALID_PAYLOAD</code></td><td>Missing or empty required fields in the event payload.</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section id="mobile-notification-delivery">
    <h3>Notification Delivery</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Direction</th><th>User online?</th><th>Delivery method</th></tr></thead>
        <tbody>
          <tr>
            <td>Admin → User</td>
            <td>Yes (heartbeat within 30 s on <code>/chat</code>)</td>
            <td><code>complaint:message:new</code> socket event only — no FCM push</td>
          </tr>
          <tr>
            <td>Admin → User</td>
            <td>No</td>
            <td>Firebase push notification (<code>COMPLAINT_MESSAGE</code> type) via BullMQ</td>
          </tr>
          <tr>
            <td>User → Admin</td>
            <td>N/A — admin presence not tracked</td>
            <td>Firebase push always sent to all admins with <code>VIEW_COMPLAINTS</code></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="note">
      <strong>Presence key:</strong> Complaint chat uses the same Redis presence key
      (<code>online:users</code>) as regular chat. A user is considered online if they have sent a
      <code>heartbeat</code> event on the <code>/chat</code> namespace within the last 30 seconds.
      The <code>/complaint-chat</code> namespace has no heartbeat — connect to <code>/chat</code>
      to maintain online presence.
    </div>
  </section>

  <hr>

  <!-- ── Mobile Flows ── -->
  <h2>Mobile Typical Flows</h2>

  <section id="mobile-flow-submit">
    <h3>Flow 1 — Submit and Track a Complaint</h3>
    <ol class="flow-steps">
      <li>
        <span class="step-num step-mobile">1</span>
        <div>
          Call <strong>GET /complaints/types</strong> with the appropriate <code>Accept-Language</code> header.
          Populate the complaint type dropdown.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">2</span>
        <div>
          If the user attaches files, upload them first via <strong>POST /api/v1/file-upload</strong>
          and save the returned S3 URLs.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">3</span>
        <div>
          Call <strong>POST /complaints</strong> with <code>complaint_type_id</code>, <code>description</code>,
          and optional <code>attachment_urls</code>. Show a confirmation screen with the returned complaint ID.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">4</span>
        <div>
          Navigate to the complaints list (GET /complaints). Show the new complaint with status UNDER_REVIEW.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">5</span>
        <div>
          Connect to <strong>/complaint-chat WebSocket</strong>. Listen for <code>complaint:status:updated</code>.
          When received, <code>chatAvailable</code> becomes true — show the message input.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">6</span>
        <div>
          User sends messages via <code>complaint:message:send</code>. Render optimistically;
          reconcile on <code>complaint:message:new</code>.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">7</span>
        <div>
          When <code>complaint:closed</code> is received, disable the input and show the
          resolution state (re-fetch detail to get updated <code>status</code> and <code>chatClosedReason</code>).
        </div>
      </li>
    </ol>
  </section>

  <section id="mobile-flow-support">
    <h3>Flow 2 — Support Inbox</h3>
    <ol class="flow-steps">
      <li>
        <span class="step-num step-mobile">1</span>
        <div>
          <strong>الكل (All) tab:</strong> call <strong>GET /api/v1/inbox</strong> — returns both
          chat and support conversations merged and sorted by <code>lastMessageAt DESC</code>.
          Use <code>source</code> on each item to route the tap action.<br>
          <strong>الدعم الفني (Support) tab:</strong> call <strong>GET /complaints/support/active</strong> —
          returns only support conversations. Optionally pass <code>?status=IN_PROGRESS</code> for
          active chats only.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">2</span>
        <div>
          Render each <code>UnifiedInboxItem</code> as an inbox row — both endpoints return the same
          shape. Show <code>lastMessagePreview</code>, format <code>lastMessageAt</code>, and display
          an unread badge if <code>unreadCount &gt; 0</code>. Render the support avatar as a generic
          support icon since <code>otherParticipant.id</code> is <code>null</code>.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">3</span>
        <div>
          When the user taps a row with <code>source === "support"</code>, first call
          <strong>GET /complaints/:id</strong> to get <code>chatAvailable</code> and
          <code>chatClosedReason</code>, then call <strong>GET /complaints/:id/messages?limit=20</strong>
          to load the message history.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">4</span>
        <div>
          Connect to <strong>/complaint-chat WebSocket</strong>. The server automatically joins
          the user to their IN_PROGRESS complaint rooms on connection.
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">5</span>
        <div>
          When the user opens a conversation, emit <code>complaint:message:read</code> to reset
          <code>unreadCount</code> to 0. Update the inbox badge immediately (optimistic).
        </div>
      </li>
      <li>
        <span class="step-num step-mobile">6</span>
        <div>
          Listen for: <code>complaint:message:new</code> (append message),
          <code>complaint:closed</code> (disable input + show resolution),
          <code>complaint:conversation:closed</code> (disable input),
          <code>complaint:typing:start/stop</code> (typing indicator),
          <code>force:logout</code> (account suspended or token revoked).
        </div>
      </li>
    </ol>
  </section>

  <hr>

  <!-- ═══════════════════════════════
       ADMIN — SECTION BANNER
  ════════════════════════════════ -->
  <div class="section-banner banner-admin" id="admin-section">
    🖥 Admin — Web Dashboard
  </div>
  <p style="color:var(--sub);font-size:13px;margin-bottom:24px;">
    All endpoints in this section require an <strong>Admin JWT</strong>.
    These are the endpoints your web dashboard developers will integrate against.
  </p>

  <!-- GET admin complaints list -->
  <section id="admin-list">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/admin/complaints</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Retrieve a paginated, filterable list of all complaints. Use to build the admin complaint queue.
        </p>
        <h4>Query Parameters</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>status</code></td><td>enum</td><td>—</td><td>Filter: <code>UNDER_REVIEW</code>, <code>IN_PROGRESS</code>, <code>RESOLVED</code>, or <code>REJECTED</code></td></tr>
              <tr><td><code>type_id</code></td><td>UUID</td><td>—</td><td>Filter by complaint type UUID</td></tr>
              <tr><td><code>search</code></td><td>string</td><td>—</td><td>Filter by complainant's full name (case-insensitive) or exact complaint UUID</td></tr>
              <tr><td><code>page</code></td><td>number</td><td>1</td><td>Page number</td></tr>
              <tr><td><code>limit</code></td><td>number</td><td>20</td><td>Items per page</td></tr>
            </tbody>
          </table>
        </div>
        <h4>Example Response (200)</h4>
        <pre><code>{
  "success": true,
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "submitter": {
        "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "full_name": "Omar Al-Rashidi"
      },
      "complaint_type": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name_en": "Wrong Item Received",
        "name_ar": "استلام منتج خاطئ"
      },
      "status": "UNDER_REVIEW",
      "description_preview": "I received the wrong item. Order #12345...",
      "adminUnreadCount": 2,
      "lastMessage": {
        "content": "I still have not received my order.",
        "messageType": "TEXT",
        "createdAt": "2024-06-15T10:35:00.000Z",
        "isRead": false
      },
      "created_at": "2024-06-15T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 }
}</code></pre>
      </div>
    </div>
  </section>

  <!-- GET admin complaint detail -->
  <section id="admin-get-one">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Retrieve the full admin view of a complaint. Includes the complete message thread,
          internal notes, and audit activity log. Use when opening a complaint detail page.
        </p>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint does not exist</td></tr>
              <tr><td><code>UNAUTHORIZED</code></td><td>401</td><td>Missing or expired admin JWT</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- PATCH start -->
  <section id="admin-start">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/start</span>
        <span class="badge badge-204" style="margin-left:auto;">204 No Content</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Start investigating a complaint. Transitions status from UNDER_REVIEW to IN_PROGRESS.
          This activates the chat thread — the user will receive a <code>complaint:status:updated</code>
          socket event and a push notification.
        </p>
        <div class="warn">
          <strong>No body required.</strong> This is a state transition endpoint. A 204 response means success.
        </div>
        <h4>Side effects</h4>
        <ul>
          <li>Status transitions: UNDER_REVIEW → IN_PROGRESS</li>
          <li>Emits <code>complaint:status:updated</code> to the user's socket</li>
          <li>Sends push notification (FCM) to the user</li>
          <li>User's socket is joined to <code>complaint:{id}</code> room if connected</li>
        </ul>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint does not exist</td></tr>
              <tr><td><code>COMPLAINT_ALREADY_CLOSED</code></td><td>409</td><td>Complaint is not in UNDER_REVIEW state (already IN_PROGRESS, RESOLVED, or REJECTED)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- PATCH resolve -->
  <section id="admin-resolve">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/resolve</span>
        <span class="badge badge-204" style="margin-left:auto;">204 No Content</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Mark a complaint as RESOLVED with a note that is visible to the user.
          Can be called from either UNDER_REVIEW or IN_PROGRESS status.
          Automatically closes the chat conversation and notifies the user.
        </p>
        <h4>Request Body</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraints</th></tr></thead>
            <tbody>
              <tr>
                <td><code>resolution_note</code></td><td>string</td>
                <td><span class="tag tag-req">required</span></td>
                <td>1–1000 chars</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre><code>PATCH /api/v1/admin/complaints/d4e5f6a7-b8c9-0123-def0-234567890123/resolve
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "resolution_note": "We have investigated this complaint and confirmed the wrong item was sent. A replacement has been dispatched. We apologize for the inconvenience."
}</code></pre>
        <h4>Side effects</h4>
        <ul>
          <li>Status → RESOLVED</li>
          <li>Conversation closed, <code>resolution_note</code> saved (admin-only)</li>
          <li>Emits <code>complaint:closed</code> with <code>status: "resolved"</code></li>
          <li>Sends push notification to user</li>
        </ul>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint not found</td></tr>
              <tr><td><code>(conflict)</code></td><td>409</td><td>Complaint is already RESOLVED or REJECTED</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- PATCH reject -->
  <section id="admin-reject">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/reject</span>
        <span class="badge badge-204" style="margin-left:auto;">204 No Content</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Mark a complaint as REJECTED. Same rules as resolve, but sets status to REJECTED.
          The <code>rejection_reason</code> is saved as the <code>resolution_note</code> field
          (admin-only — not returned in user-facing endpoints).
        </p>
        <h4>Request Body</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraints</th></tr></thead>
            <tbody>
              <tr>
                <td><code>rejection_reason</code></td><td>string</td>
                <td><span class="tag tag-req">required</span></td>
                <td>1–1000 chars</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h4>Side effects</h4>
        <ul>
          <li>Status → REJECTED</li>
          <li>rejection_reason saved as resolution_note (admin-only)</li>
          <li>Emits <code>complaint:closed</code> with <code>status: "rejected"</code></li>
          <li>Sends push notification to user</li>
        </ul>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint not found</td></tr>
              <tr><td><code>(conflict)</code></td><td>409</td><td>Complaint is already RESOLVED or REJECTED</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- POST add note -->
  <section id="admin-add-note">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/notes</span>
        <span class="badge badge-201" style="margin-left:auto;">201 Created</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Add an internal admin note to a complaint. Notes are <strong>never visible to users</strong> — they are for internal team use only.
          Allowed when status is UNDER_REVIEW or IN_PROGRESS.
        </p>
        <div class="warn">
          <strong>Internal only.</strong> Notes are completely invisible to the complainant.
          Do not use notes to communicate with users — use <code>complaint:message:send</code> via WebSocket instead.
        </div>
        <h4>Request Body</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraints</th></tr></thead>
            <tbody>
              <tr><td><code>note</code></td><td>string</td><td><span class="tag tag-req">required</span></td><td>1–5000 chars</td></tr>
            </tbody>
          </table>
        </div>
        <h4>Example Response (201)</h4>
        <pre><code>{
  "success": true,
  "data": {
    "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "adminName": "Sara Al-Otaibi",
    "note": "User has a history of similar complaints. Escalating to senior team.",
    "createdAt": "2024-06-15T11:00:00.000Z"
  },
  "meta": { "version": "1.0.0" }
}</code></pre>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint not found</td></tr>
              <tr><td><code>(conflict)</code></td><td>409</td><td>Complaint is already RESOLVED or REJECTED</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- GET notes -->
  <section id="admin-get-notes">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-get">GET</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/notes</span>
        <span class="badge badge-200" style="margin-left:auto;">200 OK</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Retrieve all internal notes for a complaint in chronological order.
          Notes are <strong>not</strong> included in the complaint detail endpoint by default —
          call this endpoint separately when the admin opens the Notes tab.
        </p>
        <h4>Example Response (200)</h4>
        <pre><code>{
  "success": true,
  "data": [
    {
      "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
      "adminName": "Sara Al-Otaibi",
      "note": "User has a history of similar complaints. Escalating to senior team.",
      "createdAt": "2024-06-15T11:00:00.000Z"
    }
  ],
  "meta": { "version": "1.0.0" }
}</code></pre>
      </div>
    </div>
  </section>

  <!-- POST notify -->
  <section id="admin-notify">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-post">POST</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/notify</span>
        <span class="badge badge-204" style="margin-left:auto;">204 No Content</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Send a custom push notification to the complainant. Available regardless of complaint status.
          Useful for proactive updates ("We need more information from you").
        </p>
        <div class="note">
          <strong>This is a push notification, not a chat message.</strong> The message is delivered
          via FCM to the user's device, not appended to the chat thread.
        </div>
        <h4>Request Body</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Constraints</th></tr></thead>
            <tbody>
              <tr><td><code>message</code></td><td>string</td><td><span class="tag tag-req">required</span></td><td>1–500 chars</td></tr>
            </tbody>
          </table>
        </div>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint not found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- PATCH close conversation -->
  <section id="admin-close-conv">
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/v1/admin/complaints/:id/close-conversation</span>
        <span class="badge badge-204" style="margin-left:auto;">204 No Content</span>
      </div>
      <div class="endpoint-body">
        <p class="endpoint-desc">
          Close the chat thread <strong>without changing the complaint status</strong>. The complaint
          remains IN_PROGRESS (or UNDER_REVIEW) but the chat is disabled. Emits
          <code>complaint:conversation:closed</code> to all sockets in the complaint room.
        </p>
        <div class="note">
          <strong>No body required.</strong> Use this when you want to end the chat dialog but keep the
          complaint open for further internal processing before resolving or rejecting.
        </div>
        <h4>Errors</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>HTTP</th><th>When</th></tr></thead>
            <tbody>
              <tr><td><code>RESOURCE_NOT_FOUND</code></td><td>404</td><td>Complaint not found</td></tr>
              <tr><td><code>(conflict/unprocessable)</code></td><td>409 / 422</td><td>Conversation is already closed</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Admin Schemas ── -->
  <h2>Admin Response Schemas</h2>

  <section id="admin-schema-list-item">
    <h3>ComplaintAdminListItem</h3>
    <div class="schema-block">
<span class="schema-key">id</span>:                    <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">submitter</span>: <span class="schema-type">{</span>
  <span class="schema-key">id</span>:         <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
  <span class="schema-key">full_name</span>:  <span class="schema-type">string | null</span>
<span class="schema-type">}</span>
<span class="schema-key">complaint_type</span>: <span class="schema-type">{</span>
  <span class="schema-key">id</span>:       <span class="schema-type">string</span>
  <span class="schema-key">name_en</span>: <span class="schema-type">string</span>
  <span class="schema-key">name_ar</span>: <span class="schema-type">string</span>
<span class="schema-type">}</span>
<span class="schema-key">status</span>:                 <span class="schema-enum">"UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"</span>
<span class="schema-key">description_preview</span>:   <span class="schema-type">string</span>
<span class="schema-key">adminUnreadCount</span>:      <span class="schema-type">number</span>  <span class="schema-note">// unread user messages for the admin; 0 when all read</span>
<span class="schema-key">lastMessage</span>: <span class="schema-type">{</span>
  <span class="schema-key">content</span>:     <span class="schema-type">string</span>  <span class="schema-note">// first 120 chars of the most recent message</span>
  <span class="schema-key">messageType</span>: <span class="schema-enum">"TEXT" | "IMAGE"</span>
  <span class="schema-key">createdAt</span>:   <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
  <span class="schema-key">isRead</span>:      <span class="schema-type">boolean</span>  <span class="schema-note">// true when adminUnreadCount === 0</span>
<span class="schema-type">} | null</span>  <span class="schema-note">// null when no messages have been sent yet</span>
<span class="schema-key">created_at</span>:             <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
  </section>

  <section id="admin-schema-detail">
    <h3>ComplaintAdminDetail</h3>
    <div class="schema-block">
<span class="schema-key">id</span>:                    <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">submitter</span>: <span class="schema-type">{</span>
  <span class="schema-key">id</span>:             <span class="schema-type">string</span>
  <span class="schema-key">full_name</span>:      <span class="schema-type">string | null</span>
  <span class="schema-key">phone_number</span>:   <span class="schema-type">string | null</span>
<span class="schema-type">}</span>
<span class="schema-key">complaint_type</span>: <span class="schema-type">{ id, name_en, name_ar }</span>
<span class="schema-key">status</span>:                 <span class="schema-enum">"UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"</span>
<span class="schema-key">description</span>:           <span class="schema-type">string</span>
<span class="schema-key">attachment_urls</span>:        <span class="schema-type">string[]</span>
<span class="schema-key">notes</span>:                  <span class="schema-type">ComplaintNoteItem[]</span>  <span class="schema-note">// internal admin notes — never visible to user</span>
<span class="schema-key">activities</span>:             <span class="schema-type">ComplaintActivityItem[]</span>  <span class="schema-note">// audit trail</span>
<span class="schema-key">resolution_note</span>:       <span class="schema-type">string | null</span>
<span class="schema-key">resolved_by</span>:           <span class="schema-type">string | null</span>  <span class="schema-note">// UUID of admin who resolved/rejected</span>
<span class="schema-key">resolved_at</span>:           <span class="schema-type">string | null</span>  <span class="schema-note">// ISO8601</span>
<span class="schema-key">conversation_closed</span>:   <span class="schema-type">boolean</span>
<span class="schema-key">messages</span>:               <span class="schema-type">ComplaintMessageAdmin[]</span>  <span class="schema-note">// full thread — same unified shape as mobile</span>
<span class="schema-key">created_at</span>:             <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
<span class="schema-key">updated_at</span>:             <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
  </section>

  <section id="admin-schema-note">
    <h3>ComplaintNoteItem</h3>
    <div class="schema-block">
<span class="schema-key">id</span>:           <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">adminName</span>:     <span class="schema-type">string</span>  <span class="schema-note">// Full name of the admin who wrote the note</span>
<span class="schema-key">note</span>:          <span class="schema-type">string</span>
<span class="schema-key">createdAt</span>:     <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
  </section>

  <section id="admin-schema-activity">
    <h3>ComplaintActivityItem</h3>
    <p>Immutable audit trail. Every significant action appends a row.</p>
    <div class="schema-block">
<span class="schema-key">id</span>:           <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">actor_type</span>:   <span class="schema-enum">"admin" | "system"</span>
<span class="schema-key">actor_id</span>:     <span class="schema-type">string | null</span>  <span class="schema-note">// UUID — null for system actions</span>
<span class="schema-key">action</span>:        <span class="schema-type">string</span>  <span class="schema-note">// see values below</span>
<span class="schema-key">metadata</span>:      <span class="schema-type">object | null</span>  <span class="schema-note">// action-specific data</span>
<span class="schema-key">created_at</span>:   <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
    <h4>Action Values</h4>
    <div class="table-wrap">
      <table>
        <thead><tr><th>action</th><th>Triggered by</th></tr></thead>
        <tbody>
          <tr><td><code>started_investigation</code></td><td>Admin calls PATCH /start</td></tr>
          <tr><td><code>resolved</code></td><td>Admin calls PATCH /resolve</td></tr>
          <tr><td><code>rejected</code></td><td>Admin calls PATCH /reject</td></tr>
          <tr><td><code>added_note</code></td><td>Admin calls POST /notes</td></tr>
          <tr><td><code>sent_notification</code></td><td>Admin calls POST /notify</td></tr>
          <tr><td><code>closed_conversation</code></td><td>Admin calls PATCH /close-conversation</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section id="admin-schema-message">
    <h3>ComplaintMessageAdmin</h3>
    <div class="schema-block">
<span class="schema-key">id</span>:           <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">sender</span>:       <span class="schema-enum">"USER" | "ADMIN"</span>
<span class="schema-key">senderId</span>:     <span class="schema-type">string</span>  <span class="schema-note">// UUID</span>
<span class="schema-key">messageType</span>:  <span class="schema-enum">"TEXT" | "IMAGE"</span>
<span class="schema-key">content</span>:      <span class="schema-type">string | null</span>  <span class="schema-note">// null for image-only messages</span>
<span class="schema-key">imageUrl</span>:     <span class="schema-type">string | null</span>  <span class="schema-note">// pre-uploaded URL; null for TEXT messages</span>
<span class="schema-key">status</span>:       <span class="schema-enum">"SENT" | "DELIVERED" | "READ"</span>
<span class="schema-key">deliveredAt</span>:  <span class="schema-type">string | null</span>  <span class="schema-note">// ISO8601</span>
<span class="schema-key">readAt</span>:       <span class="schema-type">string | null</span>  <span class="schema-note">// ISO8601</span>
<span class="schema-key">isMe</span>:         <span class="schema-type">boolean</span>  <span class="schema-note">// true when sent by the authenticated admin</span>
<span class="schema-key">createdAt</span>:    <span class="schema-type">string</span>  <span class="schema-note">// ISO8601</span>
    </div>
  </section>

  <hr>

  <!-- ── Admin WebSocket ── -->
  <h2 id="admin-ws-overview">Admin WebSocket — <code>/complaint-chat</code> Namespace</h2>

  <section>
    <h3>Connection &amp; Room</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Detail</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Namespace</td><td><code>/complaint-chat</code> (same as mobile)</td></tr>
          <tr><td>Auth</td><td>Admin JWT via <code>socket.handshake.auth.token</code></td></tr>
          <tr><td>Permission required</td><td><code>VIEW_COMPLAINTS</code> permission (or <code>is_super_admin = true</code>). Connection is rejected with <code>FORBIDDEN</code> if not present.</td></tr>
          <tr><td>On connect (admin)</td><td>Server joins admin to the <code>admin-complaints</code> room — receives ALL complaint events across ALL complaints</td></tr>
          <tr><td>Complaint-specific rooms</td><td>Admin does NOT need to know specific complaintIds — events arrive via <code>admin-complaints</code> room</td></tr>
        </tbody>
      </table>
    </div>

    <div class="note">
      <strong>Admin room routing:</strong> Unlike users (who are only in their own complaint rooms),
      admins receive every complaint event via the shared <code>admin-complaints</code> room.
      Use <code>data.complaintId</code> from each event to route the update to the correct UI component
      or active complaint view.
    </div>

    <h4>Admin Connection Example</h4>
    <pre><code>import { io } from 'socket.io-client';

const socket = io('https://api.bidmart.sa/complaint-chat', {
  auth: { token: adminJwt },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Admin connected to complaint-chat');
  // Admin auto-joins admin-complaints room on server side
});

// Route all complaint events by complaintId
socket.on('complaint:message:new', (data) => {
  routeToComplaintView(data.complaintId, data);
});

socket.on('complaint:status:updated', (data) => {
  updateComplaintStatus(data.complaintId, data.status);
  refreshComplaintList();
});</code></pre>
  </section>

  <section id="admin-ws-events">
    <h3>Events (same as Mobile)</h3>
    <p>
      The admin uses the <strong>same Client → Server and Server → Client events</strong> as the mobile
      client. All event names, payload shapes, and behavior are identical. Key differences:
    </p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Aspect</th><th>Mobile (User)</th><th>Admin</th></tr></thead>
        <tbody>
          <tr>
            <td>Rooms joined on connect</td>
            <td>All user's IN_PROGRESS complaint rooms (<code>complaint:{id}</code>)</td>
            <td><code>admin-complaints</code> — receives all complaint events</td>
          </tr>
          <tr>
            <td><code>complaint:message:send</code> payload</td>
            <td>Same</td>
            <td>Same — server detects admin vs user from JWT and sets <code>sender: "admin"</code></td>
          </tr>
          <tr>
            <td>Receiving events</td>
            <td>Only events for own complaints</td>
            <td>Events for ALL complaints in the system</td>
          </tr>
          <tr>
            <td>New complaint submitted (no socket event)</td>
            <td>N/A</td>
            <td>Delivered via FCM push notification only — poll or refresh list on notification tap</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4>Sending a Chat Message as Admin</h4>
    <pre><code>// Text
socket.emit('complaint:message:send', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
  message: 'We have reviewed your complaint. Could you provide the order number?',
});

// Image
socket.emit('complaint:message:send', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
  messageType: 'IMAGE',
  imageUrl: 'https://cdn.bidmart.sa/uploads/screenshot.jpg',
});</code></pre>

    <h4>Marking Messages as Read (Admin)</h4>
    <p>
      Emit when the admin opens a complaint chat view. Marks all unread user messages as READ
      and notifies the user via <code>complaint:messages:read</code>. Same event name as mobile.
    </p>
    <pre><code>socket.emit('complaint:message:read', {
  complaintId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
});</code></pre>
  </section>

  <hr>

  <!-- ── Admin Flows ── -->
  <h2>Admin Typical Flows</h2>

  <section id="admin-flow-handle">
    <h3>Flow 1 — Handle a New Complaint</h3>
    <ol class="flow-steps">
      <li>
        <span class="step-num step-admin">1</span>
        <div>
          <strong>GET /admin/complaints?status=UNDER_REVIEW</strong> — load the incoming complaint queue.
          Sort by <code>created_at</code> ascending to handle oldest first.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">2</span>
        <div>
          Click a complaint → <strong>GET /admin/complaints/:id</strong> — load full detail.
          Review description, attachments, submitter info, and message thread.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">3</span>
        <div>
          Optionally <strong>POST /admin/complaints/:id/notes</strong> — add internal notes visible
          only to the admin team. These are never shown to the user.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">4</span>
        <div>
          <strong>PATCH /admin/complaints/:id/start</strong> — begin investigation.
          The user is notified via socket + push. Chat thread becomes active.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">5</span>
        <div>
          Use <strong>complaint:message:send</strong> via WebSocket to communicate with the user
          in real time. Both sides see messages via <code>complaint:message:new</code>.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">6</span>
        <div>
          When investigation is complete, choose one of:
          <ul style="margin-top:6px;">
            <li><strong>PATCH /admin/complaints/:id/resolve</strong> — complaint resolved, provide note for user</li>
            <li><strong>PATCH /admin/complaints/:id/reject</strong> — complaint rejected, provide reason for user</li>
            <li><strong>PATCH /admin/complaints/:id/close-conversation</strong> — end chat without closing complaint</li>
          </ul>
        </div>
      </li>
    </ol>
  </section>

  <section id="admin-flow-realtime">
    <h3>Flow 2 — Real-time Admin Dashboard</h3>
    <ol class="flow-steps">
      <li>
        <span class="step-num step-admin">1</span>
        <div>
          On dashboard mount, connect to <strong>/complaint-chat WebSocket</strong> with the admin JWT.
          The server automatically joins the admin to the <code>admin-complaints</code> room.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">2</span>
        <div>
          All complaint events across the entire system are delivered to this room.
          Listen for <code>complaint:message:new</code>, <code>complaint:status:updated</code>,
          <code>complaint:closed</code>, <code>complaint:conversation:closed</code>,
          <code>complaint:message:status</code> (delivery/read receipts for admin-sent messages),
          and <code>complaint:messages:read</code> (user read all your messages).
        </div>
      </li>
      <li>
        <span class="step-num step-admin">3</span>
        <div>
          Use <code>data.complaintId</code> from each event to route updates to the correct
          complaint view or show a badge notification in the queue list.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">4</span>
        <div>
          <strong>New complaint submitted:</strong> There is no socket event for new submissions.
          Admins receive an FCM push notification. On notification tap, refresh the
          GET /admin/complaints?status=UNDER_REVIEW list.
        </div>
      </li>
      <li>
        <span class="step-num step-admin">5</span>
        <div>
          For typing indicators across multiple concurrent complaint views, use
          <code>complaint:typing:start</code> and <code>complaint:typing:stop</code> events,
          routing by <code>actorId</code> and the complaintId context.
        </div>
      </li>
    </ol>
  </section>

</main>
</body>
</html>`;
