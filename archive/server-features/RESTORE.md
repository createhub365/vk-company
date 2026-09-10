# Retired server features — not deployed

This directory preserves source from the working `staging` checkout before the
public-only conversion, including existing uncommitted changes. `manifest.json`
lists every original path, SHA-256 hash, and whether it was moved or snapshotted.
No environment files, credentials, database dumps, or customer records were copied.
`previous-HEAD/` contains the tracking sources already deleted before this task;
these are explicitly historical, not the working-tree version.

Admin pages, all API handlers, token quote-review/acceptance pages and supporting
components/libraries were moved out of the route tree before removing `proxy.ts`.
They must never be restored without their authentication and authorization layer.
The original configuration, shared schemas, settings, package manifests and README
are reference snapshots; do not overwrite newer public changes blindly.

To restore in a separately approved server deployment: reconcile each manifest path
with current changes; restore routes, auth/Proxy, dependencies and server libraries
together; disable static export; restore the appropriate runtime headers; configure
credentials securely outside this archive; re-enable and run the archived tests.
Test ownership checks on every protected page/API before making it accessible.
Nothing here authorizes a database migration. Existing `supabase/` SQL remains
untouched at the repository root and is not copied to the exported website.

Tests archived exclusively for retired features: notifications.test.ts (legacy
SMTP APIs), security.test.ts and tests/sql (database contracts). The full original
mixed core/image-feedback/visual/public tests are snapshots: active public tests
remain; only money/token integrity and admin-specific assertions were retired.
The tracking regression now checks the approved static company-contact replacement.
The public FormSubmit, validation, design, hero and image-feedback regressions remain
active. Archived code is excluded from TypeScript, ESLint and active test discovery.
