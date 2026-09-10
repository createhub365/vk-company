# VK AND COMPANY

Public-only Next.js website prepared for Cloudflare Pages. The existing public
pages, assets and interactions are retained. Contact and Quote submit directly
to FormSubmit; no database, SMTP server, storage service or application API is
needed by this website.

Read [Cloudflare Pages setup and launch blockers](CLOUDFLARE_PAGES.md) for the
build command, output, environment setting and verification instructions.

```sh
npm ci
npm run build
npm start
```

`npm start` previews the exported `out/` directory locally. Use `npm run dev`
only for development. The production origin (`NEXT_PUBLIC_SITE_URL`) is not yet
provided; setting it and rebuilding remains required before launch.

The old admin/API/token workflows and original README are safely preserved in
[the non-public server archive](archive/server-features/RESTORE.md), with original
paths and checksums. They are not part of the deployed route tree. Existing
Supabase migrations are untouched and have not been run.

[Quote FormSubmit details](QUOTE_FORMSUBMIT.md) and
[Contact FormSubmit details](CONTACT_FORMSUBMIT.md) describe enquiry behaviour.
Older server setup references apply only to the archived architecture.
Live inbox delivery remains unverified. No deployment has been performed.
