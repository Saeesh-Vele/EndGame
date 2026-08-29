# StayVilla

A directory of handpicked private villas across India. Guests browse verified
properties, send booking requests, and deal with the owner directly — StayVilla
takes no commission and is not a party to the booking.

Built with Next.js 16 (App Router), Supabase (Postgres + Auth + Storage),
Tailwind CSS v4, and Resend for transactional email.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

The app runs at http://localhost:3000.

### Environment

`.env.local.example` documents every variable. The essentials:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon key; RLS is what protects the data |
| `NEXT_PUBLIC_SITE_URL` | no | Absolute origin used to build links inside outgoing email |
| `RESEND_API_KEY` | no | Leave blank in development — sends are skipped with a console warning |
| `RESEND_FROM_EMAIL` | no | `From` address; its domain must be verified in Resend |

### Database

SQL lives in `supabase/`. Run the files in `supabase/migrations/` in order,
then `supabase/seed.sql` for demo villas, destinations, and booking requests.
`supabase/migrations/003_seed_admin.sql` documents how to promote a user to
admin.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |

## Layout

```
src/app/                 routes (App Router)
  admin/                 admin dashboard — villas, bookings, submissions, destinations
  villas/[slug]/         public villa detail
  auth/callback/         Supabase auth redirect handler
src/components/          UI, grouped by feature; ui/ holds the shadcn primitives
src/lib/                 Supabase clients, email templates, shared helpers
src/proxy.ts             route gate (Next 16's renamed middleware)
supabase/                migrations and seed data

Mutations are Server Actions, defined in `actions.ts` beside the route that
uses them.
```

## Access control

Three layers, deliberately redundant:

1. `src/proxy.ts` gates `/admin/*` and `/dashboard/*` before a route renders.
2. Layouts and pages re-check the session at render time.
3. Row Level Security in Postgres rejects unauthorised reads and writes
   regardless of what the app layer does.

## Before launch

Contact details and social handles are centralised in `src/lib/site.ts` and are
still placeholders — see the comments in that file. The legal pages
(`/terms`, `/privacy`, `/cancellation-policy`) are drafts carrying a visible
"not reviewed by a lawyer" notice and need a legal review before you remove it.
