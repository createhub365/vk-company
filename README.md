# VK AND COMPANY courier operations website

A production-oriented Next.js application for domestic and international courier enquiries. It joins a premium public website and procedural 3D dispatch experience to an owner-only Supabase operations area for enquiries, quotes, bookings, manual shipments, verified tracking events and support.

## What is implemented

- Public pages: home, domestic, international, quote request, tracking, about, contact, FAQ, privacy-review slot and terms-review slot.
- A procedural React Three Fiber dispatch scene with a branded truck, loading dock, conveyor, parcels, road, domestic buildings and international plane transition.
- One reversible GSAP/ScrollTrigger sequence; demand rendering, viewport lazy loading, DPR cap, reduced-motion control and a static no-WebGL/loading fallback.
- Direct, server-validated Quote SMTP emails with bounded in-memory rate limits and duplicate-click protection. Contact uses [FormSubmit AJAX](CONTACT_FORMSUBMIT.md) with manual inbox activation. Neither form requires Supabase or creates application database records.
- A secure expiring quote link. GET displays the relevant offer only; POST acceptance is transactional and idempotent.
- Separate enquiry, quote, booking, shipment, pickup and payment states.
- Owner-only administration with real dashboard counts, enquiry review/notes, itemized quotes, bookings, shipment creation, manual tracking events, support, content, settings and audit views.
- Nodemailer SMTP sending to the official receiving inbox; see [email integration and setup](EMAIL_INTEGRATION.md) for required server settings and delivery limitations.
- Supabase RLS that denies anonymous access to operational tables. Privileged server routes authenticate and authorize the owner before each admin mutation.
- Versioned migrations, development-only seed, unit tests and Playwright setup.

## Prerequisites

- Node.js 22 or another version supported by the pinned Next.js release.
- npm.
- SMTP credentials and an authorized sender for Quote; manual FormSubmit activation for Contact (no credentials required).
- A Supabase project, or the Supabase CLI and Docker, for admin/tracking and existing database workflows only.

## Local development

```bash
npm install
cp -n .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Configure SMTP for Quote and follow [manual FormSubmit activation](CONTACT_FORMSUBMIT.md) for Contact. Supabase is not required for those forms. Preserve any existing `.env.local` and edit only the needed settings. Admin/tracking still require Supabase.

## Database setup

With the Supabase CLI linked to a development project:

```bash
supabase db push
```

For a clean local Supabase instance:

```bash
supabase start
supabase db reset
```

Copy the project URL, publishable key and service-role key into `.env.local`. The service-role key is server-only and must never use a `NEXT_PUBLIC_` prefix.

### Secure owner bootstrap

There is no public admin registration, default password or “first user becomes owner” flow.

1. In Supabase Authentication, explicitly create the intended owner account and verify its email using the provider's secure dashboard/administrative process.
2. Copy that exact Auth user UUID.
3. In the Supabase SQL editor, substitute the explicit UUID and run:

```sql
insert into public.admin_users (auth_user_id, role, active)
values ('EXPLICIT-AUTH-USER-UUID', 'owner', true);
```

4. Record this bootstrap in the business change log and sign in at `/admin/login`.

Do not expose the service-role key, add an anonymous insert policy to `admin_users`, or infer ownership from editable user metadata.

## Workflow

1. Quote submissions await SMTP acceptance and receive an email reference. Contact submissions await FormSubmit's AJAX response and report acceptance for processing. Neither response confirms inbox delivery or automatically adds a record to the admin enquiry/support lists.
2. For existing database enquiries, the owner can still record internal review notes and create itemized quotes. Integer minor units and server-side calculation avoid floating-point money errors.
3. The generated `/quote/<secure-token>` path can be shared through an approved configured channel. Raw tokens are never stored—only SHA-256 hashes.
4. Acceptance uses POST. The database transaction rejects expired, revoked or superseded offers and creates at most one booking.
5. The owner creates a manual shipment from the booking and records verified tracking events. Customers use only the separate `VKC-…` public code.

## Commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm start
```

The build script uses Next.js' supported webpack builder because this managed workspace blocks an internal port used by the default Turbopack CSS worker. The resulting production application is otherwise unchanged.

Database policy/integration tests require an actual configured local Supabase instance. Static unit tests verify the critical policy/function definitions, but are not a substitute for running the migrations against PostgreSQL.

## Business configuration checklist

The following details were not supplied and are deliberately not invented or published:

- [x] Original logo supplied and preserved at `public/brand/vk-and-company-logo-original.jpeg`; required PNG copy added at `public/brand/vk-and-company-logo.png`
- [ ] Registered/legal business name, if different
- [ ] Address and approved map URL
- [ ] Phone number
- [ ] WhatsApp number and approval to display a normal contact link
- [ ] Email address
- [ ] Operating hours
- [ ] Pickup availability and coverage
- [ ] Courier partners and approved partner tracking URL patterns
- [ ] Service coverage and route constraints
- [ ] Approved rate cards, if an instant calculator is ever desired
- [ ] Reviewed privacy notice and service terms

Unconfigured direct contact buttons, map links, pickup requests and integrations stay hidden or disabled.

## Integrations and boundaries

- **Working after Supabase setup:** PostgreSQL persistence, Supabase Auth, RLS, owner administration, manual shipment tracking and durable outbox records.
- **Not configured:** live email delivery, WhatsApp/SMS automation, courier partner APIs, official partner tracking URLs and online payments.
- **Payment boundary:** bookings contain owner-controlled manual verification fields. Customer evidence must never automatically mark a payment as verified.
- **Pickup boundary:** schema and states exist, but the feature is disabled until settings and operational coverage are confirmed. A request does not equal a confirmed appointment.

## Deployment checklist

- [ ] Add the exact environment variables to the deployment platform; keep the service-role key server-only.
- [ ] Apply all three migrations to the intended database and test RLS with anonymous, authenticated non-owner and owner sessions.
- [ ] Bootstrap only the explicitly approved owner Auth UUID.
- [x] Add the original logo asset and verify its proportions.
- [ ] Enter and verify business contacts, hours and address.
- [ ] Have approved privacy and terms content reviewed before allowing indexing.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the confirmed HTTPS domain and verify sitemap/robots output.
- [ ] Configure authenticated SMTP for Quote and manually activate FormSubmit for Contact; verify live sending only when authorized. Review the protection and limitations in `EMAIL_INTEGRATION.md` and `CONTACT_FORMSUBMIT.md`.
- [ ] Keep pickup, payments and partner links disabled until their requirements and credentials are approved.
- [ ] Run typecheck, lint, unit, database policy, build and browser test suites in the deployment environment.
- [ ] Check rate-limit retention/cleanup and operational backup policies.

## Asset and license notes

The 3D scene is original procedural geometry generated in application code and uses no third-party model or stock media. The supplied 1254 × 1254 JPEG is preserved unchanged at `public/brand/vk-and-company-logo-original.jpeg`. A full-frame PNG copy is used by the website at `public/brand/vk-and-company-logo.png`; no parts were cropped, recoloured or removed.
