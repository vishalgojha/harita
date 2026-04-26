# HaritaDocs

HaritaDocs is a Next.js 14 workspace for IGBC Green Interiors documentation collection, review, and submission packaging. It is built around the real CCIL documentation tracker and the IGBC Green Interiors v2 reference guide supplied for this build.

The current UI is intentionally dense and operational rather than marketing-led:

- A slim dashboard header with KPI strip and inline project creation
- Full-width project rows with quick workspace and submission actions
- A three-column project workspace with category rail, dense credit table, and right-side detail panel
- Plain consultant-facing copy throughout the app

## Fast onboarding

Harita now ships as a public npm package and a local app copy:

- Package name: `harita-studio`
- CLI command: `harita`

Recommended install flow for consultants:

```bash
npm install -g harita-studio
```

Then run `harita` from inside the Harita folder they received.

You can also scaffold a fresh folder directly:

```bash
npx harita-studio
```

What the launcher does:

1. Scaffolds the workspace if you run it in an empty folder
2. Checks that Node.js, npm, and Bun are available
3. Installs dependencies if they are missing
4. Confirms you are signed into Google AI Studio before asking for the Gemini key
5. Prompts for your Gemini API key in masked form and validates it against Google
6. Prompts for your Supabase credentials
7. Writes `.env.local` with live workspace settings
8. Shows a first-time tour of what Harita can do
9. Launches the guided local studio in a Bun-driven terminal UI

The `studio` flow is fixed order. It does not let the user jump ahead or skip a required step.

### Publish to npm

To publish this package to the public npm registry:

```bash
npm login
npm publish --access public
```

The package is now unscoped, so it can be published directly with `npm publish`.

For repeat releases from the repo checkout, you can also run:

```bash
npm run publish:public
```

If you want a private registry instead, add a project `.npmrc` with the registry URL you want to use and publish against that registry.

For a local repo checkout, the same launcher is also available via:

```bash
npm run onboard
```

The command set is:

```bash
harita help
harita doctor
harita init
harita studio
```

On PowerShell shells that block the generated `harita.ps1` shim, run `harita.cmd` instead.

## Stack

- Next.js 14 App Router
- Supabase Auth, Postgres, Storage, Realtime-compatible notifications
- Tailwind CSS + shadcn-style component structure
- XLSX export via `xlsx`
- ZIP submission pack via `jszip`
- PDF summary via `pdf-lib`
- Guided onboarding via a Bun-driven terminal UI with fixed-step commands
- Playwright smoke verification

## Setup

Harita requires a Supabase project for sign-in, uploads, and project data.

1. Install the package globally or run the local launcher
2. Run `harita studio`
3. Enter the Gemini API key
4. Enter the Supabase project URL and anon key
5. Open the app in the generated workspace

If you are developing the app itself, you can still run `npm install` and `npm run dev` directly.
On Windows, `npm run dev` uses a resilient launcher that falls back to `next start` if the raw dev server cannot spawn cleanly. Use `npm run dev:next` if you want to force the plain Next.js dev server.

### Authentication

- Existing users sign in with email and password on `/login`
- New users can create an account from the same screen
- If Supabase email confirmation is enabled, new accounts must confirm once by email before the first sign-in
- The first signed-in user can create the initial workspace and become its owner

## Guided commands

- `harita`
  Runs the fixed-order studio flow.
- `harita studio`
  Runs the same fixed-order studio flow explicitly.
- `harita init`
  Scaffolds the workspace into an empty folder and installs dependencies if you approve.
- `harita doctor`
  Checks Node.js, npm, Bun, `package.json`, `node_modules`, and `.env.local`.
- `npm run onboard`
  Runs the same studio flow from the repo checkout.
- `npm run dev:guided`
  Starts the app, waits for `/login`, opens the browser automatically, and can run the smoke test.
- `npm run smoke`
  Runs the prebuilt Playwright smoke test.

## Database notes

- The seeded IGBC catalog lives in [data/igbc-green-interiors-v2.json](/C:/Users/visha/harita/data/igbc-green-interiors-v2.json)
- The credit matrix is derived from the CCIL tracker workbook you provided, not hand-entered
- The tracker source produces 47 seeded rows including mandatory requirements, which differs from the original 42-credit note in the prompt

## Environment defaults

The studio flow writes the following automatically:

- `GEMINI_API_KEY`
- `AI_PROVIDER=gemini`
- `AI_MODEL=gemini-2.5-flash`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- optional Supabase and project seeding fields for local setup

If the Supabase credentials are missing, the login page shows setup guidance instead of a fallback workspace.

## Seed command

`npm run seed -- "HaritaDocs Seed Project" Gold <owner-user-id>`

- Creates a test project
- Seeds the full credit catalog
- Optionally adds one owner membership if a Supabase `auth.users.id` is provided

## Product surfaces

- `/login`
  Email and password sign-in for the live workspace, with account creation and setup guidance when the live database is not connected.
- `/invite/[token]`
  Accept a project invite after signing in with the invited email address.
- `/dashboard`
  Dense consultant dashboard with KPI strip, inline project creation, and compact project rows.
- `/projects/[id]`
  Three-column workspace with category navigation, dense credit table, status/doc requirement chips, invite management, upload/review actions, and remarks.
- `/projects/[id]/submission`
  Completed-credit submission view with approved document list and ZIP export gating based on mandatory credits.

## Exports

- `/api/projects/[id]/tracker`
  CCIL-style XLSX export.
- `/api/projects/[id]/summary`
  PDF summary export.
- `/api/projects/[id]/submission-pack`
  ZIP export of approved documents.
