# FundMe review — 20 October 2026

## Confirmed and repaired

- AI outage handling fabricated a profile from source labels and raw text. Removed that fallback. Failures now leave the profile unchanged and return a useful error.
- Old Groq and OpenRouter model IDs no longer supported generation. Replaced the defaults using the live model catalog and added configurable model names and request timeouts.
- A key-file fallback could return the first line for the wrong provider. Missing named keys now return empty.
- Website extraction concatenated blocks and removed “active” inside words. It now preserves block boundaries and removes only whole call-to-action phrases.
- Profile enhancement overwrote existing fields despite claiming to preserve them. Added a field-by-field current/suggested review with explicit selection, apply, and discard.
- Profile-load errors looked like empty profiles. Editing is now blocked when loading fails.
- Profile PUT now reads the record back before reporting success.
- Opportunity matching received missing description/sector values due to frontend normalization. Corrected the mapping.
- Frontend defaulted to a specific remote deployment. Default is now same-origin, with a configurable backend URL for local development or split hosting.
- PDF parsing now uses the installed v2 API and releases parser resources.

## Verification

- Production frontend build passed.
- Backend syntax checks passed.
- Test PDF yielded 5,885 characters of plain text.
- Exact Maker URL returned HTTP 200 with startup_name “Maker” and a concise overview via the repaired generation endpoint.
- Groq generation returned 403 for currently listed models; account-level model listing succeeded. Groq project permissions still need attention.
- Two free OpenRouter models were rate limited; the third generated the Maker profile. Free-provider availability remains variable.
- No existing founder record was overwritten during these tests.

## Additional protections implemented

- Added signed, expiring login sessions while preserving existing accounts. Private routes require a session and enforce account identity; individual draft, application, document, and saved-item routes check ownership.
- Web app, eligibility checks, and Smart Apply now carry the session. Settings updates retain it. Reload the unpacked extension after these changes.
- Express async route failures now reach a centralized error handler.
- Website detail requests reject private IP destinations and unsafe schemes, validate redirects, resolve public IPv4 addresses through dedicated HTTP agents, and cap response size.
- API checks returned 401 for an unauthenticated profile request, 200 for the owning account, and 403 for a conflicting account.
- Configure SESSION_SECRET in deployment. Without it, a local backend restart signs users out.

## Remaining deployment checks

1. Exercise all account flows in a browser, including Smart Apply with the reloaded extension. Add session revocation, login rate limiting, and deployment secret rotation procedures before public production.
2. Audit the other scraper functions and extension-derived URLs for equivalent public-network restrictions.
3. Verify detailed error handling on upload and database-failure paths.
4. The SQL baseline uses CREATE TABLE IF NOT EXISTS; this does not migrate existing tables. Add versioned migrations and verify the real deployed schema.
5. Password recovery remains unimplemented. The UI describes this limitation.
6. Opportunity “verified” currently derives from presence of a credibility-source field, not an independently completed verification process. The label needs a clearer evidence contract.

## Next acceptance checks

- Dedicated test accounts: signup, login, authorization isolation, save profile, reload, and login again.
- Profile suggestions: discard keeps existing values; selected-only apply; failed generation preserves all edits.
- Upload: text PDF, scanned PDF, invalid file, and oversized file.
- Dashboard and draft flow using a persisted profile.
- Production staging smoke test with secrets configured and a single canonical frontend/backend address.

This is a focused code and API review, not certification that every platform feature is production-ready.
