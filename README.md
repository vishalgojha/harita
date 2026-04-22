# HaritaDocs

HaritaDocs is a Next.js 14 + Supabase SaaS for IGBC Green Interiors certification document collection, validation, and submission packaging. It is built around the real CCIL documentation tracker and the IGBC Green Interiors v2 reference guide supplied for this build.

## Stack

- Next.js 14 App Router
- Supabase Auth, Postgres, Storage, Realtime-compatible notifications
- Tailwind CSS + shadcn-style component structure
- XLSX export via `xlsx`
- ZIP submission pack via `jszip`
- PDF summary via `pdf-lib`

## Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` for `npm run seed`
4. Apply `supabase/migrations/0001_initial.sql`
5. Run `npm run dev`

Without env vars, the app falls back to a seeded demo workspace so UI review still works locally.

## Database notes

- The seeded IGBC catalog lives in [data/igbc-green-interiors-v2.json](/C:/Users/visha/harita/data/igbc-green-interiors-v2.json)
- The credit matrix is derived from the CCIL tracker workbook you provided, not hand-entered
- The tracker source produces 47 seeded rows including mandatory requirements, which differs from the original 42-credit note in the prompt

## Seed command

`npm run seed -- "HaritaDocs Seed Project" Gold <owner-user-id>`

- Creates a test project
- Seeds the full credit catalog
- Optionally adds one owner membership if a Supabase `auth.users.id` is provided

## Features

- `/login` email/password auth with demo fallback
- `/dashboard` project portfolio, KPIs, and project creation
- `/projects/[id]` consultant and owner workspace with document checklist, approvals, remarks, blocking, and owner upload flow
- `/projects/[id]/submission` completed-credit view and submission ZIP generation
- `/api/projects/[id]/tracker` CCIL-style XLSX export
- `/api/projects/[id]/summary` PDF summary export
- `/api/projects/[id]/submission-pack` ZIP export of approved documents
