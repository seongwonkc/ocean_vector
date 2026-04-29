# VECTOR Privacy Disclosures

> Source of truth for user-facing privacy copy.
> Korean translations: Kevin / JW (separate track, not in this file).
> Last updated: 2026-04-28

---

## Block 1 — Landing page footer note (under signup CTA)

> Your personal data stays yours — exportable and deletable from your account
> any time. The general patterns Seneca learns across many students stay in
> Seneca's general knowledge.

**Placement:** Below the primary signup CTA button, above the footer links.
**Max length:** 2 lines at typical viewport width. Do not expand.

---

## Block 2 — Signup acknowledgment checkbox text

> By creating an account, I understand that VECTOR observes my study behavior
> and uses it to build Seneca's understanding of how I think. My personal
> data is mine — I can export or delete it any time. General patterns Seneca
> learns from many students collectively are not tied to any one person.

**Placement:** Checkbox required before account creation. Checkbox label
only — do not nest sub-bullets or links here. Link "export or delete" to the
Account / Settings page.

**UX note:** This is consent copy, not legalese. Keep it readable.
Legal-grade terms live in the Terms of Service (separate document, not here).

---

## Block 3 — Account / Settings page: full disclosure

**Section heading:** How VECTOR uses your data

---

**Your personal data**

VECTOR observes how you answer questions — which ones you get right, how
long you spend, where you hesitate. This is stored as personal data linked
to your account. It's the raw material Seneca uses to build a picture of how
you think.

This data is yours. You can:
- **Export** all of it at any time — one JSON file with everything Seneca
  knows about your study patterns.
- **Delete** your account and all associated data at any time. Deletion is
  permanent and immediate. We don't retain backups of personal data after
  deletion.

---

**Seneca's general knowledge**

Over time, Seneca identifies patterns that appear across many students — not
your patterns specifically, but patterns that show up in the collective.
For example: students who hesitate on vocabulary-heavy inference questions
tend to benefit from slowing down rather than speeding up.

These general patterns are not tied to you. They're aggregated across a
minimum of 10 students before they become part of Seneca's knowledge, and
they contain no information that identifies any individual. If you delete
your account, your personal data is deleted immediately. Seneca's general
knowledge — built from many students collectively — is not deleted, because
it isn't yours specifically and doesn't contain your data.

This separation is intentional. It's how Seneca gets smarter over time
without holding on to your personal information longer than you want it held.

---

**Export and delete**

Both options are available in Settings. We don't promote them in the main
nav — not because we want to hide them, but because most students never need
them. They're here when you do.

- [Export my data](#) — downloads a JSON file of your personal study data
- [Delete my account](#) — permanently deletes your account and all personal data

---

**Questions**

If you have questions about how VECTOR handles your data, email
[privacy contact TBD] before using the export or delete functions. Korean
students: PIPA Article 36 rights (correction, deletion, suspension of
processing) are supported by the export and delete functions above.

---

## Copy notes for implementation

- Block 3 "Export my data" and "Delete my account" links call the existing
  Netlify functions: `seneca-export-data` and `seneca-generate-delete-token`
  respectively. Wire these on the Account / Settings page.
- Both buttons should be visible in Settings but NOT promoted in primary nav,
  onboarding flow, or marketing copy.
- The `/about` or `/how-it-works` public page should include a condensed
  version of Block 3 (the "Seneca's general knowledge" section at minimum),
  linked from the landing page footer.
- Korean translations of all three blocks needed before Korean student
  onboarding. Do not ship Korean onboarding with English-only disclosure copy.
