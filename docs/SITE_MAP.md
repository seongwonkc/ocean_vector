# VECTOR Site Map

> Route inventory for the VECTOR web app (ocean_vector).
> Updated as routes are added or retired.
> Last updated: 2026-04-28

---

## Public routes (unauthenticated)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `index.html` | Landing page. Signup CTA, feature highlights, footer with Block 1 privacy note and link to `/about`. |
| `/about` | `about.html` (to be created) | How VECTOR works — product explanation + condensed Block 3 privacy disclosure (Seneca's general knowledge section). Linked from landing page footer. |
| `/login` | `login.html` | Auth entry point. |
| `/signup` | `signup.html` | Account creation. Includes Block 2 checkbox acknowledgment before submit. |
| `/seneca-callback` | `seneca-callback.html` | OAuth callback handler for Seneca link flow. |

---

## Authenticated routes

| Route | File | Purpose | Notes |
|-------|------|---------|-------|
| `/assessment` | `assessment.html` | Main SAT practice session. | Primary product surface. |
| `/profile` | `profile.html` | 3-section student profile: patterns / trajectory / open questions. | MVP feature 6. |
| `/account` | `account.html` (to be created) or section within existing settings | Account management + data controls. | See Account / Settings spec below. |

---

## Account / Settings page spec

**Route:** `/account`

**Sections:**

1. **Profile** — name, email, display preferences (if any)
2. **How VECTOR uses your data** — full Block 3 disclosure copy from
   `docs/PRIVACY_DISCLOSURES.md`. Static copy, not a modal.
3. **Your data**
   - **Export my data** button — calls `seneca-export-data` Netlify function.
     Returns JSON download. Button label: "Export my data".
   - **Delete my account** button — initiates `seneca-generate-delete-token`
     flow (email confirmation step, then `seneca-delete-data`). Button label:
     "Delete my account". Destructive styling (not red by default — calm, not
     alarming, but clearly final).
   - Both buttons visible on the page. Neither in primary nav, onboarding
     flow, or marketing copy.

**Linked functions:**
- `seneca-export-data.js` (existing)
- `seneca-generate-delete-token.js` + `seneca-delete-data.js` (existing)

---

## Netlify function routes (internal)

Not user-facing. Listed for completeness.

| Path | Function | Purpose |
|------|----------|---------|
| `/.netlify/functions/seneca-sdk-gateway` | `seneca-sdk-gateway.js` | SDK ingest endpoint (observe, sessionSignal, linkUser, getUserModel) |
| `/.netlify/functions/seneca-export-data` | `seneca-export-data.js` | Rule 8 data export |
| `/.netlify/functions/seneca-delete-data` | `seneca-delete-data.js` | Account + data deletion |
| `/.netlify/functions/seneca-generate-delete-token` | `seneca-generate-delete-token.js` | Delete flow email confirmation |
| `/.netlify/functions/seneca-generate-link-token` | `seneca-generate-link-token.js` | Seneca↔VECTOR link token mint |
| `/.netlify/functions/seneca-consume-link-redirect` | `seneca-consume-link-redirect.js` | OAuth redirect consumption |
| `/.netlify/functions/seneca-nightly` | `seneca-nightly.js` | Scheduled nightly jobs |
| `/.netlify/functions/seneca-baseline-refresh` | `seneca-baseline-refresh.js` | Background Haiku baseline recompute |
| `/.netlify/functions/seneca-session` | `seneca-session.js` | Session-level API |
| `/.netlify/functions/seneca-scan` | `seneca-scan.js` | Scan endpoint |

---

## Deferred routes (not in MVP sprint)

| Route | Rationale |
|-------|-----------|
| `/leaderboard` or `/compare` | Deferred — requires multi-user session data visibility, out of MVP scope |
| `/mindmeld` | Stretch goal (feature 8), may not ship in 2-week sprint |
| `/trajectory` | Stretch goal (feature 9) |
| Korean-localized routes (`/ko/*`) | Separate track, Q3 with JW |
